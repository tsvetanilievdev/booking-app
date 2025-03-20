import * as appointmentService from '../services/appointmentService.js';
import { createAppointmentConflictError, createBadRequestError } from '../utils/errorUtils.js';
import logger from '../utils/logger.js';

/**
 * Middleware to check for appointment conflicts before creating appointments
 */
export const checkAppointmentConflicts = async (req, res, next) => {
  try {
    const { serviceId, startTime, endTime } = req.body;
    
    // Skip conflict check if any required field is missing
    if (!serviceId || !startTime || !endTime) {
      return next();
    }
    
    // Check for conflicts
    const conflicts = await appointmentService.checkAppointmentConflicts(
      startTime,
      endTime,
      serviceId
    );
    
    if (conflicts.length > 0) {
      logger.warn(`Appointment conflict detected: ${conflicts.length} conflicts for time slot ${startTime} to ${endTime}`);
      return next(createAppointmentConflictError('This time slot conflicts with existing appointment(s)'));
    }
    
    // No conflicts, continue to next middleware or controller
    next();
  } catch (error) {
    logger.error('Error in checkAppointmentConflicts middleware:', error);
    next(error);
  }
};

/**
 * Middleware to check for appointment conflicts when updating appointments
 */
export const checkUpdateConflicts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { serviceId, startTime, endTime } = req.body;
    
    // Skip conflict check if no time-related fields are being updated
    if (!serviceId && !startTime && !endTime) {
      return next();
    }
    
    // Get the existing appointment
    const appointment = await appointmentService.getAppointmentById(id);
    
    // Check for conflicts, excluding the current appointment
    const conflicts = await appointmentService.checkAppointmentConflicts(
      startTime || appointment.startTime,
      endTime || appointment.endTime,
      serviceId || appointment.serviceId,
      id
    );
    
    if (conflicts.length > 0) {
      logger.warn(`Update conflict detected: ${conflicts.length} conflicts for appointment ${id}`);
      return next(createAppointmentConflictError('This updated time slot conflicts with existing appointment(s)'));
    }
    
    // No conflicts, continue to next middleware or controller
    next();
  } catch (error) {
    logger.error('Error in checkUpdateConflicts middleware:', error);
    next(error);
  }
};

/**
 * Middleware to check service availability
 */
export const checkServiceAvailability = async (req, res, next) => {
  try {
    const { serviceId, startTime, endTime } = req.body;
    
    // Skip availability check if any required field is missing
    if (!serviceId || !startTime || !endTime) {
      return next();
    }
    
    // Check service availability
    const availability = await appointmentService.checkServiceAvailability(
      serviceId,
      startTime,
      endTime
    );
    
    if (!availability.available) {
      logger.warn(`Service not available: ${availability.reason}`);
      return next(createBadRequestError(availability.reason));
    }
    
    // Service is available, continue to next middleware or controller
    next();
  } catch (error) {
    logger.error('Error in checkServiceAvailability middleware:', error);
    next(error);
  }
};

export default {
  checkAppointmentConflicts,
  checkUpdateConflicts,
  checkServiceAvailability
}; 