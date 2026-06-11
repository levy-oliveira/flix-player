const { NODE_ENV } = require('../config/env')

// Handler global de erros — deve ser o último middleware registrado no app.js
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Erro interno do servidor'

  if (NODE_ENV === 'development') {
    console.error(`[${req.method}] ${req.path} →`, err)
  }

  res.status(status).json({
    success: false,
    message,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  })
}

module.exports = errorHandler
