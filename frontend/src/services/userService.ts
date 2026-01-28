import { apiClient } from './api';
import { User } from '../types';

/**
 * User service for handling user-related operations
 */
export class UserService {
  /**
   * Login user with username
   */
  async login(username: string): Promise<void> {
    // Validate username
    if (!username || username.trim().length === 0) {
      throw new Error('Username cannot be empty');
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(username.trim())) {
      throw new Error('Username can only contain letters and numbers');
    }

    await apiClient.login(username.trim());
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User> {
    if (!id || id <= 0) {
      throw new Error('Valid user ID is required');
    }

    return await apiClient.getUser(id);
  }

  /**
   * Get current user info (would need to be implemented in backend)
   * For now, this is a placeholder that would need backend support
   */
  async getCurrentUser(): Promise<User | null> {
    // This would require a backend endpoint like GET /api/user/me
    // For now, return null as this functionality doesn't exist in the backend
    return null;
  }

  /**
   * Validate username format
   */
  validateUsername(username: string): { isValid: boolean; error?: string } {
    if (!username || username.trim().length === 0) {
      return { isValid: false, error: 'Username cannot be empty' };
    }

    const trimmedUsername = username.trim();
    
    if (trimmedUsername.length < 1) {
      return { isValid: false, error: 'Username must have at least 1 character' };
    }

    if (trimmedUsername.length > 50) {
      return { isValid: false, error: 'Username cannot exceed 50 characters' };
    }

    if (!/^[a-zA-Z0-9]+$/.test(trimmedUsername)) {
      return { isValid: false, error: 'Username can only contain letters and numbers' };
    }

    return { isValid: true };
  }
}

// Export singleton instance
export const userService = new UserService();