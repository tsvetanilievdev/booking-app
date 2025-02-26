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
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
};

/**
 * User-friendly error messages that can be displayed directly to end users
 */
export const UserFriendlyMessages = {
  // Authentication errors
  [ErrorCodes.INVALID_CREDENTIALS]: 'The email or password you entered is incorrect. Please try again.',
  [ErrorCodes.UNAUTHORIZED]: 'You need to log in to access this resource.',
  [ErrorCodes.FORBIDDEN]: 'You don\'t have permission to access this resource.',
  [ErrorCodes.TOKEN_EXPIRED]: 'Your session has expired. Please log in again.',
  
  // Resource errors
  [ErrorCodes.NOT_FOUND]: 'The requested resource could not be found.',
  [ErrorCodes.ALREADY_EXISTS]: 'This resource already exists.',
  [ErrorCodes.CONFLICT]: 'There was a conflict with the current state of the resource.',
  
  // Validation errors
  [ErrorCodes.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCodes.INVALID_INPUT]: 'The information you provided is invalid.',
  
  // Business logic errors
  [ErrorCodes.APPOINTMENT_CONFLICT]: 'This appointment conflicts with an existing booking.',
  [ErrorCodes.TIME_SLOT_UNAVAILABLE]: 'This time slot is no longer available.',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'This service is currently unavailable.',
  
  // Server errors
  [ErrorCodes.INTERNAL_ERROR]: 'Something went wrong on our end. Please try again later.',
  [ErrorCodes.DATABASE_ERROR]: 'We\'re having trouble with our database. Please try again later.',
  [ErrorCodes.EXTERNAL_SERVICE_ERROR]: 'We\'re having trouble with an external service. Please try again later.'
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

/**
 * Helper function to create a validation error
 * @param {string} message - The error message
 * @returns {AppError} A validation error
 */
export const createValidationError = (message = 'Validation failed') => {
  return new AppError(
    message, 
    400, 
    ErrorCodes.VALIDATION_ERROR
  );
};

/**
 * Helper function to create an invalid input error
 * @param {string} message - The error message
 * @returns {AppError} An invalid input error
 */
export const createInvalidInputError = (message) => {
  return new AppError(
    message, 
    400, 
    ErrorCodes.INVALID_INPUT
  );
};

/**
 * Helper function to create an appointment conflict error
 * @param {string} message - The error message
 * @returns {AppError} An appointment conflict error
 */
export const createAppointmentConflictError = (message = 'This time slot conflicts with an existing appointment') => {
  return new AppError(
    message, 
    409, 
    ErrorCodes.APPOINTMENT_CONFLICT
  );
};

/**
 * Helper function to create a time slot unavailable error
 * @param {string} message - The error message
 * @returns {AppError} A time slot unavailable error
 */
export const createTimeSlotUnavailableError = (message = 'This time slot is not available') => {
  return new AppError(
    message, 
    409, 
    ErrorCodes.TIME_SLOT_UNAVAILABLE
  );
};

/**
 * Helper function to create a service unavailable error
 * @param {string} message - The error message
 * @returns {AppError} A service unavailable error
 */
export const createServiceUnavailableError = (message = 'This service is currently unavailable') => {
  return new AppError(
    message, 
    409, 
    ErrorCodes.SERVICE_UNAVAILABLE
  );
};

/**
 * Helper function to create an internal server error
 * @param {string} message - The error message
 * @returns {AppError} An internal server error
 */
export const createInternalError = (message = 'Internal server error') => {
  return new AppError(
    message, 
    500, 
    ErrorCodes.INTERNAL_ERROR
  );
};

/**
 * Helper function to create a database error
 * @param {string} message - The error message
 * @returns {AppError} A database error
 */
export const createDatabaseError = (message = 'Database error') => {
  return new AppError(
    message, 
    500, 
    ErrorCodes.DATABASE_ERROR
  );
};

/**
 * Helper function to get a user-friendly error message from an error code
 * @param {string} code - The error code
 * @returns {string} A user-friendly error message
 */
export const getUserFriendlyMessage = (code) => {
  return UserFriendlyMessages[code] || 'An unexpected error occurred. Please try again later.';
}; 