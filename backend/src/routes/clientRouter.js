import { Router } from 'express';
import * as clientController from '../controllers/clientController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateClient } from '../middleware/validationMiddleware.js';

const router = Router();

// All client routes should be protected
router.use(protect);

// Get VIP clients
router.get('/vip', clientController.getVipClients);

// Standard CRUD routes
router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClientById);
router.post('/', validateClient, clientController.createClient);
router.put('/:id', validateClient, clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

// Client preferences and VIP status
router.put('/:id/preferences', clientController.updateClientPreferences);
router.put('/:id/vip', clientController.updateClientVipStatus);

export default router; 