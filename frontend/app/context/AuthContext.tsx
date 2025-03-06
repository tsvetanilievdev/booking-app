'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
  login as apiLogin, 
  register as apiRegister, 
  forgotPassword as apiForgotPassword, 
  resetPassword as apiResetPassword,
  LoginCredentials,
  RegisterData as ApiRegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  AuthResponse
} from '../api/authApi';
import { getCurrentUser, User as ApiUser, UserResponse } from '../api/userApi';
import { formatErrorMessage } from '../utils/api';

// Use the User interface from the API
type User = ApiUser;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Our local RegisterData interface that matches the form fields
interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Add a function to decode JWT tokens
const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          console.log('No auth token found in localStorage');
          setIsLoading(false);
          return;
        }
        
        console.log('Auth token found, fetching user data...');
        console.log('JWT Token:', token);
        
        try {
          // Try to decode the token first to see what's in it
          const decoded = parseJwt(token);
          console.log('Decoded JWT token:', decoded);
        } catch (decodeError) {
          console.error('Error decoding JWT token:', decodeError);
        }
        
        const userResponse = await getCurrentUser();
        console.log('User data fetched successfully:', userResponse);
        
        if (userResponse.status === 'success' && userResponse.data?.user) {
          console.log('Setting user data from API response:', userResponse.data.user);
          setUser(userResponse.data.user);
          setIsAuthenticated(true);
        } else {
          console.error('User data not found in response:', userResponse);
          throw new Error('Failed to get user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Clear invalid token
        localStorage.removeItem('authToken');
        setError(formatErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting to login user: ${email}`);
      const credentials: LoginCredentials = { email, password };
      const response = await apiLogin(credentials);
      console.log('Login response received:', response);
      
      if (response.status === 'success' && response.data?.token) {
        console.log('Login successful, token received');
        const token = response.data.token;
        console.log('JWT Token:', token);
        
        try {
          // Try to decode the token first to see what's in it
          const decoded = parseJwt(token);
          console.log('Decoded JWT token:', decoded);
        } catch (decodeError) {
          console.error('Error decoding JWT token:', decodeError);
        }
        
        localStorage.setItem('authToken', token);
        
        try {
          console.log('Fetching user data after login...');
          // Try to get user data from API
          const userResponse = await getCurrentUser();
          console.log('User data fetched successfully:', userResponse);
          
          if (userResponse.status === 'success' && userResponse.data?.user) {
            console.log('Setting user data from API response:', userResponse.data.user);
            setUser(userResponse.data.user);
            setIsAuthenticated(true);
            router.push('/dashboard');
          } else {
            // If API response doesn't have user data, try to extract from JWT
            console.log('User data not found in API response, attempting to extract from JWT');
            const userData = extractUserFromToken(token, email);
            if (userData) {
              console.log('Successfully extracted user data from JWT:', userData);
              setUser(userData);
              setIsAuthenticated(true);
              router.push('/dashboard');
            } else {
              throw new Error('Failed to get user data after login');
            }
          }
        } catch (userError) {
          console.error('Error fetching user data after login:', userError);
          
          // Last resort: try to extract user info from JWT token
          console.log('Attempting to extract user data from JWT token as fallback');
          const userData = extractUserFromToken(token, email);
          
          if (userData) {
            console.log('Successfully extracted user data from JWT:', userData);
            setUser(userData);
            setIsAuthenticated(true);
            router.push('/dashboard');
          } else {
            setError(formatErrorMessage(userError));
            localStorage.removeItem('authToken');
          }
        }
      } else {
        console.error('Login response did not contain a token:', response);
        setError(response.message || 'Authentication failed: No token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to extract user data from JWT token
  const extractUserFromToken = (token: string, email: string): User | null => {
    try {
      console.log('Attempting to extract user data from token');
      const decoded = parseJwt(token);
      console.log('Decoded JWT token:', decoded);
      
      if (!decoded) {
        console.error('Failed to decode JWT token');
        return null;
      }
      
      // Try to extract user data based on common JWT payload formats
      const userId = decoded.id || decoded.sub || decoded.userId || decoded.user_id;
      if (!userId) {
        console.error('No user ID found in JWT token');
        return null;
      }
      
      const userName = decoded.name || decoded.username || decoded.user_name || `User ${userId.substring(0, 8)}`;
      const userEmail = decoded.email || email; // Use the decoded email or the email from login
      const userRole = decoded.role || decoded.user_role || 'USER';
      
      console.log('Extracted user data from JWT:', {
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole
      });
      
      return {
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole
      };
    } catch (error) {
      console.error('Error extracting user data from token:', error);
      return null;
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting to register user:', userData.email);
      
      // Map our form data to the API's expected format
      const apiRegisterData: ApiRegisterData = {
        email: userData.email,
        password: userData.password,
        name: `${userData.firstName} ${userData.lastName}`,
        role: 'USER' // Default role for new users
      };
      
      const response = await apiRegister(apiRegisterData);
      console.log('Registration response received:', response);
      
      if (response.status === 'success' && response.data?.token) {
        console.log('Registration successful, token received');
        const token = response.data.token;
        console.log('JWT Token:', token);
        
        try {
          // Try to decode the token first to see what's in it
          const decoded = parseJwt(token);
          console.log('Decoded JWT token:', decoded);
        } catch (decodeError) {
          console.error('Error decoding JWT token:', decodeError);
        }
        
        localStorage.setItem('authToken', token);
        
        try {
          console.log('Fetching user data after registration...');
          // Try to get user data from API
          const userResponse = await getCurrentUser();
          console.log('User data fetched successfully:', userResponse);
          
          if (userResponse.status === 'success' && userResponse.data?.user) {
            console.log('Setting user data from API response:', userResponse.data.user);
            setUser(userResponse.data.user);
            setIsAuthenticated(true);
            router.push('/dashboard');
          } else {
            // If API response doesn't have user data, try to extract from JWT
            console.log('User data not found in API response, attempting to extract from JWT');
            const extractedUser = extractUserFromToken(token, userData.email);
            if (extractedUser) {
              console.log('Successfully extracted user data from JWT:', extractedUser);
              setUser(extractedUser);
              setIsAuthenticated(true);
              router.push('/dashboard');
            } else {
              throw new Error('Failed to get user data after registration');
            }
          }
        } catch (userError) {
          console.error('Error fetching user data after registration:', userError);
          
          // Last resort: try to extract user info from JWT token
          console.log('Attempting to extract user data from JWT token as fallback');
          const extractedUser = extractUserFromToken(token, userData.email);
          
          if (extractedUser) {
            console.log('Successfully extracted user data from JWT:', extractedUser);
            setUser(extractedUser);
            setIsAuthenticated(true);
            router.push('/dashboard');
          } else {
            setError(formatErrorMessage(userError));
            localStorage.removeItem('authToken');
          }
        }
      } else {
        console.error('Registration response did not contain a token:', response);
        setError(response.message || 'Registration failed: No token received');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out user');
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  const handleForgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Requesting password reset for: ${email}`);
      const data: ForgotPasswordData = { email };
      const response = await apiForgotPassword(data);
      console.log('Password reset request response:', response);
      
      if (response.status === 'success') {
        console.log('Password reset request successful');
      } else {
        setError(response.message || 'Failed to process forgot password request');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting to reset password with token');
      const data: ResetPasswordData = { token, password: newPassword };
      const response = await apiResetPassword(data);
      console.log('Password reset response:', response);
      
      if (response.status === 'success') {
        console.log('Password reset successful');
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        forgotPassword: handleForgotPassword,
        resetPassword: handleResetPassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 