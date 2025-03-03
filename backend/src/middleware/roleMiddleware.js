export const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

// This middleware can be used after authentication to check if a user has the required role
// Example usage in routes:
// router.use(authenticate);  // First check if user is logged in
// router.use(requireRole('ADMIN')); // Then check if user is an admin

