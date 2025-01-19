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
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(service);
    } catch (error) {
        next(error);
    }
};

export const deleteService = async (req, res, next) => {
    try {
        await serviceService.deleteService(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}; 