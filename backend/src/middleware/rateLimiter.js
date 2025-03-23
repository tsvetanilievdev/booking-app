import rateLimit from 'express-rate-limit';

export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 5,
    message: (req) => ({
        message: `Too many registration attempts from IP ${req.ip}. Please try again later.`,
        ip: req.ip,
        timeWindow: '1 hour',
        maxAttempts: 5
    }),
    standardHeaders: true,
    legacyHeaders: false
}); 

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 55, // 5 requests per windowMs
    message: (req) => ({ message: `Too many login attempts from IP ${req.ip}. Please try again later.` })
}); 