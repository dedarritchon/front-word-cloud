import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

const STORAGE_KEY = 'wordCloud_minOccurrences';
const DEFAULT_MIN_OCCURRENCES = 2;

interface MinOccurrencesState {
  minOccurrences: number;
}

interface MinOccurrencesContextType {
  state: MinOccurrencesState;
  setMinOccurrences: (value: number) => void;
}

const MinOccurrencesContext = createContext<MinOccurrencesContextType | undefined>(undefined);

type MinOccurrencesAction = { type: 'SET_MIN_OCCURRENCES'; payload: number };

const reducer = (state: MinOccurrencesState, action: MinOccurrencesAction): MinOccurrencesState => {
  switch (action.type) {
    case 'SET_MIN_OCCURRENCES':
      return { ...state, minOccurrences: action.payload };
    default:
      return state;
  }
};

const loadFromStorage = (): MinOccurrencesState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        return { minOccurrences: parsed };
      }
    }
  } catch {
    // ignore
  }
  return { minOccurrences: DEFAULT_MIN_OCCURRENCES };
};

interface MinOccurrencesProviderProps {
  children: ReactNode;
}

export const MinOccurrencesProvider: React.FC<MinOccurrencesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, loadFromStorage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(state.minOccurrences));
    } catch {
      // ignore
    }
  }, [state.minOccurrences]);

  const setMinOccurrences = (value: number) => {
    dispatch({ type: 'SET_MIN_OCCURRENCES', payload: Math.max(1, value) });
  };

  return (
    <MinOccurrencesContext.Provider value={{ state, setMinOccurrences }}>
      {children}
    </MinOccurrencesContext.Provider>
  );
};

export const useMinOccurrencesContext = (): MinOccurrencesContextType => {
  const context = useContext(MinOccurrencesContext);
  if (context === undefined) {
    throw new Error('useMinOccurrencesContext must be used within a MinOccurrencesProvider');
  }
  return context;
};
