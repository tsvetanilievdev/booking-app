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

export const validateClient = (req, res, next) => {
    const { name, phone, email, notes } = req.body;
    const errors = [];

    // Name is required
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Name is required and must be a non-empty string');
    }

    // Phone is optional but must be valid if provided
    if (phone !== undefined && phone !== null) {
        if (typeof phone !== 'string' || phone.trim().length === 0) {
            errors.push('Phone must be a valid string');
        }
    }

    // Email is optional but must be valid if provided
    if (email !== undefined && email !== null) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof email !== 'string' || !emailRegex.test(email)) {
            errors.push('Email must be a valid email address');
        }
    }

    // Notes should be an array of strings if provided
    if (notes !== undefined && notes !== null) {
        if (!Array.isArray(notes) || !notes.every(note => typeof note === 'string')) {
            errors.push('Notes must be an array of strings');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
}; 