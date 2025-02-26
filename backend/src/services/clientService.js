import prisma from '../db.js';

export const createClient = async (clientData) => {
    return prisma.client.create({
        data: clientData
    });
};

export const getAllClients = async () => {
    return prisma.client.findMany({
        where: {
            isDeleted: false
        },
        orderBy: {
            name: 'asc'
        },
        include: {
            appointments: {
                include: {
                    Service: true
                }
            }
        }
    });
};

export const getClientById = async (id) => {
    return prisma.client.findUnique({
        where: { id },
        include: {
            appointments: {
                include: {
                    Service: true
                }
            }
        }
    });
};

export const updateClient = async (id, clientData) => {
    return prisma.client.update({
        where: { id },
        data: clientData
    });
};

export const deleteClient = async (id) => {
    // Soft delete
    return prisma.client.update({
        where: { id },
        data: { isDeleted: true }
    });
};

export const addNoteToClient = async (clientId, note) => {
    return prisma.client.update({
        where: { id: clientId },
        data: { notes: { push: note } }
    });
};

export const getVipClients = async () => {
    return prisma.client.findMany({
        where: {
            isVip: true,
            isDeleted: false
        },
        orderBy: {
            name: 'asc'
        },
        include: {
            appointments: {
                include: {
                    Service: true
                }
            }
        }
    });
};

export const updateClientAttendanceStats = async (clientId) => {
    // Get all appointments for the client
    const appointments = await prisma.appointment.findMany({
        where: {
            clientId: Number(clientId),
            isDeleted: false
        }
    });
    
    // Calculate attendance rate (non-cancelled appointments / total appointments)
    const totalAppointments = appointments.length;
    const attendedAppointments = appointments.filter(app => !app.isCancelled).length;
    const attendanceRate = totalAppointments > 0 ? attendedAppointments / totalAppointments : null;
    
    // Calculate total spent
    let totalSpent = 0;
    
    // Get all completed appointments with their services
    const completedAppointments = await prisma.appointment.findMany({
        where: {
            clientId: Number(clientId),
            isDeleted: false,
            isCancelled: false,
            endTime: {
                lt: new Date()
            }
        },
        include: {
            Service: true
        }
    });
    
    // Calculate total spent
    completedAppointments.forEach(app => {
        if (app.Service) {
            totalSpent += app.Service.price;
        }
    });
    
    // Get the last visit date
    const lastAppointment = completedAppointments.sort((a, b) => 
        new Date(b.endTime) - new Date(a.endTime)
    )[0];
    
    const lastVisit = lastAppointment ? lastAppointment.endTime : null;
    
    // Update client stats
    return prisma.client.update({
        where: { id: Number(clientId) },
        data: {
            attendanceRate,
            totalVisits: attendedAppointments,
            totalSpent,
            lastVisit,
            // Automatically mark as VIP if they've spent over $500 or had more than 10 appointments
            isVip: totalSpent > 500 || attendedAppointments > 10
        }
    });
};

export const getTopClients = async (limit = 10) => {
    return prisma.client.findMany({
        where: {
            isDeleted: false
        },
        orderBy: [
            { totalSpent: 'desc' },
            { totalVisits: 'desc' }
        ],
        take: limit,
        include: {
            appointments: {
                include: {
                    Service: true
                }
            }
        }
    });
};

