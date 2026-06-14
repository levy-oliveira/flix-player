const jwt = require('jsonwebtoken')
const User = require('../../models/User')
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/env')

const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    })
}

const register = async ({ name, email, password, plan }) => {
    const exists = await User.findOne({ email })
    if (exists) {
        const err = new Error('Email já cadastrado')
        err.status = 409
        throw err
    }

    const user = await User.create({ name, email, password, plan })
    const token = generateToken(user)

    return {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, plan: user.plan },
    }
}

const login = async ({ email, password }) => {
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
        const err = new Error('Credenciais inválidas')
        err.status = 401
        throw err
    }

    const token = generateToken(user)

    return {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, plan: user.plan },
    }
}

module.exports = { register, login }