const asyncHandler = require('../../utils/asyncHandler')
const { ok, created } = require('../../utils/response')
const reviewsService = require('./reviews.service')

const upsertReview = asyncHandler(async (req, res) => {
    const review = await reviewsService.upsertReview(req.userId, req.body)
    created(res, { review }, 'Avaliação salva com sucesso')
})

const removeReview = asyncHandler(async (req, res) => {
    await reviewsService.removeReview(req.userId, Number(req.params.tmdbId))
    ok(res, {}, 'Avaliação removida com sucesso')
})

const listMyReviews = asyncHandler(async (req, res) => {
    const reviews = await reviewsService.listMyReviews(req.userId)
    ok(res, { reviews })
})

const getReviewStats = asyncHandler(async (req, res) => {
    const stats = await reviewsService.getReviewStats(Number(req.params.tmdbId))
    ok(res, stats)
})

module.exports = { upsertReview, removeReview, listMyReviews, getReviewStats }
