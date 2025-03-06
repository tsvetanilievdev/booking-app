import apiClient from './apiClient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
}

export interface UserResponse {
  status: string;
  message?: string;
  data?: {
    user: User;
  };
}

/**
 * Fetches the current user's profile
 */
export const getCurrentUser = async (): Promise<UserResponse> => {
  console.log('Fetching current user profile from: /users');
  try {
    // The correct endpoint based on the backend implementation
    return await apiClient.get<UserResponse>('/users');
  } catch (error) {
    console.error('Error fetching from /users:', error);
    
    // If the first attempt fails, try alternative endpoints
    try {
      console.log('Trying alternative endpoint: /users/profile');
      return await apiClient.get<UserResponse>('/users/profile');
    } catch (error2) {
      console.error('Error fetching from /users/profile:', error2);
      
      try {
        console.log('Trying alternative endpoint: /users/me');
        return await apiClient.get<UserResponse>('/users/me');
      } catch (error3) {
        console.error('Error fetching from /users/me:', error3);
        throw error; // Throw the original error
      }
    }
  }
};

/**
 * Updates the current user's profile
 */
export const updateUserProfile = async (data: UpdateUserData): Promise<UserResponse> => {
  return apiClient.put<UserResponse>('/users', data);
};

/**
 * Deletes the current user's account
 */
export const deleteUserAccount = async (): Promise<{ status: string; message: string }> => {
  return apiClient.delete<{ status: string; message: string }>('/users');
}; 