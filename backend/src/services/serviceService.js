import prisma from '../db.js';
import { Prisma } from '@prisma/client';
import { 
    createNotFoundError, 
    createInvalidInputError, 
    createDatabaseError 
} from '../utils/errorUtils.js';
import logger from '../utils/logger.js';
import { ApiError, ErrorTypes } from '../middleware/errorHandler.js';

/**
 * Create a new service
 */
export const createService = async (serviceData) => {
    try {
        logger.info('Creating new service', { serviceData });
        
        const service = await prisma.service.create({
            data: serviceData
        });
        
        logger.info('Service created successfully', { serviceId: service.id });
        return service;
    } catch (error) {
        logger.error('Error creating service', { error, serviceData });
        
        if (error.code === 'P2002') {
            throw new ApiError(409, 'A service with this name already exists', {
                field: error.meta?.target?.[0] || 'unknown'
            });
        }
        
        throw new ApiError(500, 'Failed to create service', { 
            originalError: error.message 
        });
    }
};

/**
 * Get all services
 */
export const getAllServices = async () => {
    try {
        logger.info('Fetching all services');
        
        const services = await prisma.service.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        
        logger.info(`Retrieved ${services.length} services`);
        return services;
    } catch (error) {
        logger.error('Error fetching all services', { error });
        throw new ApiError(500, 'Failed to fetch services', { 
            originalError: error.message 
        });
    }
};

/**
 * Get service by ID
 */
export const getServiceById = async (id) => {
    try {
        logger.info(`Fetching service with ID: ${id}`);
        
        const service = await prisma.service.findUnique({
            where: { id }
        });
        
        if (!service) {
            logger.warn(`Service with ID ${id} not found`);
            return null;
        }
        
        return service;
    } catch (error) {
        logger.error(`Error fetching service with ID: ${id}`, { error });
        throw new ApiError(500, 'Failed to fetch service', { 
            serviceId: id,
            originalError: error.message 
        });
    }
};

/**
 * Update service
 */
export const updateService = async (id, updateData) => {
    try {
        logger.info(`Updating service with ID: ${id}`, { updateData });
        
        const service = await prisma.service.update({
            where: { id },
            data: updateData
        });
        
        logger.info(`Service with ID ${id} updated successfully`);
        return service;
    } catch (error) {
        logger.error(`Error updating service with ID: ${id}`, { error, updateData });
        
        if (error.code === 'P2025') {
            throw new ApiError(404, `Service with ID ${id} not found`, { id });
        }
        
        if (error.code === 'P2002') {
            throw new ApiError(409, 'A service with this name already exists', {
                field: error.meta?.target?.[0] || 'unknown'
            });
        }
        
        throw new ApiError(500, 'Failed to update service', { 
            serviceId: id,
            originalError: error.message 
        });
    }
};

/**
 * Delete service
 */
export const deleteService = async (id) => {
    try {
        logger.info(`Deleting service with ID: ${id}`);
        
        const service = await prisma.service.delete({
            where: { id }
        });
        
        logger.info(`Service with ID ${id} deleted successfully`);
        return service;
    } catch (error) {
        logger.error(`Error deleting service with ID: ${id}`, { error });
        
        if (error.code === 'P2025') {
            throw new ApiError(404, `Service with ID ${id} not found`, { id });
        }
        
        if (error.code === 'P2003') {
            throw new ApiError(400, 'Cannot delete service with existing appointments', { 
                serviceId: id,
                suggestion: 'Archive the service instead of deleting it'
            });
        }
        
        throw new ApiError(500, 'Failed to delete service', { 
            serviceId: id,
            originalError: error.message 
        });
    }
};

/**
 * Check if service has appointments
 */
export const serviceHasAppointments = async (id) => {
    try {
        logger.info(`Checking if service with ID ${id} has appointments`);
        
        const appointmentCount = await prisma.appointment.count({
            where: { serviceId: id }
        });
        
        logger.info(`Service with ID ${id} has ${appointmentCount} appointments`);
        return appointmentCount > 0;
    } catch (error) {
        logger.error(`Error checking appointments for service with ID: ${id}`, { error });
        throw new ApiError(500, 'Failed to check service appointments', { 
            serviceId: id,
            originalError: error.message 
        });
    }
};

/**
 * Get service analytics
 */
export const getServiceAnalytics = async () => {
    try {
        logger.info('Fetching service analytics');
        
        // Get most popular services (by appointment count)
        const popularServices = await prisma.service.findMany({
            select: {
                id: true,
                name: true,
                price: true,
                _count: {
                    select: { appointments: true }
                }
            },
            orderBy: {
                appointments: {
                    _count: 'desc'
                }
            },
            take: 5
        });
        
        // Get total revenue by service
        const servicesWithRevenue = await prisma.service.findMany({
            select: {
                id: true,
                name: true,
                price: true,
                appointments: {
                    where: {
                        status: 'COMPLETED'
                    },
                    select: {
                        id: true
                    }
                }
            }
        });
        
        const revenueByService = servicesWithRevenue.map(service => ({
            id: service.id,
            name: service.name,
            revenue: service.appointments.length * service.price,
            appointmentCount: service.appointments.length
        })).sort((a, b) => b.revenue - a.revenue);
        
        // Format popular services
        const formattedPopularServices = popularServices.map(service => ({
            id: service.id,
            name: service.name,
            appointmentCount: service._count.appointments,
            price: service.price
        }));
        
        logger.info('Service analytics fetched successfully');
        
        return {
            popularServices: formattedPopularServices,
            revenueByService: revenueByService
        };
    } catch (error) {
        logger.error('Error fetching service analytics', { error });
        throw new ApiError(500, 'Failed to fetch service analytics', { 
            originalError: error.message 
        });
    }
};
