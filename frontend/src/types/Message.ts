import type { User } from './User';

/**
 * Message interface matching backend MsgDTO
 */
export interface Message {
  id: number;
  msg: string;
  author: User | string; // API returns URL string for author
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * API request for creating a message
 */
export interface CreateMessageRequest {
  msg: string;
}

/**
 * API response for message data
 */
export interface MessageResponse {
  success: Message;
}

/**
 * API response for all messages
 */
export interface MessagesResponse {
  success: Message[];
}

/**
 * Enhanced message with parsed author
 */
export interface MessageWithAuthor extends Message {
  author: User;
}