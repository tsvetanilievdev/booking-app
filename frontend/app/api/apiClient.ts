import { fetchWithErrorHandling, fetchWithTimeout, createAbortController } from '../utils/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
  timeout?: number;
}

class ApiClient {
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
   * Makes a GET request to the API
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const { requireAuth = true, timeout = 10000, ...restOptions } = options || {};
    
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
      const response = await fetchWithTimeout<T>(
        url, 
        {
          ...restOptions,
          method: 'GET',
          headers: this.getHeaders(restOptions),
        },
        timeout
      );
      return response;
    } catch (error) {
      console.error(`GET request to ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Makes a POST request to the API
   */
  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    const { requireAuth = true, timeout = 10000, ...restOptions } = options || {};
    
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
    console.log(`Making POST request to ${url}`, data);
    
    try {
      const response = await fetchWithTimeout<T>(
        url, 
        {
          ...restOptions,
          method: 'POST',
          headers: this.getHeaders(restOptions),
          body: JSON.stringify(data),
        },
        timeout
      );
      return response;
    } catch (error) {
      console.error(`POST request to ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Makes a PUT request to the API
   */
  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    const { requireAuth = true, timeout = 10000, ...restOptions } = options || {};
    
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
      const response = await fetchWithTimeout<T>(
        url, 
        {
          ...restOptions,
          method: 'PUT',
          headers: this.getHeaders(restOptions),
          body: JSON.stringify(data),
        },
        timeout
      );
      return response;
    } catch (error) {
      console.error(`PUT request to ${url} failed:`, error);
      throw error;
    }
  }

  /**
   * Makes a DELETE request to the API
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const { requireAuth = true, timeout = 10000, ...restOptions } = options || {};
    
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
      const response = await fetchWithTimeout<T>(
        url, 
        {
          ...restOptions,
          method: 'DELETE',
          headers: this.getHeaders(restOptions),
        },
        timeout
      );
      return response;
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