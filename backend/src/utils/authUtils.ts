import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password: string) => bcrypt.hash(password, 10);
export const comparePasswords = async (password: string, hashedPassword: string) => bcrypt.compare(password, hashedPassword);
export const createToken = (user: User) => {
    const token = jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
    }, process.env.JWT_SECRET as string)

    return token;
};
export const verifyToken = (token: string) => jwt.verify(token, process.env.JWT_SECRET as string);