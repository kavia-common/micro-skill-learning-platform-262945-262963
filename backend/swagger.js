const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Micro Skill LMS API',
      version: '1.0.0',
      description: 'Micro Skill-based Learning Management System API',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token as: Bearer <token>',
        },
      },
    },
    security: [],
    tags: [
      { name: 'Auth', description: 'Authentication routes' },
      { name: 'Content', description: 'Public content routes' },
      { name: 'Quiz', description: 'Quiz endpoints' },
      { name: 'Progress', description: 'Learning progress endpoints' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
