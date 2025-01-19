import rateLimit from 'express-rate-limit';

export const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per windowMs
    message: { message: 'Too many registration attempts. Please try again later.' }
}); 

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per windowMs
    message: { message: 'Too many login attempts. Please try again later.' }
}); 