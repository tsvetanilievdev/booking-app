import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import router from './routes/router.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import swaggerUi from 'swagger-ui-express';
import openApiSpecification from './utils/openApiConfig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Swagger YAML path for direct access
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerYamlPath = path.resolve(__dirname, '../swagger.yaml');

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Request logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  skip: (req, res) => req.path === '/api/health',
  stream: { write: message => logger.http(message.trim()) }
}));

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve swagger.yaml directly
if (fs.existsSync(swaggerYamlPath)) {
  app.get('/swagger.yaml', (req, res) => {
    res.sendFile(swaggerYamlPath);
  });
}

// Setup Swagger UI with yaml file
const setupSwaggerUI = () => {
  // Default to using the JavaScript-generated specification
  let swaggerDoc = openApiSpecification;
  
  // Use the YAML file if it exists and we can parse it
  if (fs.existsSync(swaggerYamlPath)) {
    // We use the dynamic ES module import pattern since the project uses ES modules
    import('yamljs')
      .then(yamlModule => {
        try {
          swaggerDoc = yamlModule.default.load(swaggerYamlPath);
          logger.info('Using swagger.yaml for API documentation');
          
          // Re-setup Swagger after successful YAML load
          setupSwaggerUIWithDoc(swaggerDoc);
        } catch (err) {
          logger.warn('Error parsing YAML file:', err);
        }
      })
      .catch(err => {
        logger.warn('Could not load YAML module, using generated OpenAPI spec', err);
      });
  }
  
  // Initial setup with whatever doc we have available
  setupSwaggerUIWithDoc(swaggerDoc);
};

// Helper to setup Swagger UI with a document
const setupSwaggerUIWithDoc = (doc) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(doc, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true,
      showExtensions: true
    }
  }));
};

// Initialize Swagger UI
setupSwaggerUI();

// Routes
app.use(router);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  logger.info(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  console.error('UNHANDLED REJECTION!', err);
  
  // Give the server time to finish current requests before exiting
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  console.error('UNCAUGHT EXCEPTION!', err);
  
  // Uncaught exceptions leave the application in an undefined state, so exit immediately
  process.exit(1);
});

export default app;