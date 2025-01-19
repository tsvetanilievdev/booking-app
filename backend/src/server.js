import express from 'express';
import cors from 'cors';
import router from './routes/router.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', router);

// Error handling
app.use(errorHandler);

export default app;