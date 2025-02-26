import * as serviceService from '../services/serviceService.js';
import { AppError } from '../utils/errorUtils.js';
import prisma from '../db.js';

export const createService = async (req, res, next) => {
    try {
        const service = await serviceService.createService(req.body);
        res.status(201).json({
            status: 'success',
            message: 'Service created successfully',
            data: { service }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllServices = async (req, res, next) => {
    try {
        const services = await serviceService.getAllServices();
        res.json({
            status: 'success',
            results: services.length,
            data: { services }
        });
    } catch (error) {
        next(error);
    }
};

export const getServiceById = async (req, res, next) => {
    try {
        const service = await serviceService.getServiceById(req.params.id);
        if (!service) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Service not found' 
            });
        }
        res.json({
            status: 'success',
            data: { service }
        });
    } catch (error) {
        next(error);
    }
};

export const updateService = async (req, res, next) => {
    try {
        const service = await serviceService.updateService(req.params.id, req.body);
        res.json({
            status: 'success',
            message: 'Service updated successfully',
            data: { service }
        });
    } catch (error) {
        if (error.message === 'Service not found') {
            return res.status(404).json({ 
                status: 'error',
                message: 'Service not found',
                details: `Service with ID ${req.params.id} does not exist`
            });
        }
        
        console.error('Update service error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Failed to update service',
            error: error.message 
        });
    }
};

export const deleteService = async (req, res, next) => {
    try {
        const deletedService = await serviceService.deleteService(req.params.id);
        res.json({ 
            status: 'success',
            message: 'Service deleted successfully', 
            data: { service: deletedService }
        });
    } catch (error) {
        if (error.message === 'Service not found') {
            return res.status(404).json({ 
                status: 'error',
                message: 'Service not found',
                details: `Service with ID ${req.params.id} does not exist`
            });
        }
        
        console.error('Delete service error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Failed to delete service',
            error: error.message 
        });
    }
};

/**
 * @swagger
 * /services/popular:
 *   get:
 *     summary: Get most popular services
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of services to return
 *     responses:
 *       200:
 *         description: List of popular services
 *       500:
 *         description: Server error
 */
export const getPopularServices = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        
        const services = await prisma.service.findMany({
            orderBy: {
                bookingCount: 'desc'
            },
            take: limit
        });
        
        res.json({
            status: 'success',
            results: services.length,
            data: { services }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /services/revenue:
 *   get:
 *     summary: Get service revenue statistics
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service revenue statistics
 *       500:
 *         description: Server error
 */
export const getServiceRevenue = async (req, res, next) => {
    try {
        const services = await prisma.service.findMany({
            orderBy: {
                revenue: 'desc'
            }
        });
        
        // Calculate total revenue
        const totalRevenue = services.reduce((sum, service) => sum + service.revenue, 0);
        
        res.json({
            status: 'success',
            data: { 
                totalRevenue,
                services 
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /services/{id}/availability:
 *   put:
 *     summary: Update service availability
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isAvailable:
 *                 type: boolean
 *               availableDays:
 *                 type: array
 *                 items:
 *                   type: integer
 *               availableTimeStart:
 *                 type: integer
 *               availableTimeEnd:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Service availability updated successfully
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
export const updateServiceAvailability = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isAvailable, availableDays, availableTimeStart, availableTimeEnd } = req.body;
        
        // Validate time range if provided
        if (availableTimeStart !== undefined && availableTimeEnd !== undefined) {
            if (availableTimeStart < 0 || availableTimeStart > 23 || 
                availableTimeEnd < 0 || availableTimeEnd > 24 || 
                availableTimeStart >= availableTimeEnd) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid time range. Start time must be before end time and within 0-23 hours.'
                });
            }
        }
        
        // Validate days if provided
        if (availableDays !== undefined) {
            const validDays = availableDays.every(day => day >= 0 && day <= 6);
            if (!validDays) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid days. Days must be between 0 (Sunday) and 6 (Saturday).'
                });
            }
        }
        
        // Get the existing service
        const existingService = await serviceService.getServiceById(id);
        
        if (!existingService) {
            return res.status(404).json({
                status: 'error',
                message: 'Service not found'
            });
        }
        
        // Update service availability
        const updateData = {};
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
        if (availableDays !== undefined) updateData.availableDays = availableDays;
        if (availableTimeStart !== undefined) updateData.availableTimeStart = availableTimeStart;
        if (availableTimeEnd !== undefined) updateData.availableTimeEnd = availableTimeEnd;
        
        const service = await serviceService.updateService(id, updateData);
        
        res.json({
            status: 'success',
            message: 'Service availability updated successfully',
            data: { service }
        });
    } catch (error) {
        next(error);
    }
}; 