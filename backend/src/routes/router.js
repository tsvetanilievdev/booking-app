import { Router } from 'express';
import authRouter from './authRouter.js';
import userRouter from './userRouter.js';
import serviceRouter from './serviceRouter.js';
import clientRouter from './clientRouter.js';
import appointmentRouter from './appointmentRouter.js';
const router = Router();

// API routes
router.use('/api/auth', authRouter);
router.use('/api/users', userRouter);
router.use('/api/services', serviceRouter);
router.use('/api/clients', clientRouter);
router.use('/api/appointments', appointmentRouter);
// 404 handler
router.use('/*', (req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

export default router;