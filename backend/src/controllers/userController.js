import { createUser, getUserByEmail } from "../services/userService.js";
import bcrypt from 'bcrypt';
import { createToken } from "../utils/authUtils.js";
import { setCorsHeaders } from '../middleware/cors.js';
import { registerSchema, loginSchema } from '../utils/validationUtils.js';
import { z } from 'zod';
import logger from "../utils/logger.js";

export const register = async (req, res) => {
    try {
        // Validate the request data
        const validatedData = registerSchema.parse(req.body);
        const { name, email, password } = validatedData;

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser(name, email, hashedPassword);
        const token = createToken(user);
        
        setCorsHeaders(res);
        
        return res.status(201).json({ 
            token,
            message: 'Registration successful'
        });
    } catch (error) {
        logger.error('Registration error:', error);

        // Validation errors
        if (error instanceof z.ZodError) {
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: error.errors 
            });
        }

        // Known application errors
        if (error.type === 'DUPLICATE_EMAIL') {
            return res.status(409).json({ 
                message: error.message 
            });
        }

        // Server errors
        return res.status(500).json({ 
            message: 'Internal server error' 
        });
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
        res.status(200).json({ token });
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
