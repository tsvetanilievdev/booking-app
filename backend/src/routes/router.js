import { Router } from 'express';
import authRouter from './authRouter.js';
import userRouter from './userRouter.js';
import serviceRouter from './serviceRouter.js';
import clientRouter from './clientRouter.js';
import appointmentRouter from './appointmentRouter.js';
import notificationRouter from './notificationRouter.js';
import prisma from '../db.js';
import logger from '../utils/logger.js';

const router = Router();

// Health check endpoint for monitoring
router.get('/api/health', async (req, res) => {
  try {
    // Check the database connection
    await prisma.$connect();
    
    // Get basic memory usage
    const memoryUsage = process.memoryUsage();
    
    const healthInfo = {
      status: 'up',
      timestamp: new Date().toISOString(),
      message: 'Server is running',
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memoryUsage: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
      }
    };
    
    logger.info('Health check executed', healthInfo);
    res.status(200).json(healthInfo);
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(500).json({
      status: 'down',
      timestamp: new Date().toISOString(),
      message: 'Server is experiencing issues',
      error: error.message
    });
  }
});

// Support HEAD requests for lightweight availability checks
router.head('/api/health', async (req, res) => {
  try {
    await prisma.$connect();
    res.status(200).end();
  } catch (error) {
    res.status(500).end();
  }
});

// API routes
router.use('/api/auth', authRouter);
router.use('/api/users', userRouter);
router.use('/api/services', serviceRouter);
router.use('/api/clients', clientRouter);
router.use('/api/appointments', appointmentRouter);
router.use('/api/notifications', notificationRouter);

// 404 handler
router.use('/*', (req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

export default router;