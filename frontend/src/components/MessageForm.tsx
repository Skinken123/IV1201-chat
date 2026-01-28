import React, { useState, FormEvent } from 'react';
import { useApp } from '../context';
import './MessageForm.css';

/**
 * Message form component for sending new messages
 */
export const MessageForm: React.FC = () => {
  const { addMessage } = useApp();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return;
    }

    try {
      setIsSubmitting(true);
      await addMessage(trimmedMessage);
      setMessage(''); // Clear form on success
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle textarea change
   */
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setMessage(e.target.value);
  };

  /**
   * Handle key press in textarea
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const messageLength = message.trim().length;
  const maxLength = 1000;
  const remainingChars = maxLength - messageLength;

  return (
    <div className="message-form-container">
      <form onSubmit={handleSubmit} className="message-form">
        <div className="form-group">
          <label htmlFor="message">Your Message:</label>
          <textarea
            id="message"
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            disabled={isSubmitting}
            className="message-input"
            rows={3}
            maxLength={maxLength}
            required
          />
          
          <div className="message-meta">
            <span className={`char-count ${remainingChars < 50 ? 'warning' : ''}`}>
              {remainingChars} characters remaining
            </span>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="send-button"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </div>

        <div className="form-help">
          <p>
            <strong>Tips:</strong>
          </p>
          <ul>
            <li>Press <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for new line</li>
            <li>Maximum message length is {maxLength} characters</li>
            <li>Messages cannot be empty</li>
          </ul>
        </div>
      </form>
    </div>
  );
};

export default MessageForm;