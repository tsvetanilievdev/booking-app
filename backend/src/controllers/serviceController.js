import * as serviceService from '../services/serviceService.js';

export const createService = async (req, res, next) => {
    try {
        const service = await serviceService.createService(req.body);
        res.status(201).json(service);
    } catch (error) {
        next(error);
    }
};

export const getAllServices = async (req, res, next) => {
    try {
        const services = await serviceService.getAllServices();
        res.json(services);
    } catch (error) {
        next(error);
    }
};

export const getServiceById = async (req, res, next) => {
    try {
        const service = await serviceService.getServiceById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(service);
    } catch (error) {
        next(error);
    }
};

export const updateService = async (req, res, next) => {
    try {
        const service = await serviceService.updateService(req.params.id, req.body);
        res.json({
            message: 'Service updated successfully',
            service
        });
    } catch (error) {
        if (error.message === 'Service not found') {
            return res.status(404).json({ 
                message: 'Service not found',
                details: `Service with ID ${req.params.id} does not exist`
            });
        }
        
        console.error('Update service error:', error);
        res.status(500).json({ 
            message: 'Failed to update service',
            error: error.message 
        });
    }
};

export const deleteService = async (req, res, next) => {
    try {
        const deletedService = await serviceService.deleteService(req.params.id);
        res.json({ 
            message: 'Service deleted successfully', 
            service: deletedService 
        });
    } catch (error) {
        if (error.message === 'Service not found') {
            return res.status(404).json({ 
                message: 'Service not found',
                details: `Service with ID ${req.params.id} does not exist`
            });
        }
        
        console.error('Delete service error:', error);
        res.status(500).json({ 
            message: 'Failed to delete service',
            error: error.message 
        });
    }
}; 