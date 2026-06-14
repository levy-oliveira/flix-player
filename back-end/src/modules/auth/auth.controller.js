const authService = require('./auth.service')
const asyncHandler = require('../../utils/asyncHandler')
const { ok, created } = require('../../utils/response')

const register = asyncHandler(async (req, res) => {
    const { name, email, password, plan } = req.body
    const result = await authService.register({ name, email, password, plan })
    created(res, result, 'Usuário criado com sucesso')
})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const result = await authService.login({ email, password })
    ok(res, result, 'Login realizado com sucesso')
})

module.exports = { register, login }