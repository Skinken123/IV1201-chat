/**
 * Utility functions for API operations
 */

/**
 * API Error class for consistent error handling
 */
export class ApiError extends Error {
  public status?: number;
  public code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Parse and handle API errors consistently
 */
export function parseApiError(error: any): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    let message = 'Unknown error';
    if (data?.error) {
      if (Array.isArray(data.error)) {
        // Validation errors array
        message = data.error.map((err: any) => err.msg || err.message).join(', ');
      } else if (typeof data.error === 'string') {
        message = data.error;
      }
    } else if (data?.message) {
      message = data.message;
    } else if (error.message) {
      message = error.message;
    }

    return new ApiError(message, status);
  }

  if (error.request) {
    // Request was made but no response received
    return new ApiError('Network error - unable to connect to server', 0, 'NETWORK_ERROR');
  }

  // Something else happened
  return new ApiError(error.message || 'Unknown error occurred', 0, 'UNKNOWN_ERROR');
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: ApiError): boolean {
  return error.status === 401 || error.code === 'AUTH_ERROR';
}

/**
 * Check if error is validation related
 */
export function isValidationError(error: ApiError): boolean {
  return error.status === 400 || error.code === 'VALIDATION_ERROR';
}

/**
 * Check if error is network related
 */
export function isNetworkError(error: ApiError): boolean {
  return error.status === 0 || error.code === 'NETWORK_ERROR';
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: ApiError): string {
  if (isNetworkError(error)) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  if (isAuthError(error)) {
    return 'You need to be logged in to perform this action.';
  }

  if (isValidationError(error)) {
    return error.message || 'Invalid input provided.';
  }

  return error.message || 'An unexpected error occurred.';
}

/**
 * Retry configuration for API calls
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition?: (error: ApiError) => boolean;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error) => isNetworkError(error)
};

/**
 * Execute function with retry logic
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: ApiError;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = parseApiError(error);
      
      // Don't retry on last attempt or if retry condition fails
      if (attempt === config.maxRetries || 
          (config.retryCondition && !config.retryCondition(lastError))) {
        throw lastError;
      }

      // Wait before retry
      await new Promise(resolve => 
        setTimeout(resolve, config.retryDelay * Math.pow(2, attempt))
      );
    }
  }

  throw lastError!;
}

/**
 * Debounce function for API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}