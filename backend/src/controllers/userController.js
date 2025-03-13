import * as userService from "../services/userService.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { createToken } from "../utils/authUtils.js";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from "../utils/validationUtils.js";
import { AppError, ErrorCodes, createNotFoundError, createUnauthorizedError } from "../utils/errorUtils.js";
import logger from '../utils/logger.js';

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req, res, next) => {
    try {
        // Validate request data
        const validatedData = registerSchema.parse(req.body);
        
        // Check if user with this email already exists
        const existingUser = await userService.getUserByEmail(validatedData.email);
        if (existingUser) {
            return next(new AppError(
                'User with this email already exists', 
                409, 
                ErrorCodes.ALREADY_EXISTS
            ));
        }
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);
        
        // Create the user
        const user = await userService.createUser(
            validatedData.name, 
            validatedData.email, 
            hashedPassword, 
            validatedData.role
        );
        
        // Generate JWT token
        const token = createToken(user);
        
        // Return success response
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: { token }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login a user
 * @route POST /api/auth/login
 */
export const login = async (req, res, next) => {
    try {
        // Validate request data
        const validatedData = loginSchema.parse(req.body);
        
        // Find the user by email
        const user = await userService.getUserByEmail(validatedData.email);
        if (!user) {
            return next(createUnauthorizedError('Invalid credentials'));
        }
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
        if (!isPasswordValid) {
            return next(createUnauthorizedError('Invalid credentials'));
        }
        
        // Generate JWT token
        const token = createToken(user);
        
        // Return success response
        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: { token }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get the current user's profile
 * @route GET /api/users/profile
 */
export const getUser = async (req, res, next) => {
    try {
        const user = req.user;
        
        // Remove sensitive information
        const { password, ...userWithoutPassword } = user;
        
        res.status(200).json({
            status: 'success',
            data: { user: userWithoutPassword }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update the current user's profile
 * @route PUT /api/users/profile
 */
export const updateUser = async (req, res, next) => {
    try {
        const user = req.user;
        
        // Validate request data
        const validatedData = updateProfileSchema.parse(req.body);

        // Filter out undefined values
        const filteredData = Object.fromEntries(
            Object.entries(validatedData)
                .filter(([_, value]) => value !== undefined && value !== '')
        );

        // Check if there are fields to update
        if (Object.keys(filteredData).length === 0) {
            return next(new AppError(
                'No valid fields provided for update',
                400,
                ErrorCodes.INVALID_INPUT
            ));
        }

        // Update the user
        const updatedUser = await userService.updateUser(user.id, filteredData);

        // Remove sensitive information
        const { password, ...userWithoutPassword } = updatedUser;
        
        // Return success response
        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: { user: userWithoutPassword }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete the current user's account
 * @route DELETE /api/users/profile
 */
export const deleteUser = async (req, res, next) => {
    try {
        const user = req.user;
        const userEmail = user.email; // Store the email before deletion
        
        // Delete the user
        await userService.deleteUser(user.id);
        
        // Return success response
        res.status(200).json({
            status: 'success',
            message: `User with email ${userEmail} deleted successfully`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Initiate password reset process
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
    try {
        // Validate request data
        const validatedData = forgotPasswordSchema.parse(req.body);
        
        // Find the user by email
        const user = await userService.getUserByEmail(validatedData.email);
        if (!user) {
            // For security reasons, don't reveal if email exists or not
            return res.status(200).json({
                status: 'success',
                message: 'Password reset instructions sent to your email'
            });
        }
        
        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
        
        // Hash the reset token
        const hashedResetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        
        // Store the reset token and expiry in the database
        await userService.updateUser(user.id, {
            resetToken: hashedResetToken,
            resetTokenExpiry
        });
        
        // In a real application, send an email with the reset link
        // For testing purposes, log the token
        logger.info(`Reset token for ${user.email}: ${resetToken}`);
        
        // Return success response
        res.status(200).json({
            status: 'success',
            message: 'Password reset instructions sent to your email'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify reset token
 * @route GET /api/auth/verify-reset-token/:token
 */
export const verifyResetToken = async (req, res, next) => {
    try {
        const { token } = req.params;
        
        // Hash the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        
        // Find user by reset token and check if it's valid
        const user = await userService.getUserByResetToken(hashedToken);
        
        if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            return res.status(200).json({
                status: 'success',
                valid: false
            });
        }
        
        // Return success response
        res.status(200).json({
            status: 'success',
            valid: true
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reset password using token
 * @route POST /api/auth/reset-password
 */
export const resetPassword = async (req, res, next) => {
    try {
        // Validate request data
        const validatedData = resetPasswordSchema.parse(req.body);
        
        // Hash the token
        const hashedToken = crypto
            .createHash('sha256')
            .update(validatedData.token)
            .digest('hex');
        
        // Find user by reset token and check if it's valid
        const user = await userService.getUserByResetToken(hashedToken);
        
        if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            return next(new AppError(
                'Invalid or expired reset token',
                400,
                ErrorCodes.INVALID_TOKEN
            ));
        }
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);
        
        // Update the user's password and clear the reset token
        await userService.updateUser(user.id, {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null
        });
        
        // Return success response
        res.status(200).json({
            status: 'success',
            message: 'Password has been reset successfully'
        });
    } catch (error) {
        next(error);
    }
};