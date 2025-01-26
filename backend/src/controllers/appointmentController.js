import { createAppointmentSchema, updateAppointmentSchema } from '../utils/validationUtils.js';
import * as appointmentService from '../services/appointmentService.js';
import { z } from 'zod';

export const createAppointment = async (req, res) => {
    try {
        // Валидираме входящите данни
        const validatedData = createAppointmentSchema.parse(req.body);
        
        // Добавяме userId от автентикирания потребител
        const appointmentData = {
            ...validatedData,
            userId: req.user.id
        };

        const appointment = await appointmentService.createAppointment(appointmentData);
        
        res.status(201).json({
            message: 'Appointment created successfully',
            appointment
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
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
        console.error('Get appointments error:', error);
        res.status(500).json({
            message: 'Failed to fetch appointments',
            error: error.message
        });
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
