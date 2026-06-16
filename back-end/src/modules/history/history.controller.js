const historyService = require('./history.service')
const asyncHandler = require('../../utils/asyncHandler')
const { ok, created } = require('../../utils/response')

const saveProgress = asyncHandler(async (req, res) => {
    const { tmdbId, mediaType, season, episode, progressSeconds } = req.body
    const history = await historyService.saveProgress(req.userId, {
        tmdbId,
        mediaType,
        season,
        episode,
        progressSeconds,
    })

    created(res, { history }, 'Progresso salvo com sucesso')
})

const listHistory = asyncHandler(async (req, res) => {
    const history = await historyService.listHistory(req.userId)
    ok(res, { history })
})

const getHistoryByTmdbId = asyncHandler(async (req, res) => {
    const history = await historyService.getHistoryByTmdbId(req.userId, Number(req.params.tmdbId))
    ok(res, { history })
})

module.exports = { saveProgress, listHistory, getHistoryByTmdbId }