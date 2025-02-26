import prisma from '../db.js';
import { Prisma } from '@prisma/client';
import { 
    createNotFoundError, 
    createInvalidInputError, 
    createDatabaseError 
} from '../utils/errorUtils.js';

export const createService = async (serviceData) => {
    try {
        return await prisma.service.create({
            data: serviceData
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientValidationError) {
            throw createInvalidInputError('Invalid service data provided');
        }
        throw createDatabaseError('Failed to create service');
    }
};

export const getAllServices = async () => {
    try {
        return await prisma.service.findMany({
            where: {
                isDeleted: false
            }
        });
    } catch (error) {
        throw createDatabaseError('Failed to fetch services');
    }
};

export const getServiceById = async (id) => {
    try {
        const service = await prisma.service.findUnique({
            where: { id }
        });
        
        if (!service) {
            throw createNotFoundError('Service', id);
        }
        
        return service;
    } catch (error) {
        if (error.isOperational) {
            throw error;
        }
        throw createInvalidInputError('Invalid service ID format');
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
                throw createNotFoundError('Service', id);
            }
        }
        throw createDatabaseError('Failed to update service');
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
                throw createNotFoundError('Service', id);
            }
        }
        throw createDatabaseError('Failed to delete service');
    }
};
