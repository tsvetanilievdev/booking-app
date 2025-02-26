import * as clientService from '../services/clientService.js';
import { AppError } from '../utils/errorUtils.js';

export const createClient = async (req, res, next) => {
    try {
        const client = await clientService.createClient(req.body);
        res.status(201).json({
            status: 'success',
            message: 'Client created successfully',
            data: { client }
        });
    } catch (error) {
        next(error);
    }
};

export const getAllClients = async (req, res, next) => {
    try {
        const clients = await clientService.getAllClients();
        res.json({
            status: 'success',
            results: clients.length,
            data: { clients }
        });
    } catch (error) {
        next(error);
    }
};

export const getClientById = async (req, res, next) => {
    try {
        const client = await clientService.getClientById(Number(req.params.id));
        if (!client) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Client not found' 
            });
        }
        res.json({
            status: 'success',
            data: { client }
        });
    } catch (error) {
        next(error);
    }
};

export const updateClient = async (req, res, next) => {
    try {
        const client = await clientService.updateClient(Number(req.params.id), req.body);
        if (!client) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Client not found' 
            });
        }
        res.json({
            status: 'success',
            message: 'Client updated successfully',
            data: { client }
        });
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

/**
 * @swagger
 * /clients/{id}/preferences:
 *   put:
 *     summary: Update client preferences
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Client ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Client preferences updated successfully
 *       404:
 *         description: Client not found
 *       500:
 *         description: Server error
 */
export const updateClientPreferences = async (req, res, next) => {
    try {
        const clientId = Number(req.params.id);
        const preferences = req.body;
        
        // Get the existing client
        const existingClient = await clientService.getClientById(clientId);
        
        if (!existingClient) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Client not found' 
            });
        }
        
        // Update client preferences
        const client = await clientService.updateClient(clientId, {
            preferences: preferences
        });
        
        res.json({
            status: 'success',
            message: 'Client preferences updated successfully',
            data: { client }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /clients/{id}/vip:
 *   put:
 *     summary: Toggle client VIP status
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Client ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isVip:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Client VIP status updated successfully
 *       404:
 *         description: Client not found
 *       500:
 *         description: Server error
 */
export const updateClientVipStatus = async (req, res, next) => {
    try {
        const clientId = Number(req.params.id);
        const { isVip } = req.body;
        
        if (typeof isVip !== 'boolean') {
            return res.status(400).json({
                status: 'error',
                message: 'isVip must be a boolean value'
            });
        }
        
        // Get the existing client
        const existingClient = await clientService.getClientById(clientId);
        
        if (!existingClient) {
            return res.status(404).json({ 
                status: 'error',
                message: 'Client not found' 
            });
        }
        
        // Update client VIP status
        const client = await clientService.updateClient(clientId, {
            isVip
        });
        
        res.json({
            status: 'success',
            message: `Client ${isVip ? 'marked as VIP' : 'removed from VIP status'}`,
            data: { client }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /clients/vip:
 *   get:
 *     summary: Get all VIP clients
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of VIP clients
 *       500:
 *         description: Server error
 */
export const getVipClients = async (req, res, next) => {
    try {
        const clients = await clientService.getVipClients();
        
        res.json({
            status: 'success',
            results: clients.length,
            data: { clients }
        });
    } catch (error) {
        next(error);
    }
}; 