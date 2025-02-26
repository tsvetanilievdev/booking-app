export const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

// Използване в routes:
adminRouter.use(protect);  // Първо проверяваме дали е логнат
adminRouter.use(requireRole('ADMIN')); // После проверяваме дали е админ 

// Този код трябва да се премести в отделен файл - например backend/src/routes/adminRouter.js
// Тук в roleMiddleware.js трябва да остане само middleware функционалността

