import logger from './logger.js';

/**
 * Simple notification system for the booking system
 * In a real-world application, this would be replaced with:
 * - Email notifications using a service like SendGrid or Mailgun
 * - Push notifications for mobile apps
 * - SMS notifications
 * - WebSockets for real-time notifications
 */

// Store notifications in memory (for demo purposes)
// In a real app, these would be stored in a database
const notifications = [];

/**
 * Create a new notification
 * @param {string} userId - ID of the user to notify
 * @param {string} type - Type of notification (e.g., 'NEW_BOOKING', 'CANCELLATION')
 * @param {Object} data - Data related to the notification
 * @returns {Object} The created notification
 */
export const createNotification = (userId, type, data) => {
    const notification = {
        id: Date.now().toString(),
        userId,
        type,
        data,
        createdAt: new Date(),
        read: false
    };
    
    notifications.push(notification);
    logger.info(`Notification created: ${type} for user ${userId}`);
    
    return notification;
};

/**
 * Get all notifications for a user
 * @param {string} userId - ID of the user
 * @param {boolean} unreadOnly - Whether to return only unread notifications
 * @returns {Array} Array of notifications
 */
export const getUserNotifications = (userId, unreadOnly = false) => {
    return notifications.filter(notification => 
        notification.userId === userId && 
        (!unreadOnly || !notification.read)
    );
};

/**
 * Mark a notification as read
 * @param {string} notificationId - ID of the notification
 * @param {string} userId - ID of the user
 * @returns {boolean} Whether the operation was successful
 */
export const markNotificationAsRead = (notificationId, userId) => {
    const notification = notifications.find(n => 
        n.id === notificationId && n.userId === userId
    );
    
    if (notification) {
        notification.read = true;
        return true;
    }
    
    return false;
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - ID of the user
 * @returns {number} Number of notifications marked as read
 */
export const markAllNotificationsAsRead = (userId) => {
    let count = 0;
    
    notifications.forEach(notification => {
        if (notification.userId === userId && !notification.read) {
            notification.read = true;
            count++;
        }
    });
    
    return count;
};

/**
 * Create a notification for a new booking
 * @param {Object} appointment - The appointment data
 * @param {Object} user - The user data
 * @returns {Object} The created notification
 */
export const notifyNewBooking = (appointment, user) => {
    return createNotification(
        user.id,
        'NEW_BOOKING',
        {
            appointmentId: appointment.id,
            serviceName: appointment.Service.name,
            startTime: appointment.startTime,
            clientName: appointment.Client?.name || 'No client'
        }
    );
};

/**
 * Create a notification for a cancelled booking
 * @param {Object} appointment - The appointment data
 * @param {Object} user - The user data
 * @returns {Object} The created notification
 */
export const notifyCancelledBooking = (appointment, user) => {
    return createNotification(
        user.id,
        'CANCELLED_BOOKING',
        {
            appointmentId: appointment.id,
            serviceName: appointment.Service.name,
            startTime: appointment.startTime,
            clientName: appointment.Client?.name || 'No client'
        }
    );
}; 