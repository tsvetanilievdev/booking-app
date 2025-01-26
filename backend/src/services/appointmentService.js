import prisma from '../db.js';

export const createAppointment = async (appointmentData) => {
    return prisma.appointment.create({
        data: appointmentData,
        include: {
            Service: true,
            User: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
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
            }
        }
    });
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
            }
        },
        orderBy: {
            date: 'asc'
        }
    });
};
