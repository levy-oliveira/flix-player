const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const path = require('path')

const routeGlob = path.join(__dirname, '../modules/**/*.routes.js').replace(/\\/g, '/')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flix Player API',
      version: '1.0.0',
      description: 'Documentação da API do Flix Player',
    },
    servers: [{ url: 'http://localhost:3001', description: 'Desenvolvimento' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Aponta para onde os colegas vão escrever os comentários JSDoc das rotas
  apis: [routeGlob],
}

const spec = swaggerJsdoc(options)

const setup = (app) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec))
  console.log('📄 Swagger disponível em http://localhost:3001/docs')
}

module.exports = { setup }