import prisma from '../db.js';

export const createClient = async (clientData) => {
    return prisma.client.create({
        data: clientData
    });
};

export const getAllClients = async () => {
    return prisma.client.findMany({
        orderBy: {
            name: 'asc'
        },
        include: {
            appointments: true
        }
    });
};

export const getClientById = async (id) => {
    return prisma.client.findUnique({
        where: { id },
        include: {
            appointments: true
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
    return prisma.client.delete({
        where: { id }
    });
};

export const addNoteToClient = async (clientId, note) => {
    return prisma.client.update({
        where: { id: clientId },
        data: { notes: { push: note } }
    });
};

