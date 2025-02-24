import { createAppointmentSchema, updateAppointmentSchema } from '../utils/validationUtils.js';
import * as appointmentService from '../services/appointmentService.js';

export const createAppointment = async (req, res) => {
    try {
        const validatedData = createAppointmentSchema.parse({
            ...req.body,
            userId: req.body.userId || req.user.id  // Използваме ID-то на служителя от body или текущия потребител
        });
        
        const appointment = await appointmentService.createAppointment({
            ...validatedData,
            startTime: new Date(validatedData.startTime),
            clientId: validatedData.clientId || null  // Експлицитно задаваме null ако няма clientId
        });
        
        res.status(201).json({
            message: 'Appointment created successfully',
            appointment
        });
    } catch (error) {
        if (error.message === 'This time slot is not available') {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error('Create appointment error:', error);
        res.status(500).json({
            message: 'Failed to create appointment',
            error: error.message
        });
    }
};

export const getAppointments = async (req, res) => {
    try {
        const appointments = await appointmentService.getAllAppointments(req.user.id);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments' });
    }
};

export const getAppointmentById = async (req, res) => {
    try {
        const appointment = await appointmentService.getAppointmentById(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({
                message: 'Appointment not found'
            });
        }

        // Проверяваме дали appointment принадлежи на текущия потребител
        if (appointment.userId !== req.user.id) {
            return res.status(403).json({
                message: 'Access denied'
            });
        }

        res.json(appointment);
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({
            message: 'Failed to fetch appointment',
            error: error.message
        });
    }
};
