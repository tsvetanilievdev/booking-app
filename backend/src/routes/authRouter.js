import { Router } from "express";
import { login, register, forgotPassword, resetPassword, verifyResetToken } from "../controllers/userController.js";
import { registerLimiter, loginLimiter } from '../middleware/rateLimiter.js';

const authRouter = Router();

// Authentication routes (public)
authRouter.post('/register', registerLimiter, register);
authRouter.post('/login', loginLimiter, login);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);
authRouter.get('/verify-reset-token/:token', verifyResetToken);

export default authRouter;