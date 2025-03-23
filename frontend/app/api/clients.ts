import api from './apiClient';

// Types
export interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  notes: string[];
  preferences: any;
  isVip: boolean;
  attendanceRate: number;
  lastVisit: string;
  totalVisits: number;
  totalSpent: number;
}

export interface ClientList {
  status: string;
  results?: number;
  data: Client[] | { clients: Client[] };
}

export interface ClientCreateData {
  name: string;
  phone: string;
  email: string;
  notes?: string[];
  preferences?: any;
}

export interface ClientPreferences {
  preferredDays: number[];
  preferredTimeSlots: string[];
  notes: string;
  specialRequirements: string[];
}

// Client API functions
export const clientApi = {
  // Get all clients
  async getClients(search?: string, page?: number, limit?: number): Promise<ClientList> {
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (page) queryParams.append('page', String(page));
      if (limit) queryParams.append('limit', String(limit));
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return await api.get<ClientList>(`/clients${query}`);
    } catch (error) {
      console.error('Get clients error:', error);
      throw error;
    }
  },
  
  // Get VIP clients
  async getVipClients(): Promise<ClientList> {
    try {
      return await api.get<ClientList>('/clients/vip');
    } catch (error) {
      console.error('Get VIP clients error:', error);
      throw error;
    }
  },
  
  // Get client by ID
  async getClientById(id: number): Promise<Client> {
    try {
      return await api.get<Client>(`/clients/${id}`);
    } catch (error) {
      console.error('Get client error:', error);
      throw error;
    }
  },
  
  // Create client
  async createClient(clientData: ClientCreateData): Promise<Client> {
    try {
      return await api.post<Client>('/clients', clientData);
    } catch (error) {
      console.error('Create client error:', error);
      throw error;
    }
  },
  
  // Update client
  async updateClient(id: number, clientData: Partial<ClientCreateData>): Promise<Client> {
    try {
      return await api.put<Client>(`/clients/${id}`, clientData);
    } catch (error) {
      console.error('Update client error:', error);
      throw error;
    }
  },
  
  // Delete client
  async deleteClient(id: number): Promise<void> {
    try {
      await api.delete(`/clients/${id}`);
    } catch (error) {
      console.error('Delete client error:', error);
      throw error;
    }
  },
  
  // Update client preferences
  async updateClientPreferences(id: number, preferences: ClientPreferences): Promise<Client> {
    try {
      return await api.put<Client>(`/clients/${id}/preferences`, { preferences });
    } catch (error) {
      console.error('Update client preferences error:', error);
      throw error;
    }
  },
  
  // Update client VIP status
  async updateClientVipStatus(id: number, isVip: boolean): Promise<Client> {
    try {
      return await api.put<Client>(`/clients/${id}/vip`, { isVip });
    } catch (error) {
      console.error('Update client VIP status error:', error);
      throw error;
    }
  }
};

export default clientApi; 