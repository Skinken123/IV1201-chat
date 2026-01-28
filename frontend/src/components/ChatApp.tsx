import React from 'react';
import { useIsAuthenticated } from '../context';
import Login from './Login';
import MessageList from './MessageList';
import MessageForm from './MessageForm';
import UserInfo from './UserInfo';
import './ChatApp.css';

/**
 * Main chat application component
 */
export const ChatApp: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return (
      <div className="chat-app">
        <Login />
      </div>
    );
  }

  return (
    <div className="chat-app">
      <div className="chat-header">
        <UserInfo />
      </div>
      
      <div className="chat-content">
        <div className="messages-section">
          <MessageList />
        </div>
        
        <div className="form-section">
          <MessageForm />
        </div>
      </div>
    </div>
  );
};

export default ChatApp;