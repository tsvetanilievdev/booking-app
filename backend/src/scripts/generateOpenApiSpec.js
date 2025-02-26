import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import openApiSpecification from '../utils/openApiConfig.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to save the OpenAPI specification
const outputPath = path.resolve(__dirname, '../../openapi.json');

// Convert the specification to JSON
const specJson = JSON.stringify(openApiSpecification, null, 2);

// Write the specification to a file
fs.writeFileSync(outputPath, specJson);

console.log(`OpenAPI specification saved to ${outputPath}`); 