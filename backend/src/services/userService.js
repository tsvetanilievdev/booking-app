import prisma from "../db.js";
import bcrypt from 'bcrypt';
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
        const user = await prisma.user.findUnique({
            where: {
                id
            }
        });
        return user;
    } catch (error) {
        console.log("ERROR in getUserById: ", error);
        throw new Error({message: 'User not found'});
    }
};

export const getUserByEmail = async (email) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
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