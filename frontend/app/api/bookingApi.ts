import apiClient from './apiClient';

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  providerId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  categoryId: string;
  providerId: string;
  isActive: boolean;
}

export interface Provider {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  isActive: boolean;
}

export interface BookingResponse {
  status: string;
  message?: string;
  data?: {
    booking: Booking;
  };
}

export interface BookingsResponse {
  status: string;
  message?: string;
  data?: {
    bookings: Booking[];
    total: number;
  };
}

export interface ServicesResponse {
  status: string;
  message?: string;
  data?: {
    services: Service[];
    total: number;
  };
}

export interface ProvidersResponse {
  status: string;
  message?: string;
  data?: {
    providers: Provider[];
    total: number;
  };
}

/**
 * Get all bookings for the current user
 */
export const getUserBookings = async (
  page = 1,
  limit = 10,
  status?: string
): Promise<BookingsResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  if (status) {
    queryParams.append('status', status);
  }
  
  return apiClient.get<BookingsResponse>(`/bookings?${queryParams.toString()}`);
};

/**
 * Get a specific booking by ID
 */
export const getBookingById = async (bookingId: string): Promise<BookingResponse> => {
  return apiClient.get<BookingResponse>(`/bookings/${bookingId}`);
};

/**
 * Create a new booking
 */
export const createBooking = async (bookingData: {
  serviceId: string;
  providerId: string;
  date: string;
  startTime: string;
  notes?: string;
}): Promise<BookingResponse> => {
  return apiClient.post<BookingResponse>('/bookings', bookingData);
};

/**
 * Update an existing booking
 */
export const updateBooking = async (
  bookingId: string,
  bookingData: Partial<{
    date: string;
    startTime: string;
    notes: string;
  }>
): Promise<BookingResponse> => {
  return apiClient.put<BookingResponse>(`/bookings/${bookingId}`, bookingData);
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId: string): Promise<BookingResponse> => {
  return apiClient.put<BookingResponse>(`/bookings/${bookingId}/cancel`, {});
};

/**
 * Get all available services
 */
export const getServices = async (
  page = 1,
  limit = 10,
  categoryId?: string
): Promise<ServicesResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  if (categoryId) {
    queryParams.append('categoryId', categoryId);
  }
  
  return apiClient.get<ServicesResponse>(`/services?${queryParams.toString()}`);
};

/**
 * Get all available providers
 */
export const getProviders = async (
  page = 1,
  limit = 10,
  serviceId?: string
): Promise<ProvidersResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  if (serviceId) {
    queryParams.append('serviceId', serviceId);
  }
  
  return apiClient.get<ProvidersResponse>(`/providers?${queryParams.toString()}`);
};

/**
 * Get available time slots for a specific provider and date
 */
export const getAvailableTimeSlots = async (
  providerId: string,
  date: string,
  serviceId?: string
): Promise<{ status: string; data?: { timeSlots: string[] } }> => {
  const queryParams = new URLSearchParams();
  queryParams.append('date', date);
  if (serviceId) {
    queryParams.append('serviceId', serviceId);
  }
  
  return apiClient.get<{ status: string; data?: { timeSlots: string[] } }>(
    `/providers/${providerId}/availability?${queryParams.toString()}`
  );
}; 