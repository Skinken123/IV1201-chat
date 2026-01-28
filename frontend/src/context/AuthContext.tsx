import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { userService, parseApiError, isAuthError } from '../services';

/**
 * Authentication action types
 */
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' };

/**
 * Authentication reducer
 */
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isLoggedIn: true,
        isLoading: false,
        error: null
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isLoggedIn: false,
        isLoading: false,
        error: action.payload
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isLoggedIn: false,
        isLoading: false,
        error: null
      };

    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

/**
 * Initial auth state
 */
const initialAuthState: AuthState = {
  user: null,
  isLoggedIn: false,
  isLoading: false,
  error: null
};

/**
 * Authentication context
 */
interface AuthContextType extends AuthState {
  login: (username: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication provider component
 */
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  /**
   * Check authentication status on component mount
   */
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // For now, we can't check auth status without a backend endpoint
        // This would require a backend endpoint like GET /api/user/me
        // For now, we'll assume user is not logged in
        dispatch({ type: 'AUTH_LOGOUT' });
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * Login user
   */
  const login = async (username: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      // Validate username first
      const validation = userService.validateUsername(username);
      if (!validation.isValid) {
        dispatch({ type: 'AUTH_FAILURE', payload: validation.error! });
        return;
      }

      // Attempt login
      await userService.login(username);
      
      // Note: We can't get user data from current backend
      // In a real implementation, the login should return user data
      // For now, we'll create a minimal user object
      const user: User = {
        id: 0, // Would come from backend
        username: username.trim(),
        loggedInUntil: null, // Would come from backend
        createdAt: new Date(),
        updatedAt: new Date()
      };

      dispatch({ type: 'AUTH_SUCCESS', payload: user });

    } catch (error) {
      const apiError = parseApiError(error);
      const errorMessage = isAuthError(apiError) 
        ? 'Login failed. Please check your username and try again.'
        : apiError.message;

      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
    }
  };

  /**
   * Logout user
   */
  const logout = (): void => {
    // In a real implementation, we might need to call a logout endpoint
    // For now, just clear the local state
    // JWT cookie will be cleared by the browser when it expires
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  /**
   * Clear auth error
   */
  const clearError = (): void => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Hook to get authentication state only
 */
export const useAuthState = (): AuthState => {
  const { user, isLoggedIn, isLoading, error } = useAuth();
  return { user, isLoggedIn, isLoading, error };
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const { isLoggedIn, isLoading } = useAuth();
  return isLoggedIn && !isLoading;
};

/**
 * Hook to get current user
 */
export const useCurrentUser = (): User | null => {
  const { user } = useAuth();
  return user;
};