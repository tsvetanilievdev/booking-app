export const validateService = (req, res, next) => {
    const { name, price, duration } = req.body;

    const errors = [];

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Name is required and must be a non-empty string');
    }

    if (!price || typeof price !== 'number' || price <= 0) {
        errors.push('Price is required and must be a positive number');
    }

    if (!duration || typeof duration !== 'number' || duration <= 0) {
        errors.push('Duration is required and must be a positive number');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
}; 