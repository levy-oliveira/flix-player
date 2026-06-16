const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const errorHandler = require('./middlewares/errorHandler')
const { NODE_ENV } = require('./config/env')
const swagger = require('./config/swagger')

const app = express()

// Segurança e parsing
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Logging apenas fora de testes
if (NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// Swagger
swagger.setup(app)

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Rotas
app.use('/auth', require('./modules/auth/auth.routes'))
app.use('/users', require('./modules/users/users.routes'))
app.use('/favorites', require('./modules/favorites/favorites.routes'))
// app.use('/history',   require('./modules/history/history.routes'))
// app.use('/reviews',   require('./modules/reviews/reviews.routes'))
// app.use('/admin',     require('./modules/admin/admin.routes'))

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' })
})

// Handler global de erros (deve ser o último middleware)
app.use(errorHandler)

module.exports = app