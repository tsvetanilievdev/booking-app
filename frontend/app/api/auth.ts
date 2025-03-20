import api from './apiClient';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Auth API functions
export const authApi = {
  // Login with email and password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials, { requireAuth: false });
      
      // Store token in localStorage for subsequent requests
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Register a new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData, { requireAuth: false });
      
      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Get the current logged in user
  async getCurrentUser(): Promise<User> {
    try {
      return await api.get<User>('/users/me');
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
  
  // Send a password reset email
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    try {
      return await api.post<{ message: string }>('/auth/forgot-password', data, { requireAuth: false });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },
  
  // Reset password with token
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    try {
      return await api.post<{ message: string }>('/auth/reset-password', data, { requireAuth: false });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
  
  // Logout the user
  logout(): void {
    localStorage.removeItem('authToken');
    // Force reload to clear any in-memory state
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
  
  // Check if the user is logged in
  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('authToken');
  }
};

export default authApi; 