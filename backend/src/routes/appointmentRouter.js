import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as appointmentController from '../controllers/appointmentController.js';

const router = express.Router();

// Всички routes изискват автентикация
router.use(protect);

// GET /api/appointments - Вземи всички appointments на потребителя
router.get('/', appointmentController.getAppointments);

// GET /api/appointments/:id - Вземи конкретен appointment
router.get('/:id', appointmentController.getAppointmentById);

// POST /api/appointments - Създай нов appointment
router.post('/', appointmentController.createAppointment);

export default router;
