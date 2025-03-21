import prisma from "../db.js";
import logger from '../utils/logger.js';

export const createUser = async (name, email, password, role = 'USER') => {
    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password,
                role
            }
        });
        return user;
    } catch (error) {
        if (error.code === 'P2002') {
            throw {
                code: 'P2002',
                type: 'DUPLICATE_EMAIL',
                message: 'Email already exists'
            };
        }
        
        logger.error('Create user error:', error);
        throw {
            type: 'SERVER_ERROR',
            message: 'Failed to create user'
        };
    }
};

export const getUserById = async (id) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                id,
                isDeleted: false
            }
        });
        return user;
    } catch (error) {
        console.log("ERROR in getUserById: ", error);
        throw new Error('User not found');
    }
};

export const getAllUsers = async () => {
    return prisma.user.findMany({
        where: {
            role: {
                not: 'ADMIN'
            },
            isDeleted: false
        }
    });
};

export const getUserByEmail = async (email) => {
    try {
        const user = await prisma.user.findFirst({
            where: { 
                email,
                isDeleted: false
            }
        });
        return user;
    } catch (error) {
        logger.error('Get user by email error:', error);
        throw {
            type: 'SERVER_ERROR',
            message: 'Failed to fetch user'
        };
    }
};

export const updateUser = async (id, updateData) => {
    try {
        const user = await prisma.user.update({
            where: { id },
            data: updateData
        });
        return user;
    } catch (error) {
        logger.error('Update user error:', error);
        throw {
            type: 'SERVER_ERROR',
            message: 'Failed to update user'
        };
    }
};

export const updateUserPassword = async (id, newPassword) => {
    try {
        const user = await prisma.user.update({
            where: { id },
            data: { password: newPassword }
        });
        return user;
    } catch (error) {
        logger.error('Update user password error:', error);
        throw {
            type: 'SERVER_ERROR',
            message: 'Failed to update user password'
        };
    }
};

export const deleteUser = async (id) => {
    try {
        await prisma.user.update({
            where: { id },
            data: { isDeleted: true }
        });
        return true;
    } catch (error) {
        logger.error('Delete user error:', error);
        throw {
            type: 'SERVER_ERROR',
            message: 'Failed to delete user'
        };
    }
};

export const getUserByResetToken = async (resetToken) => {
    try {
        const user = await prisma.user.findFirst({
            where: { 
                resetToken,
                isDeleted: false
            }
        });
        return user;
    } catch (error) {
        logger.error('Get user by reset token error:', error);
        throw {
            type: 'SERVER_ERROR',
            message: 'Failed to fetch user by reset token'
        };
    }
};