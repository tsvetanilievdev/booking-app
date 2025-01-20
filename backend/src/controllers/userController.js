import { createUser, getUserByEmail } from "../services/userService.js";
import bcrypt from 'bcrypt';
import { createToken } from "../utils/authUtils.js";
import { setCorsHeaders } from '../middleware/cors.js';
import { registerSchema, loginSchema } from '../utils/validationUtils.js';
import { z } from 'zod';
import logger from "../utils/logger.js";

export const register = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const { name, email, password, role } = validatedData;

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser(name, email, hashedPassword, role || 'USER');
        const token = createToken(user);
        
        setCorsHeaders(res);
        
        return res.status(201).json({ 
            token,
            message: 'Registration successful',
            user
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Форматираме ZodError в по-четим формат
            const formattedErrors = error.issues.map(issue => ({
                field: issue.path[0],
                message: issue.message
            }));

            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: formattedErrors
            });
        }

        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;

        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }
        const token = createToken(user);
        res.status(200).json({ token});
    } catch (error) {
        logger.error('Login error:', error);

        if (error instanceof z.ZodError) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: error.errors 
            });
        }

        if (error.type === 'SERVER_ERROR') {
            return res.status(500).json({ 
                message: error.message 
            });
        }

        res.status(500).json({
            message: 'Internal server error'
        });
    }
};
