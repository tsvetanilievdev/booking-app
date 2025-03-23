import api from './apiClient';
import { User } from './auth';

// Types
export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// User API functions
export const userApi = {
  // Get user profile
  async getProfile(): Promise<User> {
    try {
      const response = await api.get<{ status: string, data: { user: User } }>('/users/profile');
      return response.data.user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },
  
  // Update user profile
  async updateProfile(profileData: UpdateProfileData): Promise<User> {
    try {
      const response = await api.put<{ status: string, message: string, data: { user: User } }>(
        '/users/profile', 
        profileData
      );
      return response.data.user;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
  
  // Change password
  async changePassword(passwordData: ChangePasswordData): Promise<{ message: string }> {
    try {
      const response = await api.put<{ status: string, message: string }>(
        '/users/change-password', 
        passwordData
      );
      return { message: response.message || 'Password changed successfully' };
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },
  
  // Delete account
  async deleteAccount(): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ status: string, message: string }>('/users/profile');
      return { message: response.message || 'Account deleted successfully' };
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }
};

export default userApi; 