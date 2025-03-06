import apiClient from './apiClient';

// Define service interfaces
export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  isAvailable: boolean;
  availableDays: number[];
  availableTimeStart: number;
  availableTimeEnd: number;
  bookingCount?: number;
  revenue?: number;
}

export interface CreateServiceData {
  name: string;
  duration: number;
  price: number;
  isAvailable?: boolean;
  availableDays?: number[];
  availableTimeStart?: number;
  availableTimeEnd?: number;
}

export interface UpdateServiceData {
  name?: string;
  duration?: number;
  price?: number;
  isAvailable?: boolean;
  availableDays?: number[];
  availableTimeStart?: number;
  availableTimeEnd?: number;
}

export interface ServiceAvailabilityData {
  isAvailable: boolean;
}

export interface ServiceScheduleData {
  days: number[];
  startTime: number;
  endTime: number;
}

export interface ServiceResponse {
  status: string;
  message?: string;
  data: Service | Service[] | { isAvailable: boolean } | { 
    availableDays: number[],
    availableTimeStart: number,
    availableTimeEnd: number
  };
}

export interface ServiceAnalytics {
  totalRevenue: number;
  totalBookings: number;
  popularServices: {
    id: string;
    name: string;
    bookingCount: number;
  }[];
  revenueByService: {
    id: string;
    name: string;
    revenue: number;
  }[];
}

/**
 * Fetch all services
 */
export const getServices = async (): Promise<{ data: Service[]; error?: string }> => {
  try {
    const response = await apiClient.get<ServiceResponse>('/services');
    
    // Enhanced logging for debugging
    console.log('Service API response:', response);
    
    // Check if response exists
    if (response) {
      // Check if it's already an array
      if (Array.isArray(response)) {
        return { data: response as Service[] };
      }
      
      // Check for different response formats
      if (Array.isArray(response.data)) {
        // Direct array in data property
        return { data: response.data as Service[] };
      } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        // Nested data property that contains the array
        const nestedData = response.data.data;
        if (Array.isArray(nestedData)) {
          return { data: nestedData as Service[] };
        }
      } else if (!Array.isArray(response.data) && typeof response.data === 'object') {
        // If we have a single service object instead of an array, wrap it
        console.warn('Service data is an object, not an array. Converting to array:', response.data);
        const serviceData = response.data as unknown as Service;
        return { data: [serviceData] };
      }
    }
    
    // If we reach here, the data wasn't in an expected format
    console.error('Unexpected service data format:', response);
    return { data: [], error: 'Invalid data format received from server' };
  } catch (error) {
    console.error('Error fetching services:', error);
    return { data: [], error: error instanceof Error ? error.message : 'Failed to fetch services' };
  }
};

/**
 * Fetch a service by ID
 */
export const getServiceById = async (id: string): Promise<{ data: Service | null; error?: string }> => {
  try {
    const response = await apiClient.get<ServiceResponse>(`/services/${id}`);
    return { data: response.data as Service };
  } catch (error) {
    console.error(`Error fetching service ${id}:`, error);
    return { data: null, error: error instanceof Error ? error.message : `Failed to fetch service ${id}` };
  }
};

/**
 * Create a new service
 */
export const createService = async (serviceData: CreateServiceData): Promise<{ data: Service | null; error?: string }> => {
  try {
    // Ensure only the required fields are explicitly included in the primary object
    // and optional fields are properly formatted
    const payload = {
      name: serviceData.name,
      duration: serviceData.duration,
      price: serviceData.price,
      // Include these fields only if they're defined
      ...(serviceData.isAvailable !== undefined && { isAvailable: serviceData.isAvailable }),
      ...(serviceData.availableDays && { availableDays: serviceData.availableDays }),
      ...(serviceData.availableTimeStart !== undefined && { availableTimeStart: serviceData.availableTimeStart }),
      ...(serviceData.availableTimeEnd !== undefined && { availableTimeEnd: serviceData.availableTimeEnd })
    };
    
    console.log('Creating service with payload:', payload);
    const response = await apiClient.post<ServiceResponse>('/services', payload);
    return { data: response.data as Service };
  } catch (error) {
    console.error('Error creating service:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to create service'
    };
  }
};

/**
 * Update an existing service
 */
export const updateService = async (id: string, serviceData: UpdateServiceData): Promise<{ data: Service | null; error?: string }> => {
  try {
    const response = await apiClient.put<ServiceResponse>(`/services/${id}`, serviceData);
    return { data: response.data as Service };
  } catch (error) {
    console.error(`Error updating service ${id}:`, error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to update service'
    };
  }
};

/**
 * Delete a service
 */
export const deleteService = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.delete<{ status: string; message: string }>(`/services/${id}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting service ${id}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete service'
    };
  }
};

/**
 * Toggle service availability
 */
export const toggleServiceAvailability = async (id: string, isAvailable: boolean): Promise<{ data: { isAvailable: boolean } | null; error?: string }> => {
  try {
    const response = await apiClient.put<ServiceResponse>(
      `/services/${id}/availability`, 
      { isAvailable }
    );
    return { data: response.data as { isAvailable: boolean } };
  } catch (error) {
    console.error(`Error toggling service availability for ${id}:`, error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to toggle service availability'
    };
  }
};

/**
 * Update service availability schedule
 */
export const updateServiceSchedule = async (id: string, scheduleData: ServiceScheduleData): Promise<{ data: any | null; error?: string }> => {
  try {
    const response = await apiClient.put<ServiceResponse>(
      `/services/${id}/availability/schedule`, 
      scheduleData
    );
    return { data: response.data };
  } catch (error) {
    console.error(`Error updating service schedule for ${id}:`, error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to update service schedule'
    };
  }
};

/**
 * Get service analytics
 */
export const getServiceAnalytics = async (): Promise<{ data: ServiceAnalytics | null; error?: string }> => {
  try {
    const response = await apiClient.get<{ status: string; data: any }>('/services/analytics');
    // Access the nested data property correctly
    if (response && response.data && 'data' in response.data) {
      return { data: response.data.data as ServiceAnalytics };
    }
    return { data: null, error: 'Invalid analytics data format' };
  } catch (error) {
    console.error('Error fetching service analytics:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch service analytics'
    };
  }
};