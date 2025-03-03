import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all notification routes
router.use(authenticate);

// Get all notifications for the current user
router.get('/', notificationController.getNotifications);

// Get count of unread notifications
router.get('/unread-count', notificationController.getUnreadCount);

// Mark a notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

export default router; 