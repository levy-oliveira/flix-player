require('dotenv').config()

const required = ['MONGO_URI', 'JWT_SECRET']

required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Variável de ambiente obrigatória não definida: ${key}`)
    process.exit(1)
  }
})

module.exports = {
  PORT: process.env.PORT || 3001,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
}
