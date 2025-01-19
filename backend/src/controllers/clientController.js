import * as clientService from '../services/clientService.js';

export const createClient = async (req, res, next) => {
    try {
        const client = await clientService.createClient(req.body);
        res.status(201).json(client);
    } catch (error) {
        next(error);
    }
};

export const getAllClients = async (req, res, next) => {
    try {
        const clients = await clientService.getAllClients();
        res.json(clients);
    } catch (error) {
        next(error);
    }
};

export const getClientById = async (req, res, next) => {
    try {
        const client = await clientService.getClientById(Number(req.params.id));
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.json(client);
    } catch (error) {
        next(error);
    }
};

export const updateClient = async (req, res, next) => {
    try {
        const client = await clientService.updateClient(Number(req.params.id), req.body);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.json(client);
    } catch (error) {
        next(error);
    }
};

export const deleteClient = async (req, res, next) => {
    try {
        await clientService.deleteClient(Number(req.params.id));
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}; 