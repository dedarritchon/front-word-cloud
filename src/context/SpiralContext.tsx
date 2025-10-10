import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export type SpiralType = 'archimedean' | 'rectangular';

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
      return {
        ...state,
        spiral: action.payload,
      };
    default:
      return state;
  }
};

const initialState: SpiralState = {
  spiral: 'archimedean',
};

interface SpiralProviderProps {
  children: ReactNode;
}

export const SpiralProvider: React.FC<SpiralProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(spiralReducer, initialState);

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
