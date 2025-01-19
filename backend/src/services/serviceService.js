import { prisma } from '../config/prisma.js';

export const createService = async (serviceData) => {
    return prisma.service.create({
        data: serviceData
    });
};

export const getAllServices = async () => {
    return prisma.service.findMany({
        orderBy: {
            name: 'asc'
        }
    });
};

export const getServiceById = async (id) => {
    return prisma.service.findUnique({
        where: { id }
    });
};

export const updateService = async (id, serviceData) => {
    return prisma.service.update({
        where: { id },
        data: serviceData
    });
};

export const deleteService = async (id) => {
    return prisma.service.delete({
        where: { id }
    });
};
