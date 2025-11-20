import swaggerJsdoc from 'swagger-jsdoc';

// Configuração principal do Swagger, definindo metadados, servidores e esquema de segurança JWT
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Categorizador de Documentos AI API',
      version: '1.0.0',
      description: 'API para gerenciamento, categorização via IA e armazenamento de documentos.',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

// Gera a especificação da documentação com base nas definições configuradas
const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;