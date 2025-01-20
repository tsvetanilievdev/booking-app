import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
// import { getProfile, updateProfile, deleteProfile } from "../controllers/userController.js";

const userRouter = Router();

// All routes in this router require authentication
userRouter.use(protect);

// userRouter.get('/profile', getProfile);
// userRouter.put('/profile', updateProfile);
// userRouter.delete('/profile', deleteProfile);

export default userRouter; 