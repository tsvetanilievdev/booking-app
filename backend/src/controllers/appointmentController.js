import * as appointmentService from '../services/appointmentService.js';

export const createAppointment = async (req, res, next) => {
    try {
        const appointmentData = {
            ...req.body,
            userId: req.user.id,  // Get userId from authenticated user
            date: new Date(req.body.date) // Convert date string to Date object
        };
        
        const appointment = await appointmentService.createAppointment(appointmentData);
        res.status(201).json(appointment);
    } catch (error) {
        next(error);
    }
};

export const getAllAppointments = async (req, res, next) => {
    try {
        const appointments = await appointmentService.getAllAppointments();
        res.json(appointments);
    } catch (error) {
        next(error);
    }
};

export const getAppointmentById = async (req, res, next) => {
    try {
        const appointment = await appointmentService.getAppointmentById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(appointment);
    } catch (error) {
        next(error);
    }
};

export const updateAppointment = async (req, res, next) => {
    try {
        const appointmentData = {
            ...req.body,
            date: req.body.date ? new Date(req.body.date) : undefined
        };
        
        const appointment = await appointmentService.updateAppointment(
            req.params.id,
            appointmentData
        );
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(appointment);
    } catch (error) {
        next(error);
    }
};

export const deleteAppointment = async (req, res, next) => {
    try {
        await appointmentService.deleteAppointment(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const getMyAppointments = async (req, res, next) => {
    try {
        const appointments = await appointmentService.getAppointmentsByUserId(req.user.id);
        res.json(appointments);
    } catch (error) {
        next(error);
    }
}; 


export const getAppointmentsByService = async (req, res, next) => {
    try {
        const appointments = await appointmentService.getAppointmentsByService(req.params.serviceId);
        res.json(appointments);
    } catch (error) {
        next(error);
    }
};

export const getAppointmentsByClient = async (req, res, next) => {
    try {
        const appointments = await appointmentService.getAppointmentsByClient(Number(req.params.clientId));
        res.json(appointments);
    } catch (error) {
        next(error);
    }
};

export const getAppointmentsByDateRange = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required' });
        }
        
        const appointments = await appointmentService.getAppointmentsByDateRange(startDate, endDate);
        res.json(appointments);
    } catch (error) {
        next(error);
    }
};
