import apiClient from './apiClient';

export interface DashboardStats {
  totalAppointments: number;
  totalClients: number;
  totalServices: number;
  totalRevenue: number;
  revenueChange: number;
  clientsChange: number;
  appointmentsChange: number;
  servicesChange: number;
}

export interface DashboardResponse {
  status: string;
  data: DashboardStats;
}

/**
 * Fetch dashboard statistics
 */
export const getDashboardStats = async (): Promise<{ data: DashboardStats; error?: string }> => {
  try {
    const response = await apiClient.get<DashboardResponse>('/dashboard/stats');
    return { data: response.data as DashboardStats };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    
    // Fallback to mock data if the API fails
    return { 
      data: {
        totalAppointments: 0,
        totalClients: 0,
        totalServices: 0,
        totalRevenue: 0,
        revenueChange: 0,
        clientsChange: 0,
        appointmentsChange: 0,
        servicesChange: 0
      }, 
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats' 
    };
  }
};

/**
 * Fetch today's appointments
 */
export const getTodayAppointments = async (): Promise<{ data: any[]; error?: string }> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await apiClient.get<{ data: any[] }>(`/appointments?date=${today}`);
    return { data: response.data };
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    return { 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch today\'s appointments' 
    };
  }
}; 