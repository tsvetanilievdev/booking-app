import jwt from 'jsonwebtoken';
import { ApiError, ErrorTypes, asyncHandler } from './errorHandler.js';
import prisma from '../db.js';
import logger from '../utils/logger.js';

/**
 * Middleware to authenticate users based on JWT token
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  
  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // If no token found, return unauthorized error
  if (!token) {
    throw new ApiError(401, 'Not authorized, no token provided', {
      headers: Object.keys(req.headers)
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    // If user not found, return unauthorized error
    if (!user) {
      throw new ApiError(401, 'Not authorized, user not found', {
        userId: decoded.id
      });
    }
    
    // Add user to request object
    req.user = user;
    
    // Log successful authentication
    logger.info(`User authenticated: ${user.email}`, {
      userId: user.id,
      role: user.role,
      path: req.path
    });
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Not authorized, invalid token', {
        error: error.message
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Not authorized, token expired', {
        expiredAt: error.expiredAt
      });
    }
    
    // If it's already an ApiError, just pass it along
    if (error instanceof ApiError) {
      throw error;
    }
    
    // For any other errors
    throw new ApiError(401, 'Not authorized', {
      error: error.message
    });
  }
});

/**
 * Middleware to restrict access to admin users only
 */
export const restrictToAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new ApiError(403, 'Not authorized, admin access required', {
      userRole: req.user?.role || 'unknown'
    });
  }
  
  logger.info(`Admin access granted: ${req.user.email}`, {
    userId: req.user.id,
    path: req.path
  });
  
  next();
}); 