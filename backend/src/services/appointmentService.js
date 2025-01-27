import prisma from '../db.js';

/**
 * Проверява за конфликти в графика на служителя
 */
const checkTimeSlotAvailability = async (userId, startTime, endTime) => {
    const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
            userId,
            isDeleted: false,
            isCancelled: false,
            OR: [
                // Нов час започва по време на съществуващ
                {
                    AND: [
                        { startTime: { lte: startTime } },
                        { endTime: { gt: startTime } }
                    ]
                },
                // Нов час завършва по време на съществуващ
                {
                    AND: [
                        { startTime: { lt: endTime } },
                        { endTime: { gte: endTime } }
                    ]
                },
                // Нов час изцяло обхваща съществуващ
                {
                    AND: [
                        { startTime: { gte: startTime } },
                        { endTime: { lte: endTime } }
                    ]
                }
            ]
        }
    });

    return !conflictingAppointment;
};

export const createAppointment = async (appointmentData) => {
    try {
        const { userId, serviceId, startTime } = appointmentData;

        // Взимаме информация за услугата за да определим продължителността
        const service = await prisma.service.findUnique({
            where: { id: serviceId }
        });

        if (!service) {
            throw new Error('Service not found');
        }

        // Изчисляваме крайния час според продължителността на услугата
        const endTime = new Date(new Date(startTime).getTime() + service.duration * 60000);

        // Проверяваме дали слотът е свободен
        const isAvailable = await checkTimeSlotAvailability(
            userId,
            new Date(startTime),
            endTime
        );

        if (!isAvailable) {
            throw new Error('This time slot is not available');
        }

        // Създаваме appointment с изчисления краен час
        return prisma.appointment.create({
            data: {
                ...appointmentData,
                startTime: new Date(startTime),
                endTime,
                isDeleted: false,
                isCancelled: false
            },
            include: {
                Service: true,
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                Client: true
            }
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        throw error;
    }
};

export const getAllAppointments = async (userId) => {
    return prisma.appointment.findMany({
        where: { 
            userId,
            isDeleted: false 
        },
        include: {
            Service: true,
            User: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            Client: true
        },
        orderBy: {
            startTime: 'asc'  // Сортираме по startTime вместо date
        }
    });
};

export const getAppointmentById = async (id) => {
    return prisma.appointment.findUnique({
        where: { id },
        include: {
            Service: true,
            User: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            Client: true
        }
    });
};

// Добавяме нова помощна функция за проверка на свободни часове
export const getAvailableSlots = async (userId, date) => {
    // Взимаме всички часове за деня
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
        where: {
            userId,
            isDeleted: false,
            isCancelled: false,
            startTime: {
                gte: dayStart,
                lte: dayEnd
            }
        },
        orderBy: {
            startTime: 'asc'
        }
    });

    return appointments;
};
