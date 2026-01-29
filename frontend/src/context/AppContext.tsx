import React from 'react';
import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, Message } from '../types';
import { messageService, parseApiError } from '../services';
import { useAuth } from './AuthContext';

/**
 * App action types
 */
type AppAction =
  | { type: 'MESSAGES_LOAD_START' }
  | { type: 'MESSAGES_LOAD_SUCCESS'; payload: Message[] }
  | { type: 'MESSAGES_LOAD_FAILURE'; payload: string }
  | { type: 'MESSAGE_ADD'; payload: Message }
  | { type: 'MESSAGE_DELETE'; payload: number }
  | { type: 'MESSAGE_UPDATE'; payload: Message }
  | { type: 'MESSAGES_CLEAR_ERROR' };

/**
 * App reducer
 */
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'MESSAGES_LOAD_START':
      return {
        ...state,
        isLoadingMessages: true,
        messagesError: null
      };

    case 'MESSAGES_LOAD_SUCCESS':
      return {
        ...state,
        messages: action.payload,
        isLoadingMessages: false,
        messagesError: null
      };

    case 'MESSAGES_LOAD_FAILURE':
      return {
        ...state,
        isLoadingMessages: false,
        messagesError: action.payload
      };

    case 'MESSAGE_ADD':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };

    case 'MESSAGE_DELETE':
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload)
      };

    case 'MESSAGE_UPDATE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id ? action.payload : msg
        )
      };

    case 'MESSAGES_CLEAR_ERROR':
      return {
        ...state,
        messagesError: null
      };

    default:
      return state;
  }
};

/**
 * Initial app state
 */
const initialAppState: AppState = {
  messages: [],
  isLoadingMessages: false,
  messagesError: null
};

/**
 * App context type
 */
interface AppContextType extends AppState {
  loadMessages: () => Promise<void>;
  addMessage: (content: string) => Promise<void>;
  deleteMessage: (id: number) => Promise<void>;
  clearMessagesError: () => void;
  refreshMessages: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * App provider component
 */
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  const { isLoggedIn } = useAuth();

  /**
   * Load all messages
   */
  const loadMessages = async (): Promise<void> => {
    if (!isLoggedIn) {
      dispatch({ 
        type: 'MESSAGES_LOAD_FAILURE', 
        payload: 'You must be logged in to view messages' 
      });
      return;
    }

    try {
      dispatch({ type: 'MESSAGES_LOAD_START' });
      const messages = await messageService.getAllMessages();
      dispatch({ type: 'MESSAGES_LOAD_SUCCESS', payload: messages });
    } catch (error) {
      const apiError = parseApiError(error);
      const errorMessage = apiError.message || 'Failed to load messages';
      dispatch({ type: 'MESSAGES_LOAD_FAILURE', payload: errorMessage });
    }
  };

  /**
   * Add a new message
   */
  const addMessage = async (content: string): Promise<void> => {
    if (!isLoggedIn) {
      throw new Error('You must be logged in to send messages');
    }

    try {
      const message = await messageService.createMessage(content);
      dispatch({ type: 'MESSAGE_ADD', payload: message });
    } catch (error) {
      const apiError = parseApiError(error);
      throw new Error(apiError.message || 'Failed to send message');
    }
  };

  /**
   * Delete a message
   */
  const deleteMessage = async (id: number): Promise<void> => {
    try {
      await messageService.deleteMessage(id);
      dispatch({ type: 'MESSAGE_DELETE', payload: id });
    } catch (error) {
      const apiError = parseApiError(error);
      throw new Error(apiError.message || 'Failed to delete message');
    }
  };

  /**
   * Refresh messages (reload from server)
   */
  const refreshMessages = async (): Promise<void> => {
    await loadMessages();
  };

  /**
   * Clear messages error
   */
  const clearMessagesError = (): void => {
    dispatch({ type: 'MESSAGES_CLEAR_ERROR' });
  };

  /**
   * Auto-load messages when user logs in
   */
  useEffect(() => {
    if (isLoggedIn) {
      loadMessages();
    } else {
      // Clear messages when user logs out
      dispatch({ type: 'MESSAGES_LOAD_SUCCESS', payload: [] });
    }
  }, [isLoggedIn]);

  const contextValue: AppContextType = {
    ...state,
    loadMessages,
    addMessage,
    deleteMessage,
    clearMessagesError,
    refreshMessages
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Hook to use app context
 */
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

/**
 * Hook to get messages
 */
export const useMessages = (): Message[] => {
  const { messages } = useApp();
  return messages;
};

/**
 * Hook to get messages loading state
 */
export const useMessagesLoading = (): boolean => {
  const { isLoadingMessages } = useApp();
  return isLoadingMessages;
};

/**
 * Hook to get messages error
 */
export const useMessagesError = (): string | null => {
  const { messagesError } = useApp();
  return messagesError;
};