/**
 * Custom application error class for operational errors
 * These are errors that we expect to happen and can handle gracefully
 */
export class AppError extends Error {
  constructor(message, statusCode = 400, code = 'APPLICATION_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error codes for the application
 */
export const ErrorCodes = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Business logic errors
  APPOINTMENT_CONFLICT: 'APPOINTMENT_CONFLICT',
  TIME_SLOT_UNAVAILABLE: 'TIME_SLOT_UNAVAILABLE',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
};

/**
 * Helper function to create a not found error
 * @param {string} resource - The resource that was not found (e.g., 'User', 'Appointment')
 * @param {string|number} id - The ID of the resource
 * @returns {AppError} A not found error
 */
export const createNotFoundError = (resource, id) => {
  return new AppError(
    `${resource} with ID ${id} not found`, 
    404, 
    ErrorCodes.NOT_FOUND
  );
};

/**
 * Helper function to create an unauthorized error
 * @param {string} message - The error message
 * @returns {AppError} An unauthorized error
 */
export const createUnauthorizedError = (message = 'Unauthorized access') => {
  return new AppError(
    message, 
    401, 
    ErrorCodes.UNAUTHORIZED
  );
};

/**
 * Helper function to create a forbidden error
 * @param {string} message - The error message
 * @returns {AppError} A forbidden error
 */
export const createForbiddenError = (message = 'Access forbidden') => {
  return new AppError(
    message, 
    403, 
    ErrorCodes.FORBIDDEN
  );
};

/**
 * Helper function to create a conflict error
 * @param {string} message - The error message
 * @returns {AppError} A conflict error
 */
export const createConflictError = (message) => {
  return new AppError(
    message, 
    409, 
    ErrorCodes.CONFLICT
  );
}; 