import apiClient from './apiClient';

// Define client interfaces
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string[];
  appointmentCount?: number;
}

export interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  notes?: string[];
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  notes?: string[];
}

export interface ClientResponse {
  status: string;
  message?: string;
  data: Client | Client[];
}

/**
 * Fetch all clients
 */
export const getClients = async (): Promise<{ data: Client[]; error?: string }> => {
  try {
    const response = await apiClient.get<any>('/clients');
    
    // Enhanced logging for debugging
    console.log('Client API raw response:', response);
    
    // Check if response exists
    if (!response) {
      console.error('Empty response from clients API');
      return { data: [], error: 'No response from server' };
    }
    
    // From the network tab, we can see the response has a specific structure
    // with client data in the "clients" field and a status value
    if (response.status === "success" && Array.isArray(response.clients)) {
      console.log('Found API response with clients array:', response.clients);
      return { data: response.clients as Client[] };
    }
    
    // Special case for API responses from our backend format
    // Which typically returns: { status: "success", data: [...] }
    if (response.status === 'success' && response.data) {
      console.log('Found success status with data property', response.data);
      
      if (Array.isArray(response.data)) {
        return { data: response.data as Client[] };
      } else if (typeof response.data === 'object') {
        // Handle possible nested structures
        const possibleArray = Object.values(response.data).find(val => Array.isArray(val));
        if (possibleArray) {
          return { data: possibleArray as Client[] };
        }
      }
    }
    
    // Handle results array directly in the response
    if (response.results && Array.isArray(response.results)) {
      console.log('Found results array:', response.results);
      return { data: response.results as Client[] };
    }
    
    // Continue with the previous implementation for other formats
    let clientData: any = null;
    
    // Case 1: Response is directly an array of clients
    if (Array.isArray(response)) {
      clientData = response;
    } 
    // Case 2: Response has a data property with an array
    else if (response.data && Array.isArray(response.data)) {
      clientData = response.data;
    } 
    // Case 3: Response is nested with { data: { data: [...] } } structure
    else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const nestedData = response.data.data;
      if (Array.isArray(nestedData)) {
        clientData = nestedData;
      }
    } 
    // Case 4: Response has a single client object instead of an array
    else if (response.data && typeof response.data === 'object') {
      console.warn('Client data is an object, not an array. Converting to array:', response.data);
      clientData = [response.data];
    }
    // Case 5: Response might be in another format shown in the network tab (with 'clients' property)
    else if (response.clients && Array.isArray(response.clients)) {
      clientData = response.clients;
    }
    
    // If we found client data in any format, return it
    if (clientData) {
      console.log('Processed client data:', clientData);
      return { data: clientData as Client[] };
    }
    
    // If we reach here, the data wasn't in an expected format
    console.error('Unexpected client data format:', response);
    return { data: [], error: 'Invalid data format received from server' };
  } catch (error) {
    console.error('Error fetching clients:', error);
    return { data: [], error: error instanceof Error ? error.message : 'Failed to fetch clients' };
  }
};

/**
 * Fetch a single client by ID
 */
export const getClientById = async (id: string): Promise<{ data: Client | null }> => {
  try {
    const response = await apiClient.get<ClientResponse>(`/clients/${id}`);
    return { data: response.data as Client };
  } catch (error) {
    console.error(`Error fetching client ${id}:`, error);
    return { data: null };
  }
};

/**
 * Create a new client
 */
export const createClient = async (clientData: CreateClientData): Promise<{ data: Client | null; error?: string }> => {
  try {
    const response = await apiClient.post<ClientResponse>('/clients', clientData);
    return { data: response.data as Client };
  } catch (error) {
    console.error('Error creating client:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to create client'
    };
  }
};

/**
 * Update an existing client
 */
export const updateClient = async (id: string, clientData: UpdateClientData): Promise<{ data: Client | null; error?: string }> => {
  try {
    const response = await apiClient.put<ClientResponse>(`/clients/${id}`, clientData);
    return { data: response.data as Client };
  } catch (error) {
    console.error(`Error updating client ${id}:`, error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to update client'
    };
  }
};

/**
 * Delete a client
 */
export const deleteClient = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await apiClient.delete<{ status: string; message: string }>(`/clients/${id}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting client ${id}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete client'
    };
  }
}; 