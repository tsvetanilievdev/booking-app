import api from './apiClient';

// Types
export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationList {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
}

// Notification API functions
export const notificationApi = {
  // Get all notifications
  async getNotifications(read?: boolean, page?: number, limit?: number): Promise<NotificationList> {
    try {
      const queryParams = new URLSearchParams();
      if (read !== undefined) queryParams.append('read', String(read));
      if (page) queryParams.append('page', String(page));
      if (limit) queryParams.append('limit', String(limit));
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return await api.get<NotificationList>(`/notifications${query}`);
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  },
  
  // Mark notification as read
  async markAsRead(id: string): Promise<Notification> {
    try {
      return await api.post<Notification>(`/notifications/${id}/read`, {});
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  },
  
  // Get unread count
  async getUnreadCount(): Promise<{count: number}> {
    try {
      return await api.get<{count: number}>('/notifications/unread-count');
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  },
  
  // Mark all notifications as read
  async markAllAsRead(): Promise<{status: string, message: string}> {
    try {
      return await api.put<{status: string, message: string}>('/notifications/read-all', {});
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  }
};

export default notificationApi; 