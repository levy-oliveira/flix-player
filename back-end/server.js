const { PORT } = require('./src/config/env')
const { connect } = require('./src/config/db')
const app = require('./src/app')

const start = async () => {
//   await connect()
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
    console.log(`📋 Health check: http://localhost:${PORT}/health`)
  })
}

start()
