import { Router } from 'express';
import * as serviceController from '../controllers/serviceController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * @route GET /api/services
 * @desc Get all services
 * @access Public
 */
router.get('/', serviceController.getAllServices);

/**
 * @route GET /api/services/:id
 * @desc Get service by ID
 * @access Public
 */
router.get('/:id', serviceController.getServiceById);

/**
 * @route POST /api/services
 * @desc Create a new service
 * @access Private (Admin only)
 */
router.post('/', authenticate, serviceController.createService);

/**
 * @route PUT /api/services/:id
 * @desc Update a service
 * @access Private (Admin only)
 */
router.put('/:id', authenticate, serviceController.updateService);

/**
 * @route DELETE /api/services/:id
 * @desc Delete a service
 * @access Private (Admin only)
 */
router.delete('/:id', authenticate, serviceController.deleteService);

/**
 * @route GET /api/services/analytics
 * @desc Get service analytics
 * @access Private (Admin only)
 */
router.get('/analytics/data', authenticate, serviceController.getServiceAnalytics);

export default router; 