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
        throw new Error('Something went wrong');
    }
};

export const register = async (name, email, password, role = 'USER') => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        });
        return user;
    } catch (error) {
        console.log("ERROR in registerUser: ", error);
        throw new Error('Something went wrong');
    }
}

export const login = async (email, password) => {
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });
    if (!user) {
        throw new Error('Invalid email or password');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }
    return user;
};