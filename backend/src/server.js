import express from 'express';
import cors from 'cors';
import router from './routes/router.js';
import { errorHandler, jsonErrorHandler } from './middleware/errorHandler.js';
import { setupSwagger } from './middleware/swaggerMiddleware.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(jsonErrorHandler);

// Setup Swagger documentation
setupSwagger(app);

// Routes
app.use('/', router);

// Error handling
app.use(errorHandler);

export default app;