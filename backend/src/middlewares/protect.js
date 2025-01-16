import { verifyToken } from '../utils/jwt.js';

export const protect = (req, res, next) => {
    const bearer = req.headers.authorization;
    if(!bearer || bearer.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const [, token] = bearer.split('Bearer ');
    if(!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const user = verifyToken(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}