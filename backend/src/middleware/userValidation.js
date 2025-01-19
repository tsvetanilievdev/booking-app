import { MAX_NAME_LENGTH, MAX_PASSWORD_LENGTH, isValidEmail, sanitizeInput } from '../utils/validationUtils.js';
import { isStrongPassword } from '../utils/passwordUtils.js';
import sanitize from 'sanitize-html';

export const validateRegistration = (req, res, next) => {
    // Sanitize inputs
    const name = sanitizeInput(req.body.name, sanitize);
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    // Input validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Length validations
    if (name.length > MAX_NAME_LENGTH) {
        return res.status(400).json({ 
            message: `Name must not exceed ${MAX_NAME_LENGTH} characters` 
        });
    }

    if (password.length > MAX_PASSWORD_LENGTH) {
        return res.status(400).json({ 
            message: `Password must not exceed ${MAX_PASSWORD_LENGTH} characters` 
        });
    }

    // Email validation
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password strength validation
    if (!isStrongPassword(password)) {
        return res.status(400).json({ 
            message: 'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters' 
        });
    }

    // If validation passes, attach sanitized data to request
    req.sanitizedData = {
        name,
        email,
        password
    };

    next();
}; 