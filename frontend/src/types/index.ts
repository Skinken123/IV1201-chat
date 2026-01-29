// Export all types from individual type files
export * from './User';
export * from './Message';
export * from './Common';
export * from './Api';

// Re-export commonly used combinations for easier importing
export type { 
  User, 
  LoginRequest, 
  UserResponse, 
  ErrorResponse 
} from './User';

export type { 
  Message, 
  CreateMessageRequest, 
  MessageResponse, 
  MessageWithAuthor 
} from './Message';

export type { 
  ApiResponse, 
  AuthState, 
  AppState, 
  ValidationError
} from './Common';

export { HttpStatus } from './Common';

export { 
  API_ENDPOINTS, 
  DEFAULT_API_CONFIG 
} from './Api';

export type { ApiConfig } from './Api';