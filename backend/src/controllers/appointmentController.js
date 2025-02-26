import { createAppointmentSchema, updateAppointmentSchema, idParamSchema } from '../utils/validationUtils.js';
import * as appointmentService from '../services/appointmentService.js';
import { AppError, ErrorCodes, createNotFoundError, createForbiddenError } from '../utils/errorUtils.js';
import logger from '../utils/logger.js';

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment management
 */

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Create a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointmentRequest'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Appointment created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointment:
 *                       type: object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Time slot unavailable
 *       500:
 *         description: Server error
 */
export const createAppointment = async (req, res, next) => {
    try {
        // Validate request data
        const validatedData = createAppointmentSchema.parse({
            ...req.body,
            userId: req.body.userId || req.user.id  // Use the provided userId or the current user's id
        });
        
        // Create the appointment
        const appointment = await appointmentService.createAppointment({
            ...validatedData,
            clientId: validatedData.clientId || null  // Explicitly set null if no clientId
        });
        
        // Return success response
        res.status(201).json({
            status: 'success',
            message: 'Appointment created successfully',
            data: { appointment }
        });
    } catch (error) {
        // Handle specific business logic errors
        if (error.message === 'This time slot is not available') {
            return next(new AppError(
                error.message, 
                409, 
                ErrorCodes.TIME_SLOT_UNAVAILABLE
            ));
        }

        // Pass other errors to the global error handler
        next(error);
    }
};

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments for the current user
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointments:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getAppointments = async (req, res, next) => {
    try {
        const appointments = await appointmentService.getAllAppointments(req.user.id);
        
        res.json({
            status: 'success',
            results: appointments.length,
            data: { appointments }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get a specific appointment by ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointment:
 *                       type: object
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
export const getAppointmentById = async (req, res, next) => {
    try {
        // Validate and parse the ID parameter
        const { id } = idParamSchema.parse(req.params);
        
        // Get the appointment
        const appointment = await appointmentService.getAppointmentById(id);
        
        // Check if appointment exists
        if (!appointment) {
            return next(createNotFoundError('Appointment', id));
        }

        // Check if the user has permission to access this appointment
        if (appointment.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return next(createForbiddenError('You do not have permission to access this appointment'));
        }

        // Return the appointment
        res.json({
            status: 'success',
            data: { appointment }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Update an appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAppointmentRequest'
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Appointment updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointment:
 *                       type: object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Time slot unavailable
 *       500:
 *         description: Server error
 */
export const updateAppointment = async (req, res, next) => {
    try {
        // Validate and parse the ID parameter
        const { id } = idParamSchema.parse(req.params);
        
        // Get the existing appointment
        const existingAppointment = await appointmentService.getAppointmentById(id);
        
        // Check if appointment exists
        if (!existingAppointment) {
            return next(createNotFoundError('Appointment', id));
        }
        
        // Check if the user has permission to update this appointment
        if (existingAppointment.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return next(createForbiddenError('You do not have permission to update this appointment'));
        }
        
        // Validate request data
        const validatedData = updateAppointmentSchema.parse(req.body);
        
        // Update the appointment
        const updatedAppointment = await appointmentService.updateAppointment(id, validatedData);
        
        // Return success response
        res.json({
            status: 'success',
            message: 'Appointment updated successfully',
            data: { appointment: updatedAppointment }
        });
    } catch (error) {
        // Handle specific business logic errors
        if (error.message === 'This time slot is not available') {
            return next(new AppError(
                error.message, 
                409, 
                ErrorCodes.TIME_SLOT_UNAVAILABLE
            ));
        }
        
        // Pass other errors to the global error handler
        next(error);
    }
};

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: Delete an appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Appointment ID
 *     responses:
 *       204:
 *         description: Appointment deleted successfully
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Appointment not found
 *       500:
 *         description: Server error
 */
export const deleteAppointment = async (req, res, next) => {
    try {
        // Validate and parse the ID parameter
        const { id } = idParamSchema.parse(req.params);
        
        // Get the existing appointment
        const existingAppointment = await appointmentService.getAppointmentById(id);
        
        // Check if appointment exists
        if (!existingAppointment) {
            return next(createNotFoundError('Appointment', id));
        }
        
        // Check if the user has permission to delete this appointment
        if (existingAppointment.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return next(createForbiddenError('You do not have permission to delete this appointment'));
        }
        
        // Delete the appointment
        await appointmentService.deleteAppointment(id);
        
        // Return success response
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
