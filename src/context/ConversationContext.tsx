import React, { createContext, useContext, useReducer, ReactNode, useEffect, useMemo } from 'react';
import { ConversationState, ConversationData, ConversationMessage } from '../types/wordCloud';

// localStorage key
const CONVERSATION_STORAGE_KEY = 'wordCloud_conversations';

// localStorage utility functions
const loadConversationsFromStorage = (): ConversationState => {
  try {
    const stored = localStorage.getItem(CONVERSATION_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert messages back to proper format if needed
      return {
        ...parsed,
        conversations: parsed.conversations || [],
        isLoading: false,
        error: null,
      };
    }
  } catch (error) {
    console.error('Error loading conversations from localStorage:', error);
  }
  return {
    conversations: [],
    isLoading: false,
    error: null,
  };
};

const saveConversationsToStorage = (state: ConversationState): void => {
  try {
    localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving conversations to localStorage:', error);
  }
};

// Action types
type ConversationAction =
  | { type: 'ADD_CONVERSATION'; payload: ConversationData }
  | { type: 'UPDATE_CONVERSATION'; payload: { conversationId: string; updates: Partial<ConversationData> } }
  | { type: 'TOGGLE_CONVERSATION'; payload: string }
  | { type: 'REMOVE_CONVERSATION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ALL' }
  | { type: 'LOAD_FROM_STORAGE'; payload: ConversationState };

// Initial state - load from localStorage
const initialState: ConversationState = loadConversationsFromStorage();

// Reducer
function conversationReducer(state: ConversationState, action: ConversationAction): ConversationState {
  switch (action.type) {
    case 'ADD_CONVERSATION':
      // Check if conversation already exists
      const existingIndex = state.conversations.findIndex(
        conv => conv.conversation_id === action.payload.conversation_id
      );
      
      if (existingIndex >= 0) {
        // Update existing conversation
        const updatedConversations = [...state.conversations];
        updatedConversations[existingIndex] = {
          ...updatedConversations[existingIndex],
          ...action.payload,
          lastUpdated: new Date().toISOString(),
        };
        return { ...state, conversations: updatedConversations };
      } else {
        // Add new conversation
        return {
          ...state,
          conversations: [
            ...state.conversations,
            {
              ...action.payload,
              lastUpdated: new Date().toISOString(),
            },
          ],
        };
      }

    case 'UPDATE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.conversation_id === action.payload.conversationId
            ? { ...conv, ...action.payload.updates, lastUpdated: new Date().toISOString() }
            : conv
        ),
      };

    case 'TOGGLE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.conversation_id === action.payload
            ? { ...conv, active: !conv.active, lastUpdated: new Date().toISOString() }
            : conv
        ),
      };

    case 'REMOVE_CONVERSATION':
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.conversation_id !== action.payload),
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ALL':
      return {
        conversations: [],
        isLoading: false,
        error: null,
      };

    case 'LOAD_FROM_STORAGE':
      return action.payload;

    default:
      return state;
  }
}

// Context
interface ConversationContextType {
  state: ConversationState;
  addConversation: (conversation: ConversationData) => void;
  updateConversation: (conversationId: string, updates: Partial<ConversationData>) => void;
  toggleConversation: (conversationId: string) => void;
  removeConversation: (conversationId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAll: () => void;
  loadFromStorage: () => void;
  getActiveConversations: () => ConversationData[];
  getAllMessages: () => ConversationMessage[];
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

// Provider component
interface ConversationProviderProps {
  children: ReactNode;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(conversationReducer, initialState);

  // Only persist conversations array — skip writes when only transient state changed
  useEffect(() => {
    saveConversationsToStorage(state);
  }, [state.conversations]);

  const addConversation = (conversation: ConversationData) => {
    dispatch({ type: 'ADD_CONVERSATION', payload: conversation });
  };

  const updateConversation = (conversationId: string, updates: Partial<ConversationData>) => {
    dispatch({ type: 'UPDATE_CONVERSATION', payload: { conversationId, updates } });
  };

  const toggleConversation = (conversationId: string) => {
    dispatch({ type: 'TOGGLE_CONVERSATION', payload: conversationId });
  };

  const removeConversation = (conversationId: string) => {
    dispatch({ type: 'REMOVE_CONVERSATION', payload: conversationId });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
    // Also clear from localStorage
    try {
      localStorage.removeItem(CONVERSATION_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing conversations from localStorage:', error);
    }
  };

  const loadFromStorage = () => {
    const storedState = loadConversationsFromStorage();
    dispatch({ type: 'LOAD_FROM_STORAGE', payload: storedState });
  };

  const getActiveConversations = () => {
    return state.conversations.filter(conv => conv.active);
  };

  const getAllMessages = () => {
    return state.conversations
      .filter(conv => conv.active)
      .flatMap(conv => conv.messages);
  };

  const value: ConversationContextType = useMemo(() => ({
    state,
    addConversation,
    updateConversation,
    toggleConversation,
    removeConversation,
    setLoading,
    setError,
    clearAll,
    loadFromStorage,
    getActiveConversations,
    getAllMessages,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [state]);

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};

// Hook to use the context
export const useConversationContext = (): ConversationContextType => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversationContext must be used within a ConversationProvider');
  }
  return context;
};
