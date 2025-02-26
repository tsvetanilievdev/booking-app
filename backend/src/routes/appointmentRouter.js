import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createAppointmentSchema, updateAppointmentSchema, idParamSchema } from '../utils/validationUtils.js';
import * as appointmentController from '../controllers/appointmentController.js';

const router = express.Router();

// Всички routes изискват автентикация
router.use(protect);

// GET /api/appointments - Вземи всички appointments на потребителя
router.get('/', appointmentController.getAppointments);

// GET /api/appointments/today - Get today's appointments
router.get('/today', appointmentController.getTodayAppointments);

// GET /api/appointments/week - Get this week's appointments
router.get('/week', appointmentController.getWeekAppointments);

// GET /api/appointments/month - Get this month's appointments
router.get('/month', appointmentController.getMonthAppointments);

// GET /api/appointments/available-slots - Get available time slots
router.get('/available-slots', appointmentController.getAvailableSlots);

// GET /api/appointments/client/:clientId - Get client's appointment history
router.get('/client/:clientId', appointmentController.getClientAppointmentHistory);

// GET /api/appointments/:id - Вземи конкретен appointment
router.get('/:id', validate(idParamSchema, 'params'), appointmentController.getAppointmentById);

// POST /api/appointments - Създай нов appointment
router.post('/', validate(createAppointmentSchema), appointmentController.createAppointment);

// PUT /api/appointments/:id - Update an appointment
router.put('/:id', 
  validate(idParamSchema, 'params'),
  validate(updateAppointmentSchema),
  appointmentController.updateAppointment
);

// PUT /api/appointments/:id/cancel - Cancel an appointment
router.put('/:id/cancel',
  validate(idParamSchema, 'params'),
  appointmentController.cancelAppointment
);

// DELETE /api/appointments/:id - Delete an appointment
router.delete('/:id', 
  validate(idParamSchema, 'params'),
  appointmentController.deleteAppointment
);

export default router;
