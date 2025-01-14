import { Router } from "express";
import { createUser } from "../services/userService";
const userRouter = Router();

userRouter.post('/', async (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
        res.status(400).json({
            message: 'Please provide name, email and password'
        });
        return;
    }
    try {
        const user = await createUser(req.body.name, req.body.email, req.body.password);
        res.json(user);
    } catch (error) {
        res.status(400).json({
            message: 'Something went wrong'
        })
    }
});
export default userRouter;