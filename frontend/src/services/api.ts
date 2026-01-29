import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  User, 
  Message, 
  LoginRequest, 
  CreateMessageRequest,
  ApiResponse,
  UserResponse,
  MessageResponse,
  MessagesResponse,
  LoginResponse
} from '../types';
import { 
  API_ENDPOINTS,
  DEFAULT_API_CONFIG,
  HttpStatus
} from '../types';

/**
 * API Client for interacting with the chat backend
 */
class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: DEFAULT_API_CONFIG.baseURL,
      timeout: DEFAULT_API_CONFIG.timeout,
      withCredentials: true, // Important for JWT cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for error handling
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for global error handling
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === HttpStatus.UNAUTHORIZED) {
          // Handle unauthorized - could trigger logout
          console.warn('User unauthorized - may need to re-login');
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Handle API errors consistently
   */
  private handleApiError(error: any): never {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.error || data?.message || `HTTP ${status} error`;
      throw new Error(`${status}: ${message}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - no response from server');
    } else {
      // Something else happened
      throw new Error(`Request error: ${error.message}`);
    }
  }

  /**
   * Extract success data from API response
   */
  private extractSuccessData<T>(response: AxiosResponse<ApiResponse<T>>): T {
    if (response.data && 'success' in response.data && response.data.success) {
      return response.data.success;
    }
    throw new Error('Invalid API response format');
  }

  /**
   * Login user with username
   */
  async login(username: string): Promise<void> {
    try {
      const loginData: LoginRequest = { username };
      await this.axiosInstance.post<LoginResponse>(API_ENDPOINTS.LOGIN, loginData);
      // Login is successful if no error is thrown (JWT cookie is set automatically)
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get user by ID
   */
  async getUser(id: number): Promise<User> {
    try {
      const response = await this.axiosInstance.get<UserResponse>(API_ENDPOINTS.GET_USER(id));
      return this.extractSuccessData(response);
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Get all messages
   */
  async getAllMessages(): Promise<Message[]> {
    try {
      const response = await this.axiosInstance.get<MessagesResponse>(API_ENDPOINTS.GET_ALL_MESSAGES);
      return this.extractSuccessData(response);
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Create a new message
   */
  async createMessage(message: string): Promise<Message> {
    try {
      const messageData: CreateMessageRequest = { msg: message };
      const response = await this.axiosInstance.post<MessageResponse>(API_ENDPOINTS.CREATE_MESSAGE, messageData);
      return this.extractSuccessData(response);
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Delete a message by ID
   */
  async deleteMessage(id: number): Promise<void> {
    try {
      await this.axiosInstance.delete(API_ENDPOINTS.DELETE_MESSAGE(id));
      // Delete is successful if no error is thrown
    } catch (error) {
      this.handleApiError(error);
    }
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<string> {
    try {
      const response = await this.axiosInstance.get(API_ENDPOINTS.ROOT);
      return response.data || 'API is reachable';
    } catch (error) {
      this.handleApiError(error);
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();