const usersService = require('./users.service')
const asyncHandler = require('../../utils/asyncHandler')
const { ok } = require('../../utils/response')

const getMe = asyncHandler(async (req, res) => {
  const user = await usersService.getMe(req.userId)
  ok(res, { user })
})

const updateMe = asyncHandler(async (req, res) => {
  const { name, password } = req.body
  const user = await usersService.updateMe(req.userId, { name, password })
  ok(res, { user }, 'Perfil atualizado com sucesso')
})

module.exports = { getMe, updateMe }