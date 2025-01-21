import jwt from 'jsonwebtoken';
import { getUserById } from '../services/userService.js';

export const protect = async (req, res, next) => {
    try {
        const bearer = req.headers.authorization;
        
        if (!bearer || !bearer.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = bearer.split('Bearer ')[1];
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await getUserById(decoded.id);
            
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            req.user = {
                id: user.id,
                name: user.name,
                email: user.email,
            }
            next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            }
            throw error;
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}; 