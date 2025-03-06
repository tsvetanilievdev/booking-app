/**
 * Utility functions for API operations
 */

/**
 * Check if the backend server is accessible
 * @returns Promise<boolean> True if server is accessible, false otherwise
 */
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('API connection check:', data);
      return data.status === 'up';
    }
    
    return false;
  } catch (error) {
    console.error('API connection check failed:', error);
    return false;
  }
};

/**
 * Format an error message for display
 * @param error Error object or string
 * @returns Formatted error message string
 */
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  try {
    return JSON.stringify(error);
  } catch (e) {
    return 'An unknown error occurred';
  }
};

/**
 * Decode JWT token to get user information
 * @param token JWT token
 * @returns Decoded token payload or null if invalid
 */
export const decodeJwtToken = (token: string): any => {
  try {
    // JWT token consists of three parts separated by dots
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}; 