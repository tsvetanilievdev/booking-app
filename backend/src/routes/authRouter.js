import { Router } from "express";
import { protect } from "../middlewares/protect";

const authRouter = Router();

authRouter.use('/', protect);

export default authRouter;