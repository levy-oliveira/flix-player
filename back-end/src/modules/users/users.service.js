const User = require('../../models/User')

const getMe = async (userId) => {
    const user = await User.findById(userId)
    if (!user) {
        const err = new Error('Usuário não encontrado')
        err.status = 404
        throw err
    }
    return user
}

const updateMe = async (userId, { name, password }) => {

    if (!name && !password) {
        const err = new Error('Nenhum campo para atualizar')
        err.status = 400
        throw err
    }

    const user = await User.findById(userId).select('+password')
    if (!user) {
        const err = new Error('Usuário não encontrado')
        err.status = 404
        throw err
    }

    if (name) user.name = name
    if (password) user.password = password // pre-save hook faz o hash

    await user.save()

    return { id: user._id, name: user.name, email: user.email, role: user.role, plan: user.plan }
}
module.exports = { getMe, updateMe }