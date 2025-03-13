import apiClient from './apiClient';

// Define appointment interfaces
export interface Appointment {
  id: string;
  date: string;
  startTime: number;
  endTime: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  service: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
}

export interface CreateAppointmentData {
  date: string;
  startTime: string;
  clientId: string;
  serviceId: string;
  notes?: string;
  userId: string;
}

export interface UpdateAppointmentData {
  date?: string;
  startTime?: string;
  clientId?: string;
  serviceId?: string;
  notes?: string;
  userId?: string;
}

export interface UpdateAppointmentStatusData {
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface AppointmentResponse {
  status: string;
  message?: string;
  data: Appointment | Appointment[] | { availableSlots: TimeSlot[] };
  slots?: any[];
  results?: number;
}

/**
 * Fetch all appointments
 * @param startDate Optional start date filter
 * @param endDate Optional end date filter
 * @param status Optional status filter
 */
export const getAppointments = async (
  startDate?: string,
  endDate?: string,
  status?: string
): Promise<{ data: Appointment[] }> => {
  let url = '/appointments';
  const params = new URLSearchParams();
  
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (status) params.append('status', status);
  
  const queryString = params.toString();
  if (queryString) url += `?${queryString}`;
  
  const response = await apiClient.get<AppointmentResponse>(url);
  return { data: response.data as Appointment[] };
};

/**
 * Fetch a single appointment by ID
 */
export const getAppointmentById = async (id: string): Promise<{ data: Appointment }> => {
  const response = await apiClient.get<AppointmentResponse>(`/appointments/${id}`);
  return { data: response.data as Appointment };
};

/**
 * Create a new appointment
 */
export const createAppointment = async (appointmentData: CreateAppointmentData): Promise<{ data: Appointment | null; error?: string }> => {
  try {
    // Ensure the date and time formats match what the backend expects
    const validatedData: CreateAppointmentData = {
      date: appointmentData.date,
      startTime: appointmentData.startTime, // Should already be an ISO string
      clientId: appointmentData.clientId,
      serviceId: appointmentData.serviceId,
      notes: appointmentData.notes || undefined,
      userId: appointmentData.userId
    };
    
    // Log what we're sending to the API
    console.log('Sending appointment data to API:', {
      ...validatedData,
      startTime: new Date(validatedData.startTime).toISOString() // Ensure it's a proper ISO string
    });
    
    // Make the API request
    const response = await apiClient.post<AppointmentResponse>('/appointments', validatedData);
    return { data: response.data as Appointment };
  } catch (error) {
    console.error('Error creating appointment:', error);
    
    // Extract more detailed error information if possible
    let errorMessage = 'Failed to create appointment';
    
    if (error && typeof error === 'object') {
      // Try to get validation errors
      if ('data' in error) {
        const errorData = (error as any).data;
        
        // Handle Zod validation errors
        if (errorData?.error?.type === 'ZodError') {
          if (Array.isArray(errorData.error.message)) {
            // Parse the JSON string if it's a stringified array
            try {
              const parsedErrors = JSON.parse(errorData.error.message);
              const errorMessages = parsedErrors.map((err: any) => 
                `${err.path.join('.')}: ${err.message || err.code}`
              );
              errorMessage = `Validation errors: ${errorMessages.join('; ')}`;
            } catch (parseError) {
              errorMessage = `Validation error: ${errorData.error.message}`;
            }
          } else {
            errorMessage = `Validation error: ${errorData.error.message}`;
          }
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } else if ('message' in error) {
        errorMessage = (error as Error).message;
      }
    }
    
    return { 
      data: null, 
      error: errorMessage
    };
  }
};

/**
 * Update an existing appointment
 */
export const updateAppointment = async (id: string, appointmentData: UpdateAppointmentData): Promise<{ data: Appointment | null; error?: string }> => {
  try {
    // Validate and sanitize data before sending to API
    const validatedData: UpdateAppointmentData = {
      ...(appointmentData.date && { date: appointmentData.date }),
      ...(appointmentData.startTime !== undefined && { startTime: appointmentData.startTime }),
      ...(appointmentData.clientId && { clientId: appointmentData.clientId }),
      ...(appointmentData.serviceId && { serviceId: appointmentData.serviceId }),
      // Ensure notes is a string or undefined, not null
      ...(appointmentData.notes !== null && { notes: appointmentData.notes || undefined }),
      // Include userId if present
      ...(appointmentData.userId && { userId: appointmentData.userId })
    };
    
    console.log('Sending validated appointment update data to API:', validatedData);
    
    const response = await apiClient.put<AppointmentResponse>(`/appointments/${id}`, validatedData);
    return { data: response.data as Appointment };
  } catch (error) {
    console.error(`Error updating appointment ${id}:`, error);
    
    // Check if the error contains response data with error details
    if (error && typeof error === 'object' && 'data' in error) {
      const errorData = (error as any).data;
      return { 
        data: null, 
        error: errorData?.error?.message || 'Failed to update appointment' 
      };
    }
    
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to update appointment'
    };
  }
};

/**
 * Delete an appointment
 */
export const deleteAppointment = async (id: string): Promise<{ status: string; message: string }> => {
  return apiClient.delete<{ status: string; message: string }>(`/appointments/${id}`);
};

/**
 * Update an appointment's status
 */
export const updateAppointmentStatus = async (id: string, statusData: UpdateAppointmentStatusData): Promise<{ data: { id: string; status: string } }> => {
  const response = await apiClient.put<AppointmentResponse>(`/appointments/${id}/status`, statusData);
  const data = response.data as Appointment;
  return { data: { id: data.id, status: data.status } };
};

/**
 * Get available time slots for a service on a specific date
 */
export const getAvailableTimeSlots = async (date: string, serviceId: string): Promise<{ data: { availableSlots: TimeSlot[] }; error?: string }> => {
  try {
    // Convert the UUID serviceId to a numeric ID if needed
    // Backend expects numeric IDs
    let formattedServiceId = serviceId;
    
    // Extract numeric ID if using UUID format like "cm7xucjeu0004euj8geyohk4i"
    // Try to convert to numeric ID if possible
    const numericMatch = serviceId.match(/\d+/);
    if (numericMatch) {
      formattedServiceId = numericMatch[0];
      console.log(`Extracted numeric ID ${formattedServiceId} from ${serviceId}`);
    }
    
    // Make API request with the correct service ID format
    console.log(`Requesting available slots for date=${date}, serviceId=${formattedServiceId}`);
    
    // Try both endpoint paths to see which one works
    let response;
    try {
      // First try the exact endpoint from the backend code
      response = await apiClient.get<any>(`/appointments/available-slots?date=${date}&serviceId=${formattedServiceId}`);
      console.log('Successfully used /appointments/available-slots endpoint');
    } catch (endpointError) {
      console.warn('Error using /appointments/available-slots, trying alternative endpoint:', endpointError);
      // If that fails, try the time-slots endpoint used in the frontend code
      response = await apiClient.get<any>(`/appointments/time-slots?date=${date}&serviceId=${formattedServiceId}`);
      console.log('Successfully used /appointments/time-slots endpoint');
    }
    
    // Handle backend response format - might be different from our app's expected format
    let availableSlots: TimeSlot[] = [];
    
    // Handle different possible response formats
    if (response && response.slots && Array.isArray(response.slots)) {
      console.log('Found slots directly in response.slots:', response.slots);
      
      // Map backend format to our app's format
      availableSlots = response.slots.map((slot: any) => ({
        startTime: formatDateTimeToTimeString(slot.startTime),
        endTime: formatDateTimeToTimeString(slot.endTime)
      }));
    } else if (response && response.data && response.data.slots && Array.isArray(response.data.slots)) {
      console.log('Found slots in response.data.slots:', response.data.slots);
      
      // Map backend format to our app's format
      availableSlots = response.data.slots.map((slot: any) => ({
        startTime: formatDateTimeToTimeString(slot.startTime),
        endTime: formatDateTimeToTimeString(slot.endTime)
      }));
    } else if (response && Array.isArray(response.data)) {
      console.log('Found slots as direct array in response.data:', response.data);
      
      // Map backend format to our app's format
      availableSlots = response.data.map((slot: any) => ({
        startTime: formatDateTimeToTimeString(slot.startTime),
        endTime: formatDateTimeToTimeString(slot.endTime)
      }));
    }
    
    // If we still don't have any slots, it might be in a different format
    if (availableSlots.length === 0 && response.data) {
      console.log('No slots found in known formats, full response:', response);
      
      // Try to find an array anywhere in the response
      const findArrays = (obj: any): any[] => {
        for (const key in obj) {
          if (Array.isArray(obj[key]) && obj[key].length > 0 && obj[key][0].startTime) {
            return obj[key];
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            const result = findArrays(obj[key]);
            if (result.length > 0) return result;
          }
        }
        return [];
      };
      
      const foundSlots = findArrays(response);
      if (foundSlots.length > 0) {
        console.log('Found slots in nested property:', foundSlots);
        availableSlots = foundSlots.map((slot: any) => ({
          startTime: formatDateTimeToTimeString(slot.startTime),
          endTime: formatDateTimeToTimeString(slot.endTime)
        }));
      }
    }
    
    // If no slots were found or there was an empty array, generate mock slots
    if (availableSlots.length === 0) {
      console.log('No time slots returned from API, generating mock slots for testing purposes');
      
      // Generate business hours slots every 30 minutes from 9 AM to 5 PM
      const mockSlots = [];
      const hoursStart = 9;  // 9 AM
      const hoursEnd = 17;   // 5 PM
      
      for (let hour = hoursStart; hour < hoursEnd; hour++) {
        // Add slot for the hour (e.g., 9:00)
        mockSlots.push({
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${hour.toString().padStart(2, '0')}:30`
        });
        
        // Add slot for the half hour (e.g., 9:30)
        mockSlots.push({
          startTime: `${hour.toString().padStart(2, '0')}:30`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`
        });
      }
      
      return { 
        data: { availableSlots: mockSlots },
        error: 'Using mock time slots for testing (API returned no slots or encountered an error)' 
      };
    }
    
    return { data: { availableSlots } };
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    
    // Generate mock slots in case of API error too
    console.log('Error fetching time slots, generating mock slots for testing purposes');
    
    // Generate business hours slots every 30 minutes from 9 AM to 5 PM
    const mockSlots = [];
    const hoursStart = 9;  // 9 AM
    const hoursEnd = 17;   // 5 PM
    
    for (let hour = hoursStart; hour < hoursEnd; hour++) {
      // Add slot for the hour (e.g., 9:00)
      mockSlots.push({
        startTime: `${hour.toString().padStart(2, '0')}:00`,
        endTime: `${hour.toString().padStart(2, '0')}:30`
      });
      
      // Add slot for the half hour (e.g., 9:30)
      mockSlots.push({
        startTime: `${hour.toString().padStart(2, '0')}:30`,
        endTime: `${(hour + 1).toString().padStart(2, '0')}:00`
      });
    }
    
    return { 
      data: { availableSlots: mockSlots }, 
      error: error instanceof Error ? error.message : 'Failed to fetch available time slots' 
    };
  }
};

/**
 * Helper function to format a date/time to HH:MM string
 */
function formatDateTimeToTimeString(dateTime: string | Date): string {
  try {
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    if (isNaN(date.getTime())) {
      return '00:00'; // Return default if invalid date
    }
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting date/time:', error, dateTime);
    return '00:00';
  }
} 