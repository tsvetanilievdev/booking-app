import api from './apiClient';
import { Client } from './clients';
import { Service } from './services';

// Types
export interface Appointment {
  id: string;
  userId: string;
  serviceId: string;
  clientId: number;
  startTime: string;
  endTime: string;
  notes: string[];
  isCancelled: boolean;
  Client?: Client;
  Service?: Service;
}

export interface AppointmentList {
  status: string;
  results: number;
  data: {
    appointments: Appointment[];
  }
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface AvailableSlots {
  status: string;
  data: {
    availableSlots: TimeSlot[];
  }
}

export interface AppointmentCreateData {
  serviceId: string;
  clientId: number;
  startTime: string;
  endTime: string;
  notes?: string[];
  userId?: string;
}

// Appointment API functions
export const appointmentApi = {
  // Get all appointments
  async getAppointments(start?: string, end?: string, status?: string): Promise<AppointmentList> {
    try {
      const queryParams = new URLSearchParams();
      if (start) queryParams.append('start', start);
      if (end) queryParams.append('end', end);
      if (status) queryParams.append('status', status);
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return await api.get<AppointmentList>(`/appointments${query}`);
    } catch (error) {
      console.error('Get appointments error:', error);
      throw error;
    }
  },
  
  // Get today's appointments
  async getTodayAppointments(): Promise<AppointmentList> {
    try {
      return await api.get<AppointmentList>('/appointments/today');
    } catch (error) {
      console.error('Get today appointments error:', error);
      throw error;
    }
  },
  
  // Get week's appointments
  async getWeekAppointments(): Promise<AppointmentList> {
    try {
      return await api.get<AppointmentList>('/appointments/week');
    } catch (error) {
      console.error('Get week appointments error:', error);
      throw error;
    }
  },
  
  // Get month's appointments
  async getMonthAppointments(): Promise<AppointmentList> {
    try {
      return await api.get<AppointmentList>('/appointments/month');
    } catch (error) {
      console.error('Get month appointments error:', error);
      throw error;
    }
  },
  
  // Get available slots
  async getAvailableSlots(serviceId: string, date: string): Promise<AvailableSlots> {
    try {
      return await api.get<AvailableSlots>(`/appointments/available-slots?serviceId=${serviceId}&date=${date}`);
    } catch (error) {
      console.error('Get available slots error:', error);
      throw error;
    }
  },
  
  // Get client's appointment history
  async getClientAppointments(clientId: number): Promise<AppointmentList> {
    try {
      return await api.get<AppointmentList>(`/appointments/client/${clientId}`);
    } catch (error) {
      console.error('Get client appointments error:', error);
      throw error;
    }
  },
  
  // Get appointment by ID
  async getAppointmentById(id: string): Promise<{status: string, data: {appointment: Appointment}}> {
    try {
      return await api.get<{status: string, data: {appointment: Appointment}}>(`/appointments/${id}`);
    } catch (error) {
      console.error('Get appointment error:', error);
      throw error;
    }
  },
  
  // Create appointment
  async createAppointment(appointmentData: AppointmentCreateData): Promise<{status: string, message: string, data: {appointment: Appointment}}> {
    try {
      return await api.post<{status: string, message: string, data: {appointment: Appointment}}>('/appointments', appointmentData);
    } catch (error) {
      console.error('Create appointment error:', error);
      throw error;
    }
  },
  
  // Update appointment
  async updateAppointment(id: string, appointmentData: Partial<AppointmentCreateData>): Promise<{status: string, message: string, data: {appointment: Appointment}}> {
    try {
      return await api.put<{status: string, message: string, data: {appointment: Appointment}}>(`/appointments/${id}`, appointmentData);
    } catch (error) {
      console.error('Update appointment error:', error);
      throw error;
    }
  },
  
  // Cancel appointment
  async cancelAppointment(id: string): Promise<{status: string, message: string, data: {appointment: Appointment}}> {
    try {
      return await api.put<{status: string, message: string, data: {appointment: Appointment}}>(`/appointments/${id}/cancel`, {});
    } catch (error) {
      console.error('Cancel appointment error:', error);
      throw error;
    }
  },
  
  // Delete appointment
  async deleteAppointment(id: string): Promise<void> {
    try {
      await api.delete(`/appointments/${id}`);
    } catch (error) {
      console.error('Delete appointment error:', error);
      throw error;
    }
  }
};

export default appointmentApi; 