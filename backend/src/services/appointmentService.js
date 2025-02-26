import prisma from '../db.js';
import * as notificationUtils from '../utils/notificationUtils.js';
import {
    createNotFoundError,
    createTimeSlotUnavailableError,
    createDatabaseError,
    createAppointmentConflictError
} from '../utils/errorUtils.js';

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

export const createAppointment = async (appointmentData) => {
    try {
        const { userId, serviceId, startTime } = appointmentData;

        // Взимаме информация за услугата за да определим продължителността
        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        });

        if (!service) {
            throw createNotFoundError('Service', serviceId);
        }

        // Изчисляваме крайния час според продължителността на услугата
        const endTime = new Date(new Date(startTime).getTime() + service.duration * 60000);

        // Проверяваме дали слотът е свободен
        const isAvailable = await checkTimeSlotAvailability(
            userId,
            new Date(startTime),
            endTime
        );

        if (!isAvailable) {
            throw createTimeSlotUnavailableError('This time slot is not available. Please select another time.');
        }

        // Създаваме appointment с изчисления краен час
        const appointment = await prisma.appointment.create({
            data: {
                ...appointmentData,
                startTime: new Date(startTime),
                endTime,
                isDeleted: false,
                isCancelled: false
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
            }
        });
        
        // Update service analytics
        await updateServiceAnalytics(serviceId);
        
        // Update client stats if client is provided
        if (appointmentData.clientId) {
            await updateClientStats(appointmentData.clientId);
        }
        
        // Send notification for new booking
        notificationUtils.notifyNewBooking(appointment, appointment.User);
        
        // If there's a client, also notify them
        if (appointment.Client) {
            notificationUtils.notifyNewBooking(appointment, appointment.Client);
        }
        
        return appointment;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }
        throw createDatabaseError('Failed to create appointment');
    }
};

export const getAllAppointments = async (userId) => {
    return prisma.appointment.findMany({
        where: { 
            userId,
            isDeleted: false 
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
            startTime: 'asc'  // Сортираме по startTime вместо date
        }
    });
};

export const getAppointmentById = async (id) => {
    return prisma.appointment.findUnique({
        where: { id },
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
        }
    });
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

// Add a cancel appointment function
export const cancelAppointment = async (id) => {
    try {
        // Get the appointment first to include related data
        const appointment = await prisma.appointment.findUnique({
            where: { id },
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
            }
        });
        
        if (!appointment) {
            throw createNotFoundError('Appointment', id);
        }
        
        // Update the appointment to cancelled status
        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: {
                isCancelled: true
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
            }
        });
        
        // Send notification for cancelled booking
        notificationUtils.notifyCancelledBooking(updatedAppointment, updatedAppointment.User);
        
        // If there's a client, also notify them
        if (updatedAppointment.Client) {
            notificationUtils.notifyCancelledBooking(updatedAppointment, updatedAppointment.Client);
        }
        
        return updatedAppointment;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }
        throw createDatabaseError('Failed to cancel appointment');
    }
};

// Update the delete appointment function to send notifications
export const deleteAppointment = async (id) => {
    try {
        // Get the appointment first to include related data
        const appointment = await prisma.appointment.findUnique({
            where: { id },
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
            }
        });
        
        if (!appointment) {
            throw createNotFoundError('Appointment', id);
        }
        
        // Soft delete the appointment
        const deletedAppointment = await prisma.appointment.update({
            where: { id },
            data: {
                isDeleted: true
            }
        });
        
        // Send notification for cancelled booking (using the same notification type)
        notificationUtils.notifyCancelledBooking(appointment, appointment.User);
        
        // If there's a client, also notify them
        if (appointment.Client) {
            notificationUtils.notifyCancelledBooking(appointment, appointment.Client);
        }
        
        return deletedAppointment;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }
        throw createDatabaseError('Failed to delete appointment');
    }
};

// Helper function to update service analytics
const updateServiceAnalytics = async (serviceId) => {
    try {
        // Get the service
        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        });
        
        if (!service) return;
        
        // Increment booking count
        await prisma.service.update({
            where: { id: serviceId },
            data: {
                bookingCount: {
                    increment: 1
                },
                revenue: {
                    increment: service.price
                }
            }
        });
    } catch (error) {
        console.error('Error updating service analytics:', error);
    }
};

// Helper function to update client stats
const updateClientStats = async (clientId) => {
    try {
        // Import the client service function
        const { updateClientAttendanceStats } = await import('./clientService.js');
        
        // Update client stats
        await updateClientAttendanceStats(clientId);
    } catch (error) {
        console.error('Error updating client stats:', error);
    }
};
