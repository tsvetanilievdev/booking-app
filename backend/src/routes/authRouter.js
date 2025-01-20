import { Router } from "express";
import { login, register } from "../controllers/userController.js";
import { registerLimiter, loginLimiter } from '../middleware/rateLimiter.js';

const authRouter = Router();

// Authentication routes (public)
authRouter.post('/register', registerLimiter, register);
authRouter.post('/login', loginLimiter, login);

export default authRouter;