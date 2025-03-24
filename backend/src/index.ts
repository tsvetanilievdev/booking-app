import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { appointmentsRouter } from './routes/appointments';
import { servicesRouter } from './routes/services';
import { clientsRouter } from './routes/clients';
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger setup
const swaggerFile = path.join(__dirname, '../swagger.yaml');
const swaggerDocument = YAML.parse(fs.readFileSync(swaggerFile, 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/appointments', authenticateToken, appointmentsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/clients', authenticateToken, clientsRouter);

// Error handling
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Booking System API is running',
    database: 'connected',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memoryUsage: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API Documentation available at http://localhost:${port}/api-docs`);
}); 