import prisma from "../db.js";
import bcrypt from 'bcrypt';

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
        console.log("ERROR in createUser: ", error);
        throw new Error('Failed to create user');
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
            where: {
                email
            }
        });
        return user;
    } catch (error) {
        console.log("ERROR in getUserByEmail: ", error);
        throw new Error({message: 'User not found'});
    }
};