import prisma from '../db.js';
import * as appointmentService from '../services/appointmentService.js';

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

export const validateAppointment = async (req, res, next) => {
    const { serviceId, clientId, date } = req.body;
    const errors = [];

    if (!serviceId) {
        errors.push('Service ID is required');
    }

    if (!date) {
        errors.push('Date is required');
    } else {
        const appointmentDate = new Date(date);
        if (isNaN(appointmentDate.getTime())) {
            errors.push('Invalid date format');
        } else if (appointmentDate < new Date()) {
            errors.push('Appointment date cannot be in the past');
        }
    }

    if (clientId && typeof clientId !== 'number') {
        errors.push('Client ID must be a number');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // Check for scheduling conflicts
    try {
        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        });

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        const hasConflict = await appointmentService.checkForConflicts(
            req.user.id,
            date,
            service.duration,
            req.params.id // Pass current appointment ID for updates
        );

        if (hasConflict) {
            return res.status(409).json({ 
                message: 'This time slot conflicts with another appointment' 
            });
        }

        next();
    } catch (error) {
        next(error);
    }
}; 