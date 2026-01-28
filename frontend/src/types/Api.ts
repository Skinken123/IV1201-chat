/**
 * API client configuration
 */
export interface ApiConfig {
  baseURL: string;
  timeout: number;
}

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  // User endpoints
  LOGIN: '/api/user/login',
  GET_USER: (id: number) => `/api/user/${id}`,
  
  // Message endpoints
  GET_ALL_MESSAGES: '/api/msg',
  CREATE_MESSAGE: '/api/msg',
  DELETE_MESSAGE: (id: number) => `/api/msg/${id}`,
  
  // Root endpoint
  ROOT: '/api'
} as const;

/**
 * Default API configuration
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  baseURL: '/api',
  timeout: 10000
};