import swaggerJsdoc from 'swagger-jsdoc';
import { generateSchema } from '@anatine/zod-openapi';
import * as schemas from './validationUtils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json to get the version
const packageJsonPath = path.resolve(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const { version } = packageJson;

// Convert Zod schemas to OpenAPI schemas
const zodSchemaToOpenApi = (zodSchema) => {
  try {
    return generateSchema(zodSchema);
  } catch (error) {
    console.error(`Error converting schema to OpenAPI: ${error.message}`);
    return {};
  }
};

// Define OpenAPI components from Zod schemas
const components = {
  schemas: {
    // Auth schemas
    RegisterRequest: zodSchemaToOpenApi(schemas.registerSchema),
    LoginRequest: zodSchemaToOpenApi(schemas.loginSchema),
    ChangePasswordRequest: zodSchemaToOpenApi(schemas.changePasswordSchema),
    
    // User schemas
    UpdateProfileRequest: zodSchemaToOpenApi(schemas.updateProfileSchema),
    
    // Service schemas
    ServiceRequest: zodSchemaToOpenApi(schemas.serviceSchema),
    UpdateServiceRequest: zodSchemaToOpenApi(schemas.updateServiceSchema),
    
    // Client schemas
    ClientRequest: zodSchemaToOpenApi(schemas.clientSchema),
    UpdateClientRequest: zodSchemaToOpenApi(schemas.updateClientSchema),
    
    // Appointment schemas
    CreateAppointmentRequest: zodSchemaToOpenApi(schemas.createAppointmentSchema),
    UpdateAppointmentRequest: zodSchemaToOpenApi(schemas.updateAppointmentSchema),
    
    // Query parameter schemas
    PaginationParams: zodSchemaToOpenApi(schemas.paginationSchema),
    DateRangeParams: zodSchemaToOpenApi(schemas.dateRangeSchema),
    
    // Common response schemas
    Error: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'error'
        },
        message: {
          type: 'string',
          example: 'Error message'
        },
        code: {
          type: 'string',
          example: 'ERROR_CODE'
        },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                example: 'field.name'
              },
              message: {
                type: 'string',
                example: 'Error message for this field'
              }
            }
          }
        }
      }
    },
    Success: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'success'
        },
        message: {
          type: 'string',
          example: 'Operation successful'
        },
        data: {
          type: 'object',
          example: {}
        }
      }
    }
  },
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    }
  }
};

// OpenAPI specification options
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Booking System API',
      version: version,
      description: 'API documentation for the Booking System',
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      contact: {
        name: 'Tsvetan Iliev',
        url: 'https://github.com/yourusername'
      }
    },
    servers: [
      {
        url: '/api',
        description: 'API server'
      }
    ],
    components,
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // Path to the API docs
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

// Generate OpenAPI specification
const openApiSpecification = swaggerJsdoc(options);

export default openApiSpecification; 