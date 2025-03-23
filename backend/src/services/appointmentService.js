import prisma from '../db.js';
import * as notificationUtils from '../utils/notificationUtils.js';
import {
    createNotFoundError,
    createTimeSlotUnavailableError,
    createDatabaseError,
    createAppointmentConflictError,
    createBadRequestError
} from '../utils/errorUtils.js';
import logger from '../utils/logger.js';

/**
 * Проверява за конфликти в графика на служителя
 */
const checkTimeSlotAvailability = async (userId, startTime, endTime) => {
    const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
            userId,
            isDeleted: false,
            isCancelled: false,
            OR: [
                // Нов час започва по време на съществуващ
                {
                    AND: [
                        { startTime: { lte: startTime } },
                        { endTime: { gt: startTime } }
                    ]
                },
                // Нов час завършва по време на съществуващ
                {
                    AND: [
                        { startTime: { lt: endTime } },
                        { endTime: { gte: endTime } }
                    ]
                },
                // Нов час изцяло обхваща съществуващ
                {
                    AND: [
                        { startTime: { gte: startTime } },
                        { endTime: { lte: endTime } }
                    ]
                }
            ]
        }
    });

    return !conflictingAppointment;
};

/**
 * Get all appointments with filtering options
 */
export const getAppointments = async (filters = {}) => {
    try {
        const { 
            startDate, 
            endDate, 
            status, 
            clientId, 
            serviceId, 
            page = 1, 
            limit = 10,
            includeDeleted = false
        } = filters;
        
        // Parse page and limit as numbers
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        
        // Calculate skip value for pagination
        const skip = (pageNum - 1) * limitNum;
        
        // Build where clause based on filters
        const where = {
            isDeleted: includeDeleted ? undefined : false,
            ...(startDate && { startTime: { gte: new Date(startDate) } }),
            ...(endDate && { endTime: { lte: new Date(endDate) } }),
            ...(status && { isCancelled: status === 'CANCELLED' }),
            ...(clientId && { clientId: parseInt(clientId, 10) }),
            ...(serviceId && { serviceId }),
        };
        
        // Query appointments with pagination
        const [appointments, totalCount] = await Promise.all([
            prisma.appointment.findMany({
                where,
                include: {
                    User: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    Service: true,
                    Client: true,
                },
                skip,
                take: limitNum,
                orderBy: { startTime: 'asc' },
            }),
            prisma.appointment.count({ where }),
        ]);
        
        return {
            appointments,
            pagination: {
                total: totalCount,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(totalCount / limitNum),
            },
        };
    } catch (error) {
        logger.error('Error fetching appointments:', error);
        throw error;
    }
};

/**
 * Get a single appointment by ID
 */
export const getAppointmentById = async (id) => {
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                Service: true,
                Client: true,
            },
        });
        
        if (!appointment) {
            throw createNotFoundError('Appointment', id);
        }
        
        return appointment;
    } catch (error) {
        logger.error(`Error fetching appointment ${id}:`, error);
        throw error;
    }
};

/**
 * Check for appointment conflicts
 * This is a critical function to prevent double-booking
 */
export const checkAppointmentConflicts = async (startTime, endTime, serviceId, excludeAppointmentId = null) => {
    try {
        // Validate date parameters
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            logger.error(`Invalid date values: startTime=${startTime}, endTime=${endTime}`);
            throw new Error('Invalid date format provided for appointment conflict check');
        }
        
        // Build where clause to detect any overlapping appointments
        const where = {
            AND: [
                { 
                    OR: [
                        // Case 1: New appointment starts during an existing appointment
                        {
                            AND: [
                                { startTime: { lte: startDate } },
                                { endTime: { gt: startDate } }
                            ]
                        },
                        // Case 2: New appointment ends during an existing appointment
                        {
                            AND: [
                                { startTime: { lt: endDate } },
                                { endTime: { gte: endDate } }
                            ]
                        },
                        // Case 3: New appointment completely contains an existing appointment
                        {
                            AND: [
                                { startTime: { gte: startDate } },
                                { endTime: { lte: endDate } }
                            ]
                        }
                    ]
                },
                { serviceId },
                { isDeleted: false },
                { isCancelled: false },
                ...(excludeAppointmentId ? [{ id: { not: excludeAppointmentId } }] : [])
            ]
        };
        
        // Count conflicts
        const conflicts = await prisma.appointment.findMany({
            where,
            select: {
                id: true,
                startTime: true,
                endTime: true,
                Client: {
                    select: {
                        name: true
                    }
                }
            }
        });
        
        return conflicts;
    } catch (error) {
        logger.error('Error checking appointment conflicts:', error);
        throw error;
    }
};

/**
 * Check if a service is available at the given time
 */
export const checkServiceAvailability = async (serviceId, startTime, endTime) => {
    try {
        // Validate date parameters
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            logger.error(`Invalid date values: startTime=${startTime}, endTime=${endTime}`);
            return {
                available: false,
                reason: 'Invalid date format provided for appointment'
            };
        }
        
        // Get service details with availability settings
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
        });
        
        if (!service) {
            throw createNotFoundError('Service', serviceId);
        }
        
        // Check if service is available
        if (!service.isAvailable) {
            return {
                available: false,
                reason: 'Service is not available for booking'
            };
        }
        
        // Parse start and end time
        const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Check if service is available on this day
        if (!service.availableDays.includes(dayOfWeek)) {
            return {
                available: false,
                reason: `Service is not available on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}`
            };
        }
        
        // Parse hours for time range check
        const appointmentStartHour = startDate.getHours();
        const appointmentEndHour = endDate.getHours();
        
        // Check if appointment is within service available hours
        if (appointmentStartHour < service.availableTimeStart || appointmentEndHour > service.availableTimeEnd) {
            return {
                available: false,
                reason: `Service is only available between ${service.availableTimeStart}:00 and ${service.availableTimeEnd}:00`
            };
        }
        
        // Check for conflicts with other appointments
        const conflicts = await checkAppointmentConflicts(startTime, endTime, serviceId);
        
        if (conflicts.length > 0) {
            return {
                available: false,
                reason: 'Time slot conflicts with existing appointment',
                conflicts
            };
        }
        
        // If we get here, the service is available
        return {
            available: true
        };
    } catch (error) {
        logger.error(`Error checking service availability for service ${serviceId}:`, error);
        throw error;
    }
};

/**
 * Create a new appointment
 */
export const createAppointment = async (appointmentData) => {
    try {
        const { userId, serviceId, clientId, startTime, endTime, notes } = appointmentData;
        
        // Validate date parameters
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            logger.error(`Invalid date values in createAppointment: startTime=${startTime}, endTime=${endTime}`);
            throw createBadRequestError('Invalid date format provided for appointment');
        }
        
        // Validate client exists
        if (clientId) {
            const client = await prisma.client.findUnique({
                where: { id: clientId },
            });
            
            if (!client) {
                throw createNotFoundError('Client', clientId);
            }
        }
        
        // Validate service exists
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
        });
        
        if (!service) {
            throw createNotFoundError('Service', serviceId);
        }
        
        // Check service availability
        const availability = await checkServiceAvailability(serviceId, startTime, endTime);
        
        if (!availability.available) {
            throw createBadRequestError(availability.reason);
        }
        
        // Create the appointment
        const appointment = await prisma.appointment.create({
            data: {
                userId,
                serviceId,
                clientId,
                startTime: startDate,
                endTime: endDate,
                notes: notes || [],
            },
            include: {
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                Service: true,
                Client: true,
            },
        });
        
        // Update the service booking count and revenue
        await prisma.service.update({
            where: { id: serviceId },
            data: {
                bookingCount: { increment: 1 },
                revenue: { increment: service.price },
            },
        });
        
        // If there's a client, update their stats
        if (clientId) {
            await prisma.client.update({
                where: { id: clientId },
                data: {
                    totalVisits: { increment: 1 },
                    totalSpent: { increment: service.price },
                    lastVisit: new Date(),
                },
            });
        }
        
        // Send notification to service provider
        notificationUtils.notifyNewBooking(appointment, appointment.User);
        
        // Send notification to client if there is one
        if (appointment.Client) {
            notificationUtils.notifyNewBooking(appointment, appointment.Client);
        }
        
        return appointment;
    } catch (error) {
        logger.error('Error creating appointment:', error);
        throw error;
    }
};

/**
 * Get all appointments for a specific user
 */
export const getAllAppointments = async (userId) => {
    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                userId,
                isDeleted: false,
            },
            include: {
                Service: true,
                Client: true,
            },
            orderBy: {
                startTime: 'asc',
            },
        });
        
        return appointments;
    } catch (error) {
        logger.error(`Error fetching all appointments for user ${userId}:`, error);
        throw error;
    }
};

// Добавяме нова помощна функция за проверка на свободни часове
export const getAvailableSlots = async (userId, date) => {
    // Взимаме всички часове за деня
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
        where: {
            userId,
            isDeleted: false,
            isCancelled: false,
            startTime: {
                gte: dayStart,
                lte: dayEnd
            }
        },
        orderBy: {
            startTime: 'asc'
        }
    });

    return appointments;
};

export const getAppointmentsByDateRange = async (userId, startDate, endDate) => {
    return prisma.appointment.findMany({
        where: { 
            userId,
            isDeleted: false,
            startTime: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        },
        include: {
            Service: true,
            User: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            Client: true
        },
        orderBy: {
            startTime: 'asc'
        }
    });
};

/**
 * Get appointments for today
 */
export const getTodayAppointments = async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return getAppointmentsByDateRange(userId, today, tomorrow);
};

export const getWeekAppointments = async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return getAppointmentsByDateRange(userId, today, nextWeek);
};

export const getMonthAppointments = async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    return getAppointmentsByDateRange(userId, today, nextMonth);
};

// Expose the getAvailableSlots function that already exists in the service
export const getAvailableTimeSlots = async (userId, date, serviceId) => {
    try {
        // Get the service to determine duration
        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        });
        
        if (!service) {
            throw createNotFoundError('Service', serviceId);
        }
        
        // Get working hours (9 AM to 5 PM by default)
        const workingHours = {
            start: 9, // 9 AM
            end: 17   // 5 PM
        };
        
        // Get all appointments for the day
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const appointments = await prisma.appointment.findMany({
            where: {
                userId,
                isDeleted: false,
                isCancelled: false,
                startTime: {
                    gte: dayStart,
                    lte: dayEnd
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        });
        
        // Generate available time slots
        const slots = [];
        const slotDuration = service.duration; // in minutes
        const slotIntervals = 30; // minimum slot interval in minutes
        
        // Start from working hours start
        const startHour = workingHours.start;
        const endHour = workingHours.end;
        
        // Generate all possible slots
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += slotIntervals) {
                const slotTime = new Date(date);
                slotTime.setHours(hour, minute, 0, 0);
                
                // Skip slots in the past
                if (slotTime < new Date()) continue;
                
                // Calculate slot end time
                const slotEndTime = new Date(slotTime.getTime() + slotDuration * 60000);
                
                // Skip if slot ends after working hours
                const slotEndHour = slotEndTime.getHours() + (slotEndTime.getMinutes() / 60);
                if (slotEndHour > endHour) continue;
                
                // Check if slot conflicts with any existing appointment
                const isAvailable = !appointments.some(appointment => {
                    const appointmentStart = new Date(appointment.startTime);
                    const appointmentEnd = new Date(appointment.endTime);
                    
                    // Check for overlap
                    return (
                        (slotTime >= appointmentStart && slotTime < appointmentEnd) || // Slot starts during appointment
                        (slotEndTime > appointmentStart && slotEndTime <= appointmentEnd) || // Slot ends during appointment
                        (slotTime <= appointmentStart && slotEndTime >= appointmentEnd) // Slot contains appointment
                    );
                });
                
                if (isAvailable) {
                    slots.push({
                        startTime: slotTime,
                        endTime: slotEndTime,
                        duration: slotDuration
                    });
                }
            }
        }
        
        return slots;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }
        throw createDatabaseError('Failed to get available time slots');
    }
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (id) => {
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                Service: true,
                User: true,
                Client: true,
            },
        });
        
        if (!appointment) {
            throw createNotFoundError('Appointment', id);
        }
        
        // Update the appointment to cancelled
        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: {
                isCancelled: true,
            },
            include: {
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                Service: true,
                Client: true,
            },
        });
        
        // If cancellation is close to the appointment time, we might want to add a cancellation fee
        // This would be handled in a payment processing service
        
        // Send notification to service provider
        notificationUtils.notifyCancelledBooking(updatedAppointment, updatedAppointment.User);
        
        // Send notification to client if there is one
        if (updatedAppointment.Client) {
            notificationUtils.notifyCancelledBooking(updatedAppointment, updatedAppointment.Client);
        }
        
        return updatedAppointment;
    } catch (error) {
        logger.error(`Error cancelling appointment ${id}:`, error);
        throw error;
    }
};

/**
 * Delete an appointment (soft delete)
 */
export const deleteAppointment = async (id) => {
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                User: true,
                Client: true
            },
        });
        
        if (!appointment) {
            throw createNotFoundError('Appointment', id);
        }
        
        // Soft delete
        await prisma.appointment.update({
            where: { id },
            data: {
                isDeleted: true,
            },
        });
        
        // Send notification to service provider
        notificationUtils.notifyCancelledBooking(appointment, appointment.User);
        
        // Send notification to client if there is one
        if (appointment.Client) {
            notificationUtils.notifyCancelledBooking(appointment, appointment.Client);
        }
        
        return { message: 'Appointment deleted successfully' };
    } catch (error) {
        logger.error(`Error deleting appointment ${id}:`, error);
        throw error;
    }
};

export default {
    getAppointments,
    getAppointmentById,
    getAllAppointments,
    checkAppointmentConflicts,
    checkServiceAvailability,
    createAppointment,
    cancelAppointment,
    deleteAppointment,
    getTodayAppointments,
    getWeekAppointments,
    getMonthAppointments,
    getAppointmentsByDateRange,
    getAvailableTimeSlots
};
