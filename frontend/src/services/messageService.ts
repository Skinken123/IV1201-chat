import { apiClient } from './api';
import type { Message } from '../types';

/**
 * Message service for handling message-related operations
 */
export class MessageService {
  /**
   * Get all messages from the server
   */
  async getAllMessages(): Promise<Message[]> {
    try {
      const messages = await apiClient.getAllMessages();
      return this.processMessages(messages);
    } catch (error) {
      throw new Error(`Failed to fetch messages: ${(error as Error).message}`);
    }
  }

  /**
   * Create and send a new message
   */
  async createMessage(content: string): Promise<Message> {
    // Validate message content
    const validation = this.validateMessage(content);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    try {
      const message = await apiClient.createMessage(validation.content!);
      return this.processMessage(message);
    } catch (error) {
      throw new Error(`Failed to create message: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a message by ID
   */
  async deleteMessage(id: number): Promise<void> {
    if (!id || id <= 0) {
      throw new Error('Valid message ID is required');
    }

    try {
      await apiClient.deleteMessage(id);
    } catch (error) {
      throw new Error(`Failed to delete message: ${(error as Error).message}`);
    }
  }

  /**
   * Process messages from API response
   * Convert author URLs to user objects where possible
   */
  private processMessages(messages: Message[]): Message[] {
    return messages.map(message => this.processMessage(message));
  }

  /**
   * Process individual message from API response
   */
  private processMessage(message: Message): Message {
    // If author is a string URL, we might want to convert it to a user object
    // For now, we'll keep it as is since the backend returns the URL
    return message;
  }

  /**
   * Validate message content
   */
  validateMessage(content: string): { isValid: boolean; content?: string; error?: string } {
    if (!content || typeof content !== 'string') {
      return { isValid: false, error: 'Message content is required' };
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }

    if (trimmedContent.length > 1000) {
      return { isValid: false, error: 'Message cannot exceed 1000 characters' };
    }

    return { isValid: true, content: trimmedContent };
  }

  /**
   * Format message for display
   */
  formatMessage(message: Message): { 
    id: number; 
    content: string; 
    author: string; 
    timestamp: string;
    canDelete: boolean;
    currentUserId?: number;
  } {
    return {
      id: message.id,
      content: message.msg,
      author: typeof message.author === 'string' 
        ? this.extractUsernameFromUrl(message.author)
        : message.author.username,
      timestamp: new Date(message.createdAt).toLocaleString(),
      canDelete: false, // Will be set by component based on current user
    };
  }

  /**
   * Extract username from author URL
   */
  private extractUsernameFromUrl(authorUrl: string): string {
    // If author is a URL like "http://localhost:8001/user/1"
    // we can't get the username without another API call
    // For now, return a formatted version
    if (authorUrl.includes('/user/')) {
      const userId = authorUrl.split('/user/')[1];
      return `User ${userId}`;
    }
    return 'Unknown User';
  }

  /**
   * Check if user can delete a message
   */
  canUserDeleteMessage(message: Message, currentUserId: number | null): boolean {
    if (!currentUserId) return false;
    
    if (typeof message.author === 'object' && message.author.id) {
      return message.author.id === currentUserId;
    }
    
    // If author is a string URL, we can't determine ownership without more info
    return false;
  }
}

// Export singleton instance
export const messageService = new MessageService();