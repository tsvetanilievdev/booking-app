import prisma from '../db.js';

export const createAppointment = async (appointmentData) => {
    return prisma.appointment.create({
        data: appointmentData,
        include: {
            User: true,
            Service: true,
            Client: true
        }
    });
};

export const getAllAppointments = async () => {
    return prisma.appointment.findMany({
        include: {
            User: true,
            Service: true,
            Client: true
        },
        orderBy: {
            date: 'asc'
        }
    });
}; 

export const getAppointmentById = async (id) => {
    return prisma.appointment.findUnique({
        where: { id },
        include: {
            User: true,
            Service: true,
            Client: true
        }
    });
};

export const updateAppointment = async (id, appointmentData) => {
    return prisma.appointment.update({
        where: { id },
        data: appointmentData,
        include: {
            User: true,
            Service: true,
            Client: true
        }
    });
};

export const deleteAppointment = async (id) => {
    return prisma.appointment.delete({
        where: { id }
    });
};

export const getAppointmentsByUserId = async (userId) => {
    return prisma.appointment.findMany({
        where: { userId },
        include: {
            User: true,
            Service: true,
            Client: true
        },
        orderBy: {
            date: 'asc'
        }
    });
};

export const checkForConflicts = async (userId, date, appointmentId = null) => {
    try {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const where = {
            userId,
            date: {
                gte: startOfDay,
                lte: endOfDay
            }
        };

        // Ако имаме appointmentId (при update), изключваме текущия appointment
        if (appointmentId) {
            where.id = {
                not: String(appointmentId)
            };
        }

        const existingAppointments = await prisma.appointment.findMany({
            where
        });

        return existingAppointments;
    } catch (error) {
        console.error('Error checking for conflicts:', error);
        throw new Error('Failed to check for appointment conflicts');
    }
};

export const getAppointmentsByService = async (serviceId) => {
    return prisma.appointment.findMany({
        where: { serviceId },
        include: {
            User: true,
            Service: true,
            Client: true
        },
        orderBy: {
            date: 'asc'
        }
    });
};

export const getAppointmentsByClient = async (clientId) => {
    return prisma.appointment.findMany({
        where: { clientId },
        include: {
            User: true,
            Service: true,
            Client: true
        },
        orderBy: {
            date: 'asc'
        }
    });
};

export const getAppointmentsByDateRange = async (startDate, endDate) => {
    return prisma.appointment.findMany({
        where: {
            date: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        },
        include: {
            User: true,
            Service: true,
            Client: true
        },
        orderBy: {
            date: 'asc'
        }
    });
}; 