import { ZodError } from 'zod';
import logger from '../utils/logger.js';
import { ErrorCodes, getUserFriendlyMessage } from '../utils/errorUtils.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    // Log the error for debugging
    logger.error(`${err.name}: ${err.message}`, { 
        stack: err.stack,
        path: req.path,
        method: req.method,
        code: err.code || 'UNKNOWN_ERROR'
    });

    // Enhanced response structure
    const errorResponse = {
        status: 'error',
        message: '',
        code: '',
        details: process.env.NODE_ENV === 'production' ? undefined : err.message,
        errors: []
    };

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        if (err.code === 'P2002') {
            errorResponse.statusCode = 409;
            errorResponse.message = 'A record with this value already exists';
            errorResponse.code = ErrorCodes.ALREADY_EXISTS;
            
            // Add field information if available
            if (err.meta && err.meta.target) {
                errorResponse.errors = err.meta.target.map(field => ({
                    field,
                    message: `A record with this ${field} already exists`
                }));
            }
            
            return res.status(409).json(errorResponse);
        }
        if (err.code === 'P2025') {
            errorResponse.statusCode = 404;
            errorResponse.message = 'Record not found';
            errorResponse.code = ErrorCodes.NOT_FOUND;
            
            return res.status(404).json(errorResponse);
        }
        
        errorResponse.statusCode = 500;
        errorResponse.message = 'Database error';
        errorResponse.code = ErrorCodes.DATABASE_ERROR;
        
        return res.status(500).json(errorResponse);
    }

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        const formattedErrors = err.errors.map(error => ({
            field: error.path.join('.'),
            message: error.message,
            code: 'INVALID_FIELD'
        }));

        errorResponse.statusCode = 400;
        errorResponse.message = 'Validation failed';
        errorResponse.code = ErrorCodes.VALIDATION_ERROR;
        errorResponse.errors = formattedErrors;
        
        return res.status(400).json(errorResponse);
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        errorResponse.statusCode = 401;
        errorResponse.message = 'Invalid token';
        errorResponse.code = ErrorCodes.INVALID_TOKEN;
        
        return res.status(401).json(errorResponse);
    }

    if (err.name === 'TokenExpiredError') {
        errorResponse.statusCode = 401;
        errorResponse.message = 'Token expired';
        errorResponse.code = ErrorCodes.TOKEN_EXPIRED;
        
        return res.status(401).json(errorResponse);
    }

    // Handle custom application errors
    if (err.isOperational) {
        const statusCode = err.statusCode || 400;
        
        errorResponse.statusCode = statusCode;
        errorResponse.message = err.message;
        errorResponse.code = err.code || 'APPLICATION_ERROR';
        errorResponse.userMessage = getUserFriendlyMessage(err.code);
        
        return res.status(statusCode).json(errorResponse);
    }

    // Default error response for unhandled errors
    errorResponse.statusCode = err.status || 500;
    errorResponse.message = process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : err.message || 'Internal server error';
    errorResponse.code = ErrorCodes.INTERNAL_ERROR;
    errorResponse.userMessage = getUserFriendlyMessage(ErrorCodes.INTERNAL_ERROR);
    
    res.status(errorResponse.statusCode).json(errorResponse);
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