import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import chroma from 'chroma-js';

// Local storage key for color settings
const COLOR_STORAGE_KEY = 'wordCloud_colorSettings';

// Default color values
const DEFAULT_BASE_COLOR = '#584def'; // Purple
const DEFAULT_GRADIENT_STEPS = 10;
const DEFAULT_COLOR_MODE: 'light' | 'dark' | 'auto' = 'auto';

export interface ColorState {
  baseColor: string;
  colors: string[];
  gradientSteps: number;
  colorMode: 'light' | 'dark' | 'auto';
  isUpdating: boolean;
  previewBaseColor: string; // Separate preview color that doesn't trigger re-renders
}

export interface ColorContextType {
  state: ColorState;
  setBaseColor: (color: string) => void;
  setBaseColorImmediate: (color: string) => void;
  setBaseColorPreview: (color: string) => void;
  setGradientSteps: (steps: number) => void;
  setColorMode: (mode: 'light' | 'dark' | 'auto') => void;
  generateGradient: (baseColor: string, steps: number, mode: 'light' | 'dark' | 'auto') => string[];
  resetToDefault: () => void;
}

// Helper functions for localStorage operations
const saveColorSettingsToStorage = (settings: { baseColor: string; gradientSteps: number; colorMode: 'light' | 'dark' | 'auto' }) => {
  try {
    localStorage.setItem(COLOR_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save color settings to localStorage:', error);
  }
};

const loadColorSettingsFromStorage = (): { baseColor: string; gradientSteps: number; colorMode: 'light' | 'dark' | 'auto' } | null => {
  try {
    const stored = localStorage.getItem(COLOR_STORAGE_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      if (settings && typeof settings.baseColor === 'string' && 
          typeof settings.gradientSteps === 'number' && 
          ['light', 'dark', 'auto'].includes(settings.colorMode)) {
        return settings;
      }
    }
  } catch (error) {
    console.warn('Failed to load color settings from localStorage:', error);
  }
  return null;
};

const clearColorSettingsFromStorage = () => {
  try {
    localStorage.removeItem(COLOR_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear color settings from localStorage:', error);
  }
};

// Generate default color state
const getDefaultColorState = (): ColorState => {
  const storedSettings = loadColorSettingsFromStorage();
  const baseColor = storedSettings?.baseColor || DEFAULT_BASE_COLOR;
  const gradientSteps = storedSettings?.gradientSteps || DEFAULT_GRADIENT_STEPS;
  const colorMode = storedSettings?.colorMode || DEFAULT_COLOR_MODE;
  
  // Generate initial colors from base color
  const generateInitialColors = (): string[] => {
    try {
      const color = chroma(baseColor);
      const lighter = color.brighten(1.5);
      const darker = color.darken(1.5);
      return chroma.scale([darker, color, lighter])
        .mode('lch')
        .colors(gradientSteps);
    } catch (error) {
      console.error('Error generating initial colors:', error);
      // Fallback to a simple gradient
      return chroma.scale(['#2d1b69', baseColor, '#8b5cf6'])
        .mode('lch')
        .colors(gradientSteps);
    }
  };

  return {
    baseColor,
    colors: generateInitialColors(),
    gradientSteps,
    colorMode,
    isUpdating: false,
    previewBaseColor: baseColor,
  };
};

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export const useColorContext = (): ColorContextType => {
  const context = useContext(ColorContext);
  if (!context) {
    throw new Error('useColorContext must be used within a ColorContextProvider');
  }
  return context;
};

interface ColorContextProviderProps {
  children: ReactNode;
}

export const ColorContextProvider: React.FC<ColorContextProviderProps> = ({ children }) => {
  const [state, setState] = useState<ColorState>(getDefaultColorState());

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const generateGradient = useCallback((
    baseColor: string, 
    steps: number, 
    mode: 'light' | 'dark' | 'auto'
  ): string[] => {
    try {
      const color = chroma(baseColor);
      
      let colors: string[];
      
      switch (mode) {
        case 'light':
          // Generate lighter variations
          colors = chroma.scale([color.brighten(2), color])
            .mode('lch')
            .colors(steps);
          break;
        case 'dark':
          // Generate darker variations
          colors = chroma.scale([color, color.darken(2)])
            .mode('lch')
            .colors(steps);
          break;
        case 'auto':
        default:
          // Generate a balanced gradient with both lighter and darker variations
          const lighter = color.brighten(1.5);
          const darker = color.darken(1.5);
          colors = chroma.scale([darker, color, lighter])
            .mode('lch')
            .colors(steps);
          break;
      }
      
      return colors;
    } catch (error) {
      console.error('Error generating gradient:', error);
      // Fallback to a simple gradient
      return chroma.scale(['#2d1b69', baseColor, '#8b5cf6'])
        .mode('lch')
        .colors(steps);
    }
  }, []);

  // Preview color setting (for color picker input during dragging - no gradient generation)
  const setBaseColorPreview = useCallback((color: string) => {
    // Only update the preview color for UI feedback, no gradient generation or word cloud re-renders
    setState(prevState => ({
      ...prevState,
      previewBaseColor: color,
      isUpdating: false,
    }));
  }, []);

  // Debounced color setting (for final color selection)
  const setBaseColor = useCallback((color: string) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Update both base color and preview color for UI feedback
    setState(prevState => ({
      ...prevState,
      baseColor: color,
      previewBaseColor: color,
      isUpdating: true,
    }));

    // Debounce the gradient generation with longer delay
    debounceTimerRef.current = setTimeout(() => {
      setState(prevState => {
        const newColors = generateGradient(color, prevState.gradientSteps, prevState.colorMode);
        const newState = {
          ...prevState,
          baseColor: color,
          previewBaseColor: color,
          colors: newColors,
          isUpdating: false,
        };
        
        // Save to localStorage
        saveColorSettingsToStorage({
          baseColor: color,
          gradientSteps: prevState.gradientSteps,
          colorMode: prevState.colorMode,
        });
        
        return newState;
      });
    }, 800); // 800ms debounce delay - only triggers when user stops dragging
  }, [generateGradient]);

  // Immediate color setting (for preset colors and other instant updates)
  const setBaseColorImmediate = useCallback((color: string) => {
    // Clear any pending debounced updates
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setState(prevState => {
      const newColors = generateGradient(color, prevState.gradientSteps, prevState.colorMode);
      const newState = {
        ...prevState,
        baseColor: color,
        previewBaseColor: color,
        colors: newColors,
        isUpdating: false,
      };
      
      // Save to localStorage
      saveColorSettingsToStorage({
        baseColor: color,
        gradientSteps: prevState.gradientSteps,
        colorMode: prevState.colorMode,
      });
      
      return newState;
    });
  }, [generateGradient]);

  const setGradientSteps = useCallback((steps: number) => {
    setState(prevState => {
      const newColors = generateGradient(prevState.baseColor, steps, prevState.colorMode);
      const newState = {
        ...prevState,
        gradientSteps: steps,
        colors: newColors,
      };
      
      // Save to localStorage
      saveColorSettingsToStorage({
        baseColor: prevState.baseColor,
        gradientSteps: steps,
        colorMode: prevState.colorMode,
      });
      
      return newState;
    });
  }, [generateGradient]);

  const setColorMode = useCallback((mode: 'light' | 'dark' | 'auto') => {
    setState(prevState => {
      const newColors = generateGradient(prevState.baseColor, prevState.gradientSteps, mode);
      const newState = {
        ...prevState,
        colorMode: mode,
        colors: newColors,
      };
      
      // Save to localStorage
      saveColorSettingsToStorage({
        baseColor: prevState.baseColor,
        gradientSteps: prevState.gradientSteps,
        colorMode: mode,
      });
      
      return newState;
    });
  }, [generateGradient]);

  const resetToDefault = useCallback(() => {
    // Clear any pending debounced updates
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Clear localStorage and reset to default
    clearColorSettingsFromStorage();
    setState(getDefaultColorState());
  }, []);

  // Cleanup effect to clear timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const contextValue: ColorContextType = {
    state,
    setBaseColor,
    setBaseColorImmediate,
    setBaseColorPreview,
    setGradientSteps,
    setColorMode,
    generateGradient,
    resetToDefault,
  };

  return (
    <ColorContext.Provider value={contextValue}>
      {children}
    </ColorContext.Provider>
  );
};
