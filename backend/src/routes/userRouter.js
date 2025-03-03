import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getUser, updateUser, deleteUser } from "../controllers/userController.js";

const userRouter = Router();

// All routes in this router require authentication 
userRouter.use(authenticate);

userRouter.get('/', getUser);
userRouter.put('/', updateUser);
userRouter.delete('/', deleteUser);

export default userRouter; 