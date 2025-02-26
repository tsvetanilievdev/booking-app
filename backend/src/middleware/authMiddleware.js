import jwt from 'jsonwebtoken';
import { getUserById } from '../services/userService.js';
import { createUnauthorizedError, ErrorCodes, AppError } from '../utils/errorUtils.js';

export const protect = async (req, res, next) => {
    try {
        const bearer = req.headers.authorization;
        
        if (!bearer || !bearer.startsWith('Bearer ')) {
            return next(createUnauthorizedError('Authentication token is missing or invalid'));
        }

        const token = bearer.split('Bearer ')[1];
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await getUserById(decoded.id);
            
            if (!user) {
                return next(createUnauthorizedError('User associated with this token no longer exists'));
            }
            req.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
            next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return next(createUnauthorizedError('Invalid authentication token'));
            }
            if (error.name === 'TokenExpiredError') {
                return next(createUnauthorizedError('Authentication token has expired'));
            }
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(createUnauthorizedError('You are not logged in'));
        }
        
        if (!roles.includes(req.user.role)) {
            return next(new AppError(
                'You do not have permission to perform this action', 
                403, 
                ErrorCodes.FORBIDDEN
            ));
        }
        
        next();
    };
}; 