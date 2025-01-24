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

export const checkForConflicts = async (userId, date, duration, excludeId = null) => {
    const appointmentDate = new Date(date);
    const endDate = new Date(appointmentDate.getTime() + duration * 60000); // duration in minutes to milliseconds

    const conflicts = await prisma.appointment.findMany({
        where: {
            userId,
            id: { not: excludeId }, // Exclude current appointment when updating
            date: {
                lt: endDate
            },
            AND: {
                date: {
                    gte: appointmentDate
                }
            }
        }
    });

    return conflicts.length > 0;
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