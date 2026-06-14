require('./env')
const mongoose = require('mongoose')
const { MONGO_URI } = require('./env')
const User = require('../models/User')

const MANAGER = {
    name: 'Gerente',
    email: 'admin@flix.com',
    password: 'Admin@123',
    role: 'manager',
    plan: 'pro',
}

const seed = async () => {
    await mongoose.connect(MONGO_URI)
    console.log('✅ MongoDB conectado')

    const exists = await User.findOne({ email: MANAGER.email })
    if (exists) {
        console.log('⚠️  Gerente já existe, seed ignorado')
        process.exit(0)
    }

    await User.create(MANAGER)
    console.log(`✅ Gerente criado: ${MANAGER.email} / ${MANAGER.password}`)
    process.exit(0)
}

seed().catch((err) => {
    console.error('❌ Erro no seed:', err.message)
    process.exit(1)
})