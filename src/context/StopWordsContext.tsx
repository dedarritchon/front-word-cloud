import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { StopWordsState } from '../types/wordCloud';
import { DEFAULT_STOP_WORDS } from '../constants/stopWords';

// Local storage key for stop words
const STOP_WORDS_STORAGE_KEY = 'wordCloud_stopWords';

// Helper functions for localStorage operations
const saveStopWordsToStorage = (stopWords: Set<string>) => {
  try {
    const stopWordsArray = Array.from(stopWords);
    localStorage.setItem(STOP_WORDS_STORAGE_KEY, JSON.stringify(stopWordsArray));
  } catch (error) {
    console.warn('Failed to save stop words to localStorage:', error);
  }
};

const loadStopWordsFromStorage = (): Set<string> | null => {
  try {
    const stored = localStorage.getItem(STOP_WORDS_STORAGE_KEY);
    if (stored) {
      const stopWordsArray = JSON.parse(stored);
      if (Array.isArray(stopWordsArray)) {
        return new Set(stopWordsArray);
      }
    }
  } catch (error) {
    console.warn('Failed to load stop words from localStorage:', error);
  }
  return null;
};

const clearStopWordsFromStorage = () => {
  try {
    localStorage.removeItem(STOP_WORDS_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear stop words from localStorage:', error);
  }
};

type StopWordsAction =
  | { type: 'ADD_STOP_WORD'; payload: string }
  | { type: 'REMOVE_STOP_WORD'; payload: string }
  | { type: 'TOGGLE_STOP_WORD'; payload: string }
  | { type: 'RESET_TO_DEFAULT' }
  | { type: 'CLEAR_STORAGE' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STOP_WORDS'; payload: Set<string> };

// Initialize state with localStorage data if available, otherwise use defaults
const getInitialState = (): StopWordsState => {
  const storedStopWords = loadStopWordsFromStorage();
  return {
    stopWords: storedStopWords || new Set(DEFAULT_STOP_WORDS),
    isLoading: false,
    error: null,
  };
};

const initialState: StopWordsState = getInitialState();

function stopWordsReducer(state: StopWordsState, action: StopWordsAction): StopWordsState {
  let newState: StopWordsState;

  switch (action.type) {
    case 'ADD_STOP_WORD': {
      const newStopWords = new Set(state.stopWords);
      newStopWords.add(action.payload.toLowerCase().trim());
      newState = {
        ...state,
        stopWords: newStopWords,
        error: null,
      };
      break;
    }
    case 'REMOVE_STOP_WORD': {
      const newStopWords = new Set(state.stopWords);
      newStopWords.delete(action.payload.toLowerCase().trim());
      newState = {
        ...state,
        stopWords: newStopWords,
        error: null,
      };
      break;
    }
    case 'TOGGLE_STOP_WORD': {
      const newStopWords = new Set(state.stopWords);
      const word = action.payload.toLowerCase().trim();
      if (newStopWords.has(word)) {
        newStopWords.delete(word);
      } else {
        newStopWords.add(word);
      }
      newState = {
        ...state,
        stopWords: newStopWords,
        error: null,
      };
      break;
    }
    case 'RESET_TO_DEFAULT':
      newState = {
        ...state,
        stopWords: new Set(DEFAULT_STOP_WORDS),
        error: null,
      };
      break;
    case 'CLEAR_STORAGE':
      clearStopWordsFromStorage();
      newState = {
        ...state,
        stopWords: new Set(DEFAULT_STOP_WORDS),
        error: null,
      };
      break;
    case 'SET_LOADING':
      newState = {
        ...state,
        isLoading: action.payload,
      };
      break;
    case 'SET_ERROR':
      newState = {
        ...state,
        error: action.payload,
        isLoading: false,
      };
      break;
    case 'SET_STOP_WORDS':
      newState = {
        ...state,
        stopWords: new Set(action.payload),
        error: null,
      };
      break;
    default:
      return state;
  }

  // Save to localStorage whenever stop words change
  if (action.type !== 'SET_LOADING' && action.type !== 'SET_ERROR') {
    saveStopWordsToStorage(newState.stopWords);
  }

  return newState;
}

interface StopWordsContextType {
  state: StopWordsState;
  addStopWord: (word: string) => void;
  removeStopWord: (word: string) => void;
  toggleStopWord: (word: string) => void;
  resetToDefault: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isStopWord: (word: string) => boolean;
  getStopWordsArray: () => string[];
}

const StopWordsContext = createContext<StopWordsContextType | undefined>(undefined);

interface StopWordsProviderProps {
  children: ReactNode;
}

export const StopWordsProvider: React.FC<StopWordsProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(stopWordsReducer, initialState);

  const addStopWord = (word: string) => {
    const trimmedWord = word.toLowerCase().trim();
    if (trimmedWord && !state.stopWords.has(trimmedWord)) {
      dispatch({ type: 'ADD_STOP_WORD', payload: trimmedWord });
    }
  };

  const removeStopWord = (word: string) => {
    dispatch({ type: 'REMOVE_STOP_WORD', payload: word });
  };

  const toggleStopWord = (word: string) => {
    dispatch({ type: 'TOGGLE_STOP_WORD', payload: word });
  };

  const resetToDefault = () => {
    dispatch({ type: 'RESET_TO_DEFAULT' });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const isStopWord = (word: string) => {
    return state.stopWords.has(word.toLowerCase().trim());
  };

  const getStopWordsArray = () => {
    return Array.from(state.stopWords).sort();
  };

  const value: StopWordsContextType = {
    state,
    addStopWord,
    removeStopWord,
    toggleStopWord,
    resetToDefault,
    setLoading,
    setError,
    isStopWord,
    getStopWordsArray,
  };

  return (
    <StopWordsContext.Provider value={value}>
      {children}
    </StopWordsContext.Provider>
  );
};

export const useStopWordsContext = (): StopWordsContextType => {
  const context = useContext(StopWordsContext);
  if (context === undefined) {
    throw new Error('useStopWordsContext must be used within a StopWordsProvider');
  }
  return context;
};
