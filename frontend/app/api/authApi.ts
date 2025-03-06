import { fetchWithErrorHandling, fetchWithTimeout } from '../utils/api';
import apiClient from './apiClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const AUTH_API = `${API_BASE_URL}/auth`;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data?: {
    token: string;
    user?: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}

/**
 * Login user with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    return await apiClient.post<AuthResponse>('/auth/login', credentials, { requireAuth: false });
  } catch (err) {
    console.error('Login error:', err);
    // Transform the error into a structured response
    if (err instanceof Error) {
      return {
        status: 'error',
        message: err.message || 'Login failed'
      };
    }
    return {
      status: 'error',
      message: 'An unexpected error occurred during login'
    };
  }
};

/**
 * Register a new user
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    return await apiClient.post<AuthResponse>('/auth/register', userData, { requireAuth: false });
  } catch (err) {
    console.error('Registration error:', err);
    // Handle validation errors from the backend
    if (err instanceof Error) {
      // Check if it's a validation error for password
      if (err.message.includes('password')) {
        return {
          status: 'error',
          message: 'Password must contain at least 8 characters including one uppercase letter, one lowercase letter, and one number'
        };
      }
      return {
        status: 'error',
        message: err.message || 'Registration failed'
      };
    }
    return {
      status: 'error',
      message: 'An unexpected error occurred during registration'
    };
  }
};

/**
 * Send a forgot password request
 */
export const forgotPassword = async (data: ForgotPasswordData): Promise<AuthResponse> => {
  try {
    return await apiClient.post<AuthResponse>('/auth/forgot-password', data, { requireAuth: false });
  } catch (err) {
    if (err instanceof Error) {
      return {
        status: 'error',
        message: err.message || 'Failed to process forgot password request'
      };
    }
    return {
      status: 'error',
      message: 'An unexpected error occurred'
    };
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (data: ResetPasswordData): Promise<AuthResponse> => {
  try {
    return await apiClient.post<AuthResponse>('/auth/reset-password', data, { requireAuth: false });
  } catch (err) {
    if (err instanceof Error) {
      return {
        status: 'error',
        message: err.message || 'Failed to reset password'
      };
    }
    return {
      status: 'error',
      message: 'An unexpected error occurred'
    };
  }
};

/**
 * Verify reset token
 */
export const verifyResetToken = async (token: string): Promise<{ status: string; valid: boolean }> => {
  try {
    return await apiClient.get<{ status: string; valid: boolean }>(
      `/auth/verify-reset-token/${token}`, 
      { requireAuth: false }
    );
  } catch (err) {
    return {
      status: 'error',
      valid: false
    };
  }
}; 