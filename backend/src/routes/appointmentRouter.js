import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateAppointment } from '../middleware/validationMiddleware.js';

const router = Router();

// All appointment routes should be protected
router.use(protect);

// Get user's own appointments
router.get('/my-appointments', appointmentController.getMyAppointments);

// Get appointments by service
router.get('/service/:serviceId', appointmentController.getAppointmentsByService);

// Get appointments by client
router.get('/client/:clientId', appointmentController.getAppointmentsByClient);

// Get appointments by date range
router.get('/date-range', appointmentController.getAppointmentsByDateRange);

// Regular CRUD routes
router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', validateAppointment, appointmentController.createAppointment);
router.put('/:id', validateAppointment, appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

export default router; 