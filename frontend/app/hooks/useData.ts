'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseDataOptions<T> {
  initialData?: T;
  fetchOnMount?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook to handle data fetching with loading and error states.
 * This can be reused across the application for consistent loading behavior.
 */
export default function useData<T>(
  fetchFn: () => Promise<T>,
  options: UseDataOptions<T> = {}
) {
  const {
    initialData,
    fetchOnMount = true,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      setLoading(false);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
      if (onError) onError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [fetchFn, onSuccess, onError]);

  useEffect(() => {
    // Mark as initialized
    setIsInitialized(true);

    if (fetchOnMount) {
      fetchData();
    }

    // Clean up function to prevent memory leaks
    return () => {
      setLoading(false);
    };
  }, [fetchOnMount, fetchData]);

  return {
    data,
    loading,
    error,
    isInitialized,
    fetchData,
    setData
  };
} 