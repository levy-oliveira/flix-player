const favoritesService = require('./favorites.service')
const asyncHandler = require('../../utils/asyncHandler')
const { ok, created } = require('../../utils/response')

const addFavorite = asyncHandler(async (req, res) => {
    const { tmdbId, mediaType } = req.body
    const favorite = await favoritesService.addFavorite(req.userId, { tmdbId, mediaType })
    created(res, { favorite }, 'Favorito adicionado com sucesso')
})

const removeFavorite = asyncHandler(async (req, res) => {
    await favoritesService.removeFavorite(req.userId, Number(req.params.tmdbId))
    ok(res, {}, 'Favorito removido com sucesso')
})

const listFavorites = asyncHandler(async (req, res) => {
    const favorites = await favoritesService.listFavorites(req.userId)
    ok(res, { favorites })
})

module.exports = { addFavorite, removeFavorite, listFavorites }