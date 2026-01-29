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
  LOGIN: '/user/login',
  GET_USER: (id: number) => `/user/${id}`,
  
  // Message endpoints
  GET_ALL_MESSAGES: '/msg',
  CREATE_MESSAGE: '/msg',
  DELETE_MESSAGE: (id: number) => `/msg/${id}`,
  
  // Root endpoint
  ROOT: '/'
} as const;

/**
 * Default API configuration
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  baseURL: '/api',
  timeout: 10000
};