import React, { useState } from 'react';
import { useMessages, useMessagesLoading, useMessagesError } from '../context';
import { useApp } from '../context';
import { useCurrentUser } from '../context';
import { Message } from '../types';
import './MessageList.css';

/**
 * Message list component for displaying chat messages
 */
export const MessageList: React.FC = () => {
  const messages = useMessages();
  const isLoading = useMessagesLoading();
  const error = useMessagesError();
  const currentUser = useCurrentUser();
  const { deleteMessage } = useApp();
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);

  /**
   * Handle message deletion
   */
  const handleDeleteMessage = async (messageId: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        setDeletingMessageId(messageId);
        await deleteMessage(messageId);
      } catch (error) {
        console.error('Failed to delete message:', error);
        alert('Failed to delete message. Please try again.');
      } finally {
        setDeletingMessageId(null);
      }
    }
  };

  /**
   * Format author display name
   */
  const formatAuthor = (message: Message): string => {
    if (typeof message.author === 'string') {
      // Extract user ID from URL if possible
      const match = message.author.match(/\/user\/(\d+)$/);
      return match ? `User ${match[1]}` : 'Unknown User';
    }
    return message.author?.username || 'Unknown User';
  };

  /**
   * Check if current user can delete message
   */
  const canDeleteMessage = (message: Message): boolean => {
    if (!currentUser) return false;
    
    if (typeof message.author === 'object' && message.author.id) {
      return message.author.id === currentUser.id;
    }
    
    // Can't determine ownership if author is string URL
    return false;
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="message-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="message-list-error">
        <h3>Error Loading Messages</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  /**
   * Render empty state
   */
  if (!messages || messages.length === 0) {
    return (
      <div className="message-list-empty">
        <h3>No Messages Yet</h3>
        <p>Be the first to send a message!</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      <h2>Chat Messages</h2>
      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className="message-item">
            <div className="message-header">
              <span className="message-author">
                {formatAuthor(message)}
              </span>
              <span className="message-time">
                {new Date(message.createdAt).toLocaleString()}
              </span>
            </div>
            
            <div className="message-content">
              {message.msg}
            </div>
            
            {canDeleteMessage(message) && (
              <div className="message-actions">
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  disabled={deletingMessageId === message.id}
                  className="delete-button"
                  title="Delete message"
                >
                  {deletingMessageId === message.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageList;