const asyncHandler = require('../../utils/asyncHandler')
const { ok, created } = require('../../utils/response')
const adminService = require('./admin.service')

const getStats = asyncHandler(async (req, res) => {
    const stats = await adminService.getStats()
    ok(res, stats)
})

const listUsers = asyncHandler(async (req, res) => {
    const users = await adminService.listUsers()
    ok(res, { users })
})

const createManager = asyncHandler(async (req, res) => {
    const result = await adminService.createManager(req.body)
    created(res, result, 'Gerente criado com sucesso')
})

const deleteUser = asyncHandler(async (req, res) => {
    await adminService.deleteUser(req.params.id)
    ok(res, {}, 'Usuário removido com sucesso')
})

const updateUserPlan = asyncHandler(async (req, res) => {
    const user = await adminService.updateUserPlan(req.params.id, req.body.plan)
    ok(res, { user }, 'Plano atualizado com sucesso')
})

const addToBlacklist = asyncHandler(async (req, res) => {
    const entry = await adminService.addToBlacklist(req.body.tmdbId, req.body.mediaType, req.userId)
    created(res, { entry }, 'Título adicionado à blacklist')
})

const removeFromBlacklist = asyncHandler(async (req, res) => {
    await adminService.removeFromBlacklist(Number(req.params.tmdbId))
    ok(res, {}, 'Título removido da blacklist')
})

const listBlacklist = asyncHandler(async (req, res) => {
    const blacklist = await adminService.listBlacklist()
    ok(res, { blacklist })
})

module.exports = { getStats, listUsers, createManager, deleteUser, updateUserPlan, addToBlacklist, removeFromBlacklist, listBlacklist }
