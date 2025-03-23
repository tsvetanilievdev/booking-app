import api from './apiClient';

// Types
export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  isAvailable: boolean;
  availableDays: number[];
  availableTimeStart: number;
  availableTimeEnd: number;
}

export interface ServiceList {
  items: Service[];
  total: number;
  page: number;
  limit: number;
}

export interface ServiceAnalytics {
  totalBookings: number;
  revenue: number;
  popularTimeSlots: string[];
  customerSatisfaction: number;
}

export interface ServiceCreateData {
  name: string;
  price: number;
  duration: number;
  description: string;
  availableDays: number[];
  availableTimeStart: number;
  availableTimeEnd: number;
}

// Service API functions
export const serviceApi = {
  // Get all services
  async getServices(available?: boolean, page?: number, limit?: number): Promise<ServiceList> {
    try {
      const queryParams = new URLSearchParams();
      if (available !== undefined) queryParams.append('available', String(available));
      if (page) queryParams.append('page', String(page));
      if (limit) queryParams.append('limit', String(limit));
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return await api.get<ServiceList>(`/services${query}`);
    } catch (error) {
      console.error('Get services error:', error);
      throw error;
    }
  },
  
  // Get service by ID
  async getServiceById(id: string): Promise<Service> {
    try {
      return await api.get<Service>(`/services/${id}`);
    } catch (error) {
      console.error('Get service error:', error);
      throw error;
    }
  },
  
  // Create service (admin only)
  async createService(serviceData: ServiceCreateData): Promise<Service> {
    try {
      return await api.post<Service>('/services', serviceData);
    } catch (error) {
      console.error('Create service error:', error);
      throw error;
    }
  },
  
  // Update service (admin only)
  async updateService(id: string, serviceData: Partial<ServiceCreateData>): Promise<Service> {
    try {
      return await api.put<Service>(`/services/${id}`, serviceData);
    } catch (error) {
      console.error('Update service error:', error);
      throw error;
    }
  },
  
  // Delete service (admin only)
  async deleteService(id: string): Promise<void> {
    try {
      await api.delete(`/services/${id}`);
    } catch (error) {
      console.error('Delete service error:', error);
      throw error;
    }
  },
  
  // Get service analytics (admin only)
  async getServiceAnalytics(): Promise<ServiceAnalytics> {
    try {
      const response = await api.get<{status: string, data: {analytics: ServiceAnalytics}}>('/services/analytics/data');
      return response.data.analytics;
    } catch (error) {
      console.error('Get service analytics error:', error);
      throw error;
    }
  }
};

export default serviceApi; 