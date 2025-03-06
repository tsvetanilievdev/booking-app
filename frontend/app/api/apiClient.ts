import { fetchWithErrorHandling, fetchWithTimeout, createAbortController } from '../utils/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
  timeout?: number;
}

class ApiClient {
  private maxRetries = 2; // Maximum number of retries for failed requests
  private retryDelay = 1000; // Delay between retries in milliseconds
  private defaultTimeout = 10000; // Default timeout for requests in milliseconds
  
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      console.log('Getting auth token from localStorage:', token ? `${token.substring(0, 15)}...` : 'null');
      return token;
    }
    return null;
  }

  private getHeaders(options?: RequestInit): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Added Authorization header with token');
    } else {
      console.log('No token available for Authorization header');
    }

    return headers;
  }

  /**
   * Makes a request with retry logic for failed requests
   */
  private async requestWithRetry<T>(
    url: string,
    options: RequestInit,
    timeout: number,
    retries: number = 0
  ): Promise<T> {
    try {
      const response = await fetchWithTimeout<T>(
        url, 
        options,
        timeout
      );
      return response;
    } catch (error: any) {
      // Don't retry if we've reached the maximum number of retries
      // or if it's a client error (4xx)
      if (
        retries >= this.maxRetries || 
        (error.status && error.status >= 400 && error.status < 500)
      ) {
        throw error;
      }
      
      // Log the retry attempt
      console.warn(`Request to ${url} failed, retrying (${retries + 1}/${this.maxRetries})...`);
      
      // Wait for the retry delay
      await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      
      // Retry the request
      return this.requestWithRetry<T>(url, options, timeout, retries + 1);
    }
  }

  /**
   * Makes a GET request to the API
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const { requireAuth = true, timeout = this.defaultTimeout, ...restOptions } = options || {};
    
    if (requireAuth) {
      const token = this.getAuthToken();
      if (!token) {
        console.error('Authentication required but no token found');
        if (typeof window !== 'undefined') {
          // Force redirect to login if client-side
          console.log('Redirecting to login page due to missing token');
          window.location.href = '/login';
        }
        throw new Error('Authentication required');
      }
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making GET request to ${url}`);
    
    try {
      return await this.requestWithRetry<T>(
        url, 
        {
          ...restOptions,
          method: 'GET',
          headers: this.getHeaders(restOptions),
        },
        timeout
      );
    } catch (error) {
      console.error(`GET request to ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Makes a POST request to the API
   */
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    const { requireAuth = true, timeout = this.defaultTimeout, ...restOptions } = options || {};
    
    if (requireAuth) {
      const token = this.getAuthToken();
      if (!token) {
        console.error('Authentication required but no token found');
        if (typeof window !== 'undefined') {
          // Force redirect to login if client-side
          console.log('Redirecting to login page due to missing token');
          window.location.href = '/login';
        }
        throw new Error('Authentication required');
      }
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making POST request to ${url} with data:`, JSON.stringify(data, null, 2));
    
    try {
      const payload = JSON.stringify(data);
      console.log(`POST payload (${payload.length} bytes)`, payload);
      
      return await this.requestWithRetry<T>(
        url, 
        {
          ...restOptions,
          method: 'POST',
          headers: this.getHeaders(restOptions),
          body: payload,
        },
        timeout
      );
    } catch (error) {
      console.error(`POST request to ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Makes a PUT request to the API
   */
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    const { requireAuth = true, timeout = this.defaultTimeout, ...restOptions } = options || {};
    
    if (requireAuth) {
      const token = this.getAuthToken();
      if (!token) {
        console.error('Authentication required but no token found');
        if (typeof window !== 'undefined') {
          // Force redirect to login if client-side
          console.log('Redirecting to login page due to missing token');
          window.location.href = '/login';
        }
        throw new Error('Authentication required');
      }
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making PUT request to ${url}`, data);
    
    try {
      const payload = JSON.stringify(data);
      console.log(`PUT payload for ${url}:`, payload);
      
      return await this.requestWithRetry<T>(
        url, 
        {
          ...restOptions,
          method: 'PUT',
          headers: this.getHeaders(restOptions),
          body: payload,
        },
        timeout
      );
    } catch (error) {
      console.error(`PUT request to ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Makes a DELETE request to the API
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const { requireAuth = true, timeout = this.defaultTimeout, ...restOptions } = options || {};
    
    if (requireAuth) {
      const token = this.getAuthToken();
      if (!token) {
        console.error('Authentication required but no token found');
        if (typeof window !== 'undefined') {
          // Force redirect to login if client-side
          console.log('Redirecting to login page due to missing token');
          window.location.href = '/login';
        }
        throw new Error('Authentication required');
      }
    }

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`Making DELETE request to ${url}`);
    
    try {
      return await this.requestWithRetry<T>(
        url, 
        {
          ...restOptions,
          method: 'DELETE',
          headers: this.getHeaders(restOptions),
        },
        timeout
      );
    } catch (error) {
      console.error(`DELETE request to ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Creates an abort controller for cancellable requests
   */
  createAbortController() {
    return createAbortController();
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient; 