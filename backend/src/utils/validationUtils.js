import { z } from "zod";

// Common rules that can be reused
const emailRule = z.string()
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
  password: passwordRule
});