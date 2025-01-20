import { Router } from "express";
import { login, register } from "../controllers/userController.js";
import { registerLimiter } from '../middleware/rateLimiter.js';

const authRouter = Router();

// Authentication routes (public)
authRouter.post('/register', registerLimiter, register);
authRouter.post('/login', login);

export default authRouter;