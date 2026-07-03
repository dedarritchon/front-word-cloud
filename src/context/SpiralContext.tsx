import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

export type SpiralType = 'archimedean' | 'rectangular';

const STORAGE_KEY = 'wordCloud_spiral';

interface SpiralState {
  spiral: SpiralType;
}

interface SpiralContextType {
  state: SpiralState;
  setSpiral: (spiral: SpiralType) => void;
}

const SpiralContext = createContext<SpiralContextType | undefined>(undefined);

type SpiralAction = 
  | { type: 'SET_SPIRAL'; payload: SpiralType };

const spiralReducer = (state: SpiralState, action: SpiralAction): SpiralState => {
  switch (action.type) {
    case 'SET_SPIRAL':
      return { ...state, spiral: action.payload };
    default:
      return state;
  }
};

const loadFromStorage = (): SpiralState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'archimedean' || stored === 'rectangular') {
      return { spiral: stored };
    }
  } catch {
    // ignore
  }
  return { spiral: 'archimedean' };
};

interface SpiralProviderProps {
  children: ReactNode;
}

export const SpiralProvider: React.FC<SpiralProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(spiralReducer, undefined, loadFromStorage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, state.spiral);
    } catch {
      // ignore
    }
  }, [state.spiral]);

  const setSpiral = (spiral: SpiralType) => {
    dispatch({ type: 'SET_SPIRAL', payload: spiral });
  };

  return (
    <SpiralContext.Provider value={{ state, setSpiral }}>
      {children}
    </SpiralContext.Provider>
  );
};

export const useSpiralContext = (): SpiralContextType => {
  const context = useContext(SpiralContext);
  if (context === undefined) {
    throw new Error('useSpiralContext must be used within a SpiralProvider');
  }
  return context;
};
