import * as notificationUtils from '../utils/notificationUtils.js';

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Whether to return only unread notifications
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getNotifications = async (req, res, next) => {
    try {
        const unreadOnly = req.query.unreadOnly === 'true';
        const notifications = notificationUtils.getUserNotifications(req.user.id, unreadOnly);
        
        res.json({
            status: 'success',
            results: notifications.length,
            data: { notifications }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get the count of unread notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Count of unread notifications
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getUnreadCount = async (req, res, next) => {
    try {
        const notifications = notificationUtils.getUserNotifications(req.user.id, true);
        
        res.json({
            status: 'success',
            data: { count: notifications.length }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
export const markAsRead = async (req, res, next) => {
    try {
        const success = notificationUtils.markNotificationAsRead(req.params.id, req.user.id);
        
        if (!success) {
            return res.status(404).json({
                status: 'error',
                message: 'Notification not found'
            });
        }
        
        res.json({
            status: 'success',
            message: 'Notification marked as read'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const markAllAsRead = async (req, res, next) => {
    try {
        const count = notificationUtils.markAllNotificationsAsRead(req.user.id);
        
        res.json({
            status: 'success',
            message: `${count} notifications marked as read`
        });
    } catch (error) {
        next(error);
    }
}; 