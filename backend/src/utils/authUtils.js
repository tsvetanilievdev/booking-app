import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password) => bcrypt.hash(password, 10);
export const comparePasswords = async (password, hashedPassword) => bcrypt.compare(password, hashedPassword);
export const createToken = (user) => {
    const token = jwt.sign({
        id: user.id,
        email: user.email,
        name: user.name,
    }, process.env.JWT_SECRET, { expiresIn: '2h' })

    return token;
};
export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);