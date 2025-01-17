import { Router } from "express";
import { protect } from "../middlewares/protect";
import { login, register } from "../controllers/userController";

const authRouter = Router();

authRouter.use('/', protect);
authRouter.post('/register', register)
authRouter.post('/login', login);

export default authRouter;