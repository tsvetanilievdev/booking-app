import prisma from '../db.js';
import { Prisma } from '@prisma/client';

export const createService = async (serviceData) => {
    try {
        return await prisma.service.create({
            data: serviceData
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientValidationError) {
            throw new Error('Invalid service data provided');
        }
        throw error;
    }
};

export const getAllServices = async () => {
    return await prisma.service.findMany({
        orderBy: {
            name: 'asc'
        }
    });
};

export const getServiceById = async (id) => {
    try {
        const service = await prisma.service.findUnique({
            where: { id }
        });
        
        if (!service) {
            throw new Error('Service not found');
        }
        
        return service;
    } catch (error) {
        if (error.message === 'Service not found') {
            throw error;
        }
        throw new Error('Invalid service ID format');
    }
};

export const updateService = async (id, serviceData) => {
    try {
        return await prisma.service.update({
            where: { id },
            data: serviceData
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                throw new Error('Service not found');
            }
        }
        throw new Error('Failed to update service');
    }
};

export const deleteService = async (id) => {
    try {
        return await prisma.service.delete({
            where: { id }
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                throw new Error('Service not found');
            }
        }
        throw new Error('Failed to delete service');
    }
};
