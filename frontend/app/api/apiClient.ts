import axios, { AxiosRequestConfig } from 'axios';

// Define a custom config that extends AxiosRequestConfig
interface CustomRequestConfig extends AxiosRequestConfig {
  requireAuth?: boolean;
}

// Create base axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach auth token
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available and request requires auth
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if error is due to database connection issues
    if (error.response?.status === 500) {
      const errorMessage = error.response?.data?.message || error.message;
      if (
        errorMessage.includes('database') || 
        errorMessage.includes('connection') ||
        errorMessage.includes('prisma')
      ) {
        error.isDatabaseError = true;
      }
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear auth token if it's expired or invalid
      localStorage.removeItem('authToken');
      
      // Redirect to login page if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Wrapper functions
export const api = {
  async get<T>(endpoint: string, config?: CustomRequestConfig): Promise<T> {
    const { data } = await apiClient.get<T>(endpoint, config);
    return data;
  },
  
  async post<T>(endpoint: string, body?: any, config?: CustomRequestConfig): Promise<T> {
    const { data } = await apiClient.post<T>(endpoint, body, config);
    return data;
  },
  
  async put<T>(endpoint: string, body?: any, config?: CustomRequestConfig): Promise<T> {
    const { data } = await apiClient.put<T>(endpoint, body, config);
    return data;
  },
  
  async delete<T>(endpoint: string, config?: CustomRequestConfig): Promise<T> {
    const { data } = await apiClient.delete<T>(endpoint, config);
    return data;
  }
};

export default api; 