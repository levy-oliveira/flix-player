const mongoose = require('mongoose')
const { MONGO_URI } = require('./env')

const connect = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ MongoDB conectado')
  } catch (err) {
    console.error('❌ Erro ao conectar no MongoDB:', err.message)
    process.exit(1)
  }
}

module.exports = { connect }
