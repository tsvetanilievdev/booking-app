import { z } from "zod";

// Common rules that can be reused
const emailRule = z.string().trim()
  .email("Invalid email address")
  .toLowerCase();

const passwordRule = z.string()
  .min(6, "Password must be at least 6 characters")
  .regex(/^(?=.*[A-Za-z])(?=.*\d)/, "Password must contain at least one letter and one number");

const nameRule = z.string()
  .min(3, "Name must be at least 3 characters")
  .max(50, "Name cannot be longer than 50 characters")
  .regex(/^[a-zA-Z0-9_ ]+$/, "Only letters, numbers, spaces and underscore are allowed");

const phoneRule = z.string()
  .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, "Invalid phone number format")
  .optional()
  .nullable();

const notesRule = z.array(z.string())
  .optional()
  .default([]);

// Define schemas
export const registerSchema = z.object({
  name: nameRule.toLowerCase(),
  email: emailRule,
  password: passwordRule,
  role: z.enum(['ADMIN', 'USER']).optional().default('USER')
});

export const loginSchema = z.object({
  email: emailRule,
  password: z.string()
});

export const updateProfileSchema = z.object({
  name: nameRule.toLowerCase().optional(),
  email: emailRule.optional(),
  role: z.enum(['ADMIN', 'USER']).optional()
});

export const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: passwordRule
}).refine(data => data.oldPassword !== data.newPassword, {
  message: "New password must be different from the old password",
  path: ["newPassword"]
});

// Service schemas
export const serviceSchema = z.object({
  name: z.string()
    .min(2, "Service name must be at least 2 characters")
    .max(100, "Service name cannot be longer than 100 characters"),
  price: z.number()
    .positive("Price must be a positive number")
    .or(z.string().regex(/^\d+(\.\d{1,2})?$/).transform(val => parseFloat(val)))
    .refine(val => val > 0, "Price must be greater than 0"),
  duration: z.number()
    .int("Duration must be an integer")
    .positive("Duration must be a positive number")
    .or(z.string().regex(/^\d+$/).transform(val => parseInt(val, 10)))
    .refine(val => val > 0, "Duration must be greater than 0"),
  description: z.string()
    .max(500, "Description cannot be longer than 500 characters")
    .optional()
});

export const updateServiceSchema = serviceSchema.partial();

// Client schemas
export const clientSchema = z.object({
  name: nameRule,
  email: emailRule.optional().nullable(),
  phone: phoneRule,
  notes: notesRule
});

export const updateClientSchema = clientSchema.partial();

// Appointment schemas
const baseAppointmentSchema = z.object({
  serviceId: z.string({
    required_error: "Service ID is required",
    invalid_type_error: "Service ID must be a string"
  }),
  userId: z.string({
    required_error: "User ID is required",
    invalid_type_error: "User ID must be a string"
  }),
  clientId: z.number().int().positive().optional().nullable(),
  startTime: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/, "Invalid ISO date format")
    .or(z.date())
    .refine(date => {
      const dateObj = new Date(date);
      return !isNaN(dateObj.getTime());
    }, {
      message: "Invalid date format"
    })
    .transform(date => new Date(date)),
  notes: notesRule
});

// Schema for creating an appointment
export const createAppointmentSchema = baseAppointmentSchema
  .refine(data => {
    const appointmentDate = new Date(data.startTime);
    const now = new Date();
    return appointmentDate > now;
  }, {
    message: "Appointment time must be in the future",
    path: ["startTime"]
  });

// Schema for updating an appointment
export const updateAppointmentSchema = baseAppointmentSchema
  .partial()
  .refine(data => {
    if (!data.startTime) return true;
    const appointmentDate = new Date(data.startTime);
    const now = new Date();
    return appointmentDate > now;
  }, {
    message: "Appointment time must be in the future",
    path: ["startTime"]
  });

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, "Page must be a positive number")
    .transform(val => parseInt(val, 10))
    .default("1"),
  limit: z.string()
    .regex(/^\d+$/, "Limit must be a positive number")
    .transform(val => parseInt(val, 10))
    .default("10")
});

export const dateRangeSchema = z.object({
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format")
    .optional(),
  endDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format")
    .optional()
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "Start date must be before or equal to end date",
  path: ["endDate"]
});

// ID parameter schema
export const idParamSchema = z.object({
  id: z.string()
    .regex(/^[0-9]+$/, "ID must be a number")
    .transform(val => parseInt(val, 10))
    .or(z.string().uuid("ID must be a valid UUID"))
});

