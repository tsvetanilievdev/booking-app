import { Router } from 'express';
import * as serviceController from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateService } from '../middleware/validationMiddleware.js';

const router = Router();

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Protected routes (require authentication)
router.use(protect);

// Analytics routes
router.get('/analytics/popular', serviceController.getPopularServices);
router.get('/analytics/revenue', serviceController.getServiceRevenue);

// CRUD routes
router.post('/', validateService, serviceController.createService);
router.put('/:id', validateService, serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

// Availability management
router.put('/:id/availability', serviceController.updateServiceAvailability);

export default router; 