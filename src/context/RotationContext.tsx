import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export type RotationPattern = 'none' | 'mixed' | 'random';

const STORAGE_KEY = 'wordCloud_rotation';

interface RotationState {
  pattern: RotationPattern;
}

interface RotationContextType {
  state: RotationState;
  setPattern: (pattern: RotationPattern) => void;
}

const RotationContext = createContext<RotationContextType | undefined>(undefined);

type RotationAction = 
  | { type: 'SET_PATTERN'; payload: RotationPattern };

const rotationReducer = (state: RotationState, action: RotationAction): RotationState => {
  switch (action.type) {
    case 'SET_PATTERN':
      return { ...state, pattern: action.payload };
    default:
      return state;
  }
};

const loadFromStorage = (): RotationState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'none' || stored === 'mixed' || stored === 'random') {
      return { pattern: stored };
    }
  } catch {
    // ignore
  }
  return { pattern: 'mixed' };
};

export const useRotationContext = () => {
  const context = useContext(RotationContext);
  if (context === undefined) {
    throw new Error('useRotationContext must be used within a RotationContextProvider');
  }
  return context;
};

interface RotationProviderProps {
  children: ReactNode;
}

export const RotationContextProvider: React.FC<RotationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(rotationReducer, undefined, loadFromStorage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, state.pattern);
    } catch {
      // ignore
    }
  }, [state.pattern]);

  const setPattern = (pattern: RotationPattern) => {
    dispatch({ type: 'SET_PATTERN', payload: pattern });
  };

  const value: RotationContextType = {
    state,
    setPattern,
  };

  return (
    <RotationContext.Provider value={value}>
      {children}
    </RotationContext.Provider>
  );
};
