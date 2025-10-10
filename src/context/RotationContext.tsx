import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export type RotationPattern = 'none' | 'mixed' | 'random';

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
      return {
        ...state,
        pattern: action.payload,
      };
    default:
      return state;
  }
};

const initialState: RotationState = {
  pattern: 'mixed',
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
  const [state, dispatch] = useReducer(rotationReducer, initialState);

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
