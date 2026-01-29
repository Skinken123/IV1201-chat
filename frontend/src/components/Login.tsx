import React from 'react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context';
import './Login.css';

/**
 * Login component for user authentication
 */
export const Login: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const [username, setUsername] = useState('');

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!username.trim()) {
      return;
    }

    try {
      await login(username.trim());
    } catch (error) {
      // Error is handled by context
      console.error('Login failed:', error);
    }
  };

  /**
   * Handle input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.target.value);
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login to Chat</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              disabled={isLoading}
              className="login-input"
              autoComplete="username"
              autoFocus
              required
            />
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="login-button"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-info">
          <p>
            <strong>Note:</strong> This is a simple login system that only requires a username.
            No password is needed for this demo application.
          </p>
          <p>
            Username can only contain letters and numbers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;