import { Router } from 'express';
import * as serviceController from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateService } from '../middleware/validationMiddleware.js';

const router = Router();

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Protected routes (require authentication)
router.use(protect);

router.post('/', validateService, serviceController.createService);
router.put('/:id', validateService, serviceController.updateService);
router.delete('/:id', serviceController.deleteService);

export default router; 