import { Router, Request, Response } from 'express';
import userRouter from '../controllers/userController';

const router = Router();

router.use('/api', userRouter);
router.use('/*', (req: Request, res: Response) => {
    res.status(404).json({
        message: 'Not Found'
    });
});

export default router;