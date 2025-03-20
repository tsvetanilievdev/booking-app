import prisma from '../db.js';
import { createNotFoundError, createBadRequestError, createAppointmentConflictError } from '../utils/errorUtils.js';
import logger from '../utils/logger.js';

/**
 * Get all appointments with filtering options
 */
export const getAppointments = async (filters = {}) => {
  try {
    const { 
      startDate, 
      endDate, 
      status, 
      clientId, 
      serviceId, 
      page = 1, 
      limit = 10,
      includeDeleted = false
    } = filters;
    
    // Parse page and limit as numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;
    
    // Build where clause based on filters
    const where = {
      isDeleted: includeDeleted ? undefined : false,
      ...(startDate && { startTime: { gte: new Date(startDate) } }),
      ...(endDate && { endTime: { lte: new Date(endDate) } }),
      ...(status && { isCancelled: status === 'CANCELLED' }),
      ...(clientId && { clientId: parseInt(clientId, 10) }),
      ...(serviceId && { serviceId }),
    };
    
    // Query appointments with pagination
    const [appointments, totalCount] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          Service: true,
          Client: true,
        },
        skip,
        take: limitNum,
        orderBy: { startTime: 'asc' },
      }),
      prisma.appointment.count({ where }),
    ]);
    
    return {
      appointments,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum),
      },
    };
  } catch (error) {
    logger.error('Error fetching appointments:', error);
    throw error;
  }
};

/**
 * Get a single appointment by ID
 */
export const getAppointmentById = async (id) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Service: true,
        Client: true,
      },
    });
    
    if (!appointment) {
      throw createNotFoundError('Appointment', id);
    }
    
    return appointment;
  } catch (error) {
    logger.error(`Error fetching appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Check for appointment conflicts
 * This is a critical function to prevent double-booking
 */
export const checkAppointmentConflicts = async (startTime, endTime, serviceId, excludeAppointmentId = null) => {
  try {
    // Build where clause to detect any overlapping appointments
    const where = {
      AND: [
        { 
          OR: [
            // Case 1: New appointment starts during an existing appointment
            {
              AND: [
                { startTime: { lte: new Date(startTime) } },
                { endTime: { gt: new Date(startTime) } }
              ]
            },
            // Case 2: New appointment ends during an existing appointment
            {
              AND: [
                { startTime: { lt: new Date(endTime) } },
                { endTime: { gte: new Date(endTime) } }
              ]
            },
            // Case 3: New appointment completely contains an existing appointment
            {
              AND: [
                { startTime: { gte: new Date(startTime) } },
                { endTime: { lte: new Date(endTime) } }
              ]
            }
          ]
        },
        { serviceId },
        { isDeleted: false },
        { isCancelled: false },
        ...(excludeAppointmentId ? [{ id: { not: excludeAppointmentId } }] : [])
      ]
    };
    
    // Count conflicts
    const conflicts = await prisma.appointment.findMany({
      where,
      select: {
        id: true,
        startTime: true,
        endTime: true,
        Client: {
          select: {
            name: true
          }
        }
      }
    });
    
    return conflicts;
  } catch (error) {
    logger.error('Error checking appointment conflicts:', error);
    throw error;
  }
};

/**
 * Check if a service is available at the given time
 */
export const checkServiceAvailability = async (serviceId, startTime, endTime) => {
  try {
    // Get service details with availability settings
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    
    if (!service) {
      throw createNotFoundError('Service', serviceId);
    }
    
    // Check if service is available
    if (!service.isAvailable) {
      return {
        available: false,
        reason: 'Service is not available for booking'
      };
    }
    
    // Parse start and end time
    const appointmentDate = new Date(startTime);
    const dayOfWeek = appointmentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Check if service is available on this day
    if (!service.availableDays.includes(dayOfWeek)) {
      return {
        available: false,
        reason: `Service is not available on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}`
      };
    }
    
    // Parse hours for time range check
    const appointmentStartHour = appointmentDate.getHours();
    const appointmentEndHour = new Date(endTime).getHours();
    
    // Check if appointment is within service available hours
    if (appointmentStartHour < service.availableTimeStart || appointmentEndHour > service.availableTimeEnd) {
      return {
        available: false,
        reason: `Service is only available between ${service.availableTimeStart}:00 and ${service.availableTimeEnd}:00`
      };
    }
    
    // Check for conflicts with other appointments
    const conflicts = await checkAppointmentConflicts(startTime, endTime, serviceId);
    
    if (conflicts.length > 0) {
      return {
        available: false,
        reason: 'Time slot conflicts with existing appointment',
        conflicts
      };
    }
    
    // If we get here, the service is available
    return {
      available: true
    };
  } catch (error) {
    logger.error(`Error checking service availability for service ${serviceId}:`, error);
    throw error;
  }
};

/**
 * Create a new appointment
 */
export const createAppointment = async (appointmentData) => {
  try {
    const { userId, serviceId, clientId, startTime, endTime, notes } = appointmentData;
    
    // Validate client exists
    if (clientId) {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
      });
      
      if (!client) {
        throw createNotFoundError('Client', clientId);
      }
    }
    
    // Validate service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    
    if (!service) {
      throw createNotFoundError('Service', serviceId);
    }
    
    // Check service availability
    const availability = await checkServiceAvailability(serviceId, startTime, endTime);
    
    if (!availability.available) {
      throw createBadRequestError(availability.reason);
    }
    
    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        userId,
        serviceId,
        clientId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notes: notes || [],
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Service: true,
        Client: true,
      },
    });
    
    // Update the service booking count and revenue
    await prisma.service.update({
      where: { id: serviceId },
      data: {
        bookingCount: { increment: 1 },
        revenue: { increment: service.price },
      },
    });
    
    // If there's a client, update their stats
    if (clientId) {
      await prisma.client.update({
        where: { id: clientId },
        data: {
          totalVisits: { increment: 1 },
          totalSpent: { increment: service.price },
          lastVisit: new Date(),
        },
      });
    }
    
    return appointment;
  } catch (error) {
    logger.error('Error creating appointment:', error);
    throw error;
  }
};

/**
 * Update an appointment
 */
export const updateAppointment = async (id, updateData) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });
    
    if (!appointment) {
      throw createNotFoundError('Appointment', id);
    }
    
    // Check for time conflicts if changing time or service
    if ((updateData.startTime || updateData.endTime || updateData.serviceId) && !updateData.isCancelled) {
      const startTime = updateData.startTime || appointment.startTime;
      const endTime = updateData.endTime || appointment.endTime;
      const serviceId = updateData.serviceId || appointment.serviceId;
      
      // Only check availability if times or service are changing
      if (updateData.startTime || updateData.endTime || updateData.serviceId) {
        const availability = await checkServiceAvailability(
          serviceId,
          startTime,
          endTime
        );
        
        // For update, we need to exclude the current appointment from conflict check
        const conflicts = await checkAppointmentConflicts(startTime, endTime, serviceId, id);
        
        if (conflicts.length > 0) {
          throw createAppointmentConflictError(conflicts);
        }
      }
    }
    
    // Perform the update
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Service: true,
        Client: true,
      },
    });
    
    return updatedAppointment;
  } catch (error) {
    logger.error(`Error updating appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (id) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        Service: true,
      },
    });
    
    if (!appointment) {
      throw createNotFoundError('Appointment', id);
    }
    
    // Update the appointment to cancelled
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        isCancelled: true,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Service: true,
        Client: true,
      },
    });
    
    // If cancellation is close to the appointment time, we might want to add a cancellation fee
    // This would be handled in a payment processing service
    
    return updatedAppointment;
  } catch (error) {
    logger.error(`Error cancelling appointment ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an appointment (soft delete)
 */
export const deleteAppointment = async (id) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });
    
    if (!appointment) {
      throw createNotFoundError('Appointment', id);
    }
    
    // Soft delete
    await prisma.appointment.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
    
    return { message: 'Appointment deleted successfully' };
  } catch (error) {
    logger.error(`Error deleting appointment ${id}:`, error);
    throw error;
  }
};

export default {
  getAppointments,
  getAppointmentById,
  checkAppointmentConflicts,
  checkServiceAvailability,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  deleteAppointment,
}; 