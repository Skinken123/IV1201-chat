import React from 'react';
import { useCurrentUser, useAuth } from '../context';
import './UserInfo.css';

/**
 * User info component for displaying current user and logout
 */
export const UserInfo: React.FC = () => {
  const currentUser = useCurrentUser();
  const { logout } = useAuth();

  if (!currentUser) {
    return null;
  }

  /**
   * Handle logout
   */
  const handleLogout = (): void => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="user-info">
      <div className="user-details">
        <span className="user-label">Logged in as:</span>
        <span className="username">{currentUser.username}</span>
      </div>
      
      <div className="user-actions">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserInfo;