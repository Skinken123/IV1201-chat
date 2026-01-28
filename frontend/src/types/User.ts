/**
 * User interface matching backend UserDTO
 */
export interface User {
  id: number;
  username: string;
  loggedInUntil: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * API request for user login
 */
export interface LoginRequest {
  username: string;
}

/**
 * API response for successful login
 */
export interface LoginResponse {
  success: string;
}

/**
 * API response for user data
 */
export interface UserResponse {
  success: User;
}

/**
 * API error response
 */
export interface ErrorResponse {
  error: string | import('./Common').ValidationError[];
}