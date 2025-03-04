/**
 * Helper functions for API requests with consistent error handling
 */

// Generic fetch wrapper for better error handling
export async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Check if the response is OK (status in the range 200-299)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error ${response.status}: ${response.statusText}`
      );
    }

    // For no-content responses
    if (response.status === 204) {
      return {} as T;
    }

    // Parse JSON response
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Utility function to create a request timeout
export function createRequestTimeout(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
}

// Fetch with timeout
export async function fetchWithTimeout<T>(
  url: string,
  options?: RequestInit,
  timeoutMs: number = 10000
): Promise<T> {
  return Promise.race([
    fetchWithErrorHandling<T>(url, options),
    createRequestTimeout(timeoutMs),
  ]);
}

// Cancel pending requests for cleanup
export function createAbortController(): AbortController {
  return new AbortController();
} 