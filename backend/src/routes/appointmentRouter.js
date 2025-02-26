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

// DELETE /api/appointments/:id - Delete an appointment
router.delete('/:id', 
  validate(idParamSchema, 'params'),
  appointmentController.deleteAppointment
);

export default router;
