/**
 * API validation error from express-validator
 */
export interface ValidationError {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
}

/**
 * Common API response wrapper
 */
export interface ApiResponse<T = any> {
  success?: T;
  error?: string | ValidationError[];
}

/**
 * HTTP status codes
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;

export type HttpStatus = typeof HttpStatus[keyof typeof HttpStatus];

/**
 * Authentication context state
 */
export interface AuthState {
  user: import('./User').User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Application context state
 */
export interface AppState {
  messages: import('./Message').Message[];
  isLoadingMessages: boolean;
  messagesError: string | null;
}