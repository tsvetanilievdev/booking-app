import swaggerUiPkg from 'swagger-ui-express';
const swaggerUi = swaggerUiPkg;
import openApiSpecification from '../utils/openApiConfig.js';

/**
 * Middleware to serve Swagger UI and OpenAPI specification
 * @param {Object} app - Express application
 */
export const setupSwagger = (app) => {
  // Serve OpenAPI specification as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(openApiSpecification);
  });

  // Serve Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiSpecification, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha'
      }
    })
  );

  console.log('Swagger UI available at /api-docs');
}; 