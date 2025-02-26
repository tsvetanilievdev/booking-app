import { ZodError } from 'zod';
import logger from '../utils/logger.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    // Log the error for debugging
    logger.error(`${err.name}: ${err.message}`, { 
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        if (err.code === 'P2002') {
            return res.status(409).json({ 
                status: 'error',
                message: 'A record with this value already exists',
                code: 'DUPLICATE_ENTRY'
            });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({
                status: 'error',
                message: 'Record not found',
                code: 'NOT_FOUND'
            });
        }
    }

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        const formattedErrors = err.errors.map(error => ({
            path: error.path.join('.'),
            message: error.message
        }));

        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: formattedErrors,
            code: 'VALIDATION_ERROR'
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid token',
            code: 'INVALID_TOKEN'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            status: 'error',
            message: 'Token expired',
            code: 'TOKEN_EXPIRED'
        });
    }

    // Handle custom application errors
    if (err.isOperational) {
        return res.status(err.statusCode || 400).json({
            status: 'error',
            message: err.message,
            code: err.code || 'APPLICATION_ERROR'
        });
    }

    // Default error response for unhandled errors
    res.status(err.status || 500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message || 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
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
            details: err.message,
            code: 'INVALID_JSON',
            help: 'Please check your request body format. Make sure all property names and string values are enclosed in double quotes.'
        });
    }
    next(err);
}; 