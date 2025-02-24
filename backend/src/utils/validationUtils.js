import { z } from "zod";

// Common rules that can be reused
const emailRule = z.string().trim()
  .email("Invalid email address")
  .toLowerCase();

const passwordRule = z.string()
  .min(6, "Password must be at least 6 characters")
  .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Password must contain at least one letter and one number");

// Define schemas
export const registerSchema = z.object({
  name: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot be longer than 30 characters")
    .regex(/^[a-zA-Z0-9_ ]+$/, "Only letters, numbers, spaces and underscore are allowed")
    .toLowerCase(),
  email: emailRule,
  password: passwordRule,
  role: z.enum(['ADMIN', 'USER']).optional()
});

export const loginSchema = z.object({
  email: emailRule,
  password: z.string()
});

export const updateProfileSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(30, "Name cannot be longer than 30 characters")
    .regex(/^[a-zA-Z0-9_ ]+$/, "Only letters, numbers, spaces and underscore are allowed")
    .toLowerCase(),
  email: emailRule,
  role: z.enum(['ADMIN', 'USER'])
}).partial();

export const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: passwordRule
})

// Базова схема без трансформация
const baseAppointmentSchema = z.object({
    serviceId: z.string({
        required_error: "Service ID is required",
        invalid_type_error: "Service ID must be a string"
    }),
    date: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
        .refine(date => new Date(date) > new Date(), {
            message: "Appointment date must be in the future"
        }),
    time: z.string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format"),
    notes: z.array(z.string())
        .optional()
        .default([])
});

// Схема за създаване на appointment
export const createAppointmentSchema = z.object({
    serviceId: z.string(),
    userId: z.string(),      // ID на служителя
    clientId: z.number().optional(),  // ID на клиента (опционално)
    startTime: z.string().or(z.date()),
    notes: z.array(z.string()).optional().default([])
});

// Схема за обновяване на appointment (всички полета са опционални)
export const updateAppointmentSchema = z.object({
    serviceId: z.string().optional(),
    userId: z.string().optional(),
    clientId: z.number().optional(),
    startTime: z.string().or(z.date()).optional(),
    notes: z.array(z.string()).optional()
});

