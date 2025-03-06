'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getClients, Client } from '../api/clientApi';
import { getServices, Service } from '../api/serviceApi';

// Create mock data for fallback
const mockClients = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
];

const mockServices = [
  { 
    id: '1', 
    name: 'Haircut', 
    description: 'Professional haircut service',
    duration: 30, 
    price: 35,
    isAvailable: true,
    availableDays: [1, 2, 3, 4, 5],
    availableTimeStart: 900,
    availableTimeEnd: 1700
  },
  { 
    id: '2', 
    name: 'Facial', 
    description: 'Rejuvenating facial treatment',
    duration: 60, 
    price: 50,
    isAvailable: true,
    availableDays: [1, 3, 5],
    availableTimeStart: 900,
    availableTimeEnd: 1600
  }
];

interface DataContextType {
  clients: Client[];
  services: Service[];
  loadingClients: boolean;
  loadingServices: boolean;
  clientError: string | null;
  serviceError: string | null;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const [clientError, setClientError] = useState<string | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Function to refresh data
  const refreshData = () => {
    setRefreshCounter(prev => prev + 1);
  };

  // Load clients and services
  useEffect(() => {
    const loadData = async () => {
      // Reset states
      setLoadingClients(true);
      setLoadingServices(true);
      setClientError(null);
      setServiceError(null);

      // Load clients
      try {
        const clientsResponse = await getClients();
        
        if (clientsResponse?.data && Array.isArray(clientsResponse.data)) {
          console.log(`DataContext: Successfully loaded ${clientsResponse.data.length} clients`);
          setClients(clientsResponse.data);
        } else {
          console.warn('DataContext: Clients data is not an array:', clientsResponse);
          setClients(mockClients);
          if (clientsResponse.error) {
            setClientError(clientsResponse.error);
          } else {
            setClientError('Failed to load clients: Invalid data format');
          }
        }
      } catch (err) {
        console.error('DataContext: Error loading clients:', err);
        setClients(mockClients);
        setClientError(err instanceof Error ? err.message : 'Failed to load clients');
      } finally {
        setLoadingClients(false);
      }

      // Load services
      try {
        const servicesResponse = await getServices();
        
        if (servicesResponse?.data && Array.isArray(servicesResponse.data)) {
          console.log(`DataContext: Successfully loaded ${servicesResponse.data.length} services`);
          setServices(servicesResponse.data);
        } else {
          console.warn('DataContext: Services data is not an array:', servicesResponse);
          setServices(mockServices);
          if (servicesResponse.error) {
            setServiceError(servicesResponse.error);
          } else {
            setServiceError('Failed to load services: Invalid data format');
          }
        }
      } catch (err) {
        console.error('DataContext: Error loading services:', err);
        setServices(mockServices);
        setServiceError(err instanceof Error ? err.message : 'Failed to load services');
      } finally {
        setLoadingServices(false);
      }
    };

    loadData();
  }, [refreshCounter]);

  return (
    <DataContext.Provider
      value={{
        clients,
        services,
        loadingClients,
        loadingServices,
        clientError,
        serviceError,
        refreshData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}; 