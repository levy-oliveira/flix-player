const asyncHandler = require('../../utils/asyncHandler')
const { ok, created } = require('../../utils/response')
const reviewsService = require('./reviews.service')

const upsertReview = asyncHandler(async (req, res) => {
    const { review, isNew } = await reviewsService.upsertReview(req.userId, req.body)
    if (isNew) {
        created(res, { review }, 'Avaliação criada com sucesso')
    } else {
        ok(res, { review }, 'Avaliação atualizada com sucesso')
    }
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

const getMyReview = asyncHandler(async (req, res) => {
    const review = await reviewsService.getMyReview(req.userId, Number(req.params.tmdbId))
    ok(res, { review: review ?? null })
})

module.exports = { upsertReview, removeReview, listMyReviews, getReviewStats, getMyReview }
