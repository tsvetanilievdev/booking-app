import { Router } from 'express';
import * as clientController from '../controllers/clientController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateClient } from '../middleware/validationMiddleware.js';

const router = Router();

// All client routes should be protected
router.use(protect);

router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClientById);
router.post('/', validateClient, clientController.createClient);
router.put('/:id', validateClient, clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

export default router; 