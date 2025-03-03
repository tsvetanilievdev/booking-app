import { ZodError } from 'zod';
import logger from '../utils/logger.js';
import { ErrorCodes, getUserFriendlyMessage } from '../utils/errorUtils.js';

// Custom error class for API errors
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST'
};

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    // Default error values
    let statusCode = err.statusCode || 500;
    let errorType = err.name || ErrorTypes.INTERNAL_SERVER_ERROR;
    let message = err.message || 'Something went wrong';
    let details = err.details || null;
    
    // Handle Prisma errors
    if (err.code && err.code.startsWith('P')) {
        errorType = ErrorTypes.DATABASE_ERROR;
        
        // Map common Prisma error codes to appropriate status codes and messages
        switch (err.code) {
            case 'P2002': // Unique constraint failed
                statusCode = 409;
                message = 'A record with this data already exists';
                details = err.meta?.target || null;
                break;
            case 'P2025': // Record not found
                statusCode = 404;
                message = 'The requested resource was not found';
                break;
            case 'P2003': // Foreign key constraint failed
                statusCode = 400;
                message = 'Related record does not exist';
                details = err.meta?.field_name || null;
                break;
            default:
                statusCode = 500;
                message = 'Database operation failed';
        }
    }
    
    // Handle validation errors (e.g., from express-validator)
    if (err.array && typeof err.array === 'function') {
        errorType = ErrorTypes.VALIDATION_ERROR;
        statusCode = 400;
        message = 'Validation failed';
        details = err.array();
    }
    
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        errorType = ErrorTypes.AUTHENTICATION_ERROR;
        statusCode = 401;
        message = err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token';
    }
    
    // Log the error
    const logLevel = statusCode >= 500 ? 'error' : 'warn';
    logger[logLevel](`${errorType}: ${message}`, {
        statusCode,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id || 'unauthenticated',
        details,
        stack: statusCode >= 500 ? err.stack : undefined
    });
    
    // Send response
    res.status(statusCode).json({
        error: {
            type: errorType,
            message,
            details,
            timestamp: new Date().toISOString()
        }
    });
};

/**
 * JSON parsing error handler middleware
 */
export const jsonErrorHandler = (err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid JSON format',
            code: 'INVALID_JSON',
            userMessage: 'The request contains invalid JSON. Please check your request format.',
            details: process.env.NODE_ENV === 'production' ? undefined : err.message,
            help: 'Please check your request body format. Make sure all property names and string values are enclosed in double quotes.'
        });
    }
    next(err);
};

// Not found handler middleware
export const notFoundHandler = (req, res, next) => {
    const error = new ApiError(404, `Route not found: ${req.originalUrl}`, { path: req.originalUrl });
    error.name = ErrorTypes.RESOURCE_NOT_FOUND;
    next(error);
};

// Async handler to catch errors in async route handlers
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
}; 