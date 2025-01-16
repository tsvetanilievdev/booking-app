import { Router } from 'express';
import userRouter from '../controllers/userController.js';

const router = Router();

router.use('/api', userRouter);
router.use('/*', (req, res) => {
    res.status(404).json({
        message: 'Not Found'
    });
});

export default router;