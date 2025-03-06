/**
 * Helper functions for API requests with consistent error handling
 */

/**
 * Fetch with error handling
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  options: RequestInit
): Promise<T> {
  console.log(`API Request: ${options.method} ${url}`);
  
  try {
    const response = await fetch(url, options);
    console.log(`API Response status: ${response.status} for ${options.method} ${url}`);
    
    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      // Try to parse error response as JSON
      let errorData: any;
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          console.error('API Error Response:', errorData);
        } else {
          errorData = await response.text();
          console.error('API Error Response (text):', errorData);
        }
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
        errorData = { message: 'Unknown error occurred' };
      }
      
      // Create a custom error with status and data
      const error = new Error(
        errorData.message || `Request failed with status ${response.status}`
      ) as Error & { status?: number; data?: any };
      
      error.status = response.status;
      error.data = errorData;
      
      throw error;
    }
    
    // Check if response is empty
    if (response.status === 204) {
      console.log('Empty response (204 No Content)');
      return {} as T;
    }
    
    // Parse response as JSON
    try {
      const data = await response.json();
      console.log(`API Response data for ${options.method} ${url}:`, data);
      return data as T;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error('Failed to parse response');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`API Request failed for ${options.method} ${url}:`, error.message);
    } else {
      console.error(`API Request failed for ${options.method} ${url}:`, error);
    }
    throw error;
  }
}

/**
 * Fetch with timeout
 */
export async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit,
  timeoutMs: number = 10000
): Promise<T> {
  const controller = createAbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.error(`Request timeout after ${timeoutMs}ms for ${options.method} ${url}`);
  }, timeoutMs);
  
  try {
    const response = await fetchWithErrorHandling<T>(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Create an abort controller
 */
export function createAbortController(): AbortController {
  return new AbortController();
}

/**
 * Formats error messages from API responses
 */
export function formatErrorMessage(error: any): string {
  if (!error) {
    return 'An unknown error occurred';
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error.data && error.data.message) {
    return error.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
} 