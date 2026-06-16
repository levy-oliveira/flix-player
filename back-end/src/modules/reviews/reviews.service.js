const Review = require('../../models/Review')

async function upsertReview(userId, { tmdbId, mediaType, stars }) {
    return Review.findOneAndUpdate(
        { userId, tmdbId },
        { userId, tmdbId, mediaType, stars },
        { upsert: true, new: true }
    )
}

async function removeReview(userId, tmdbId) {
    const review = await Review.findOneAndDelete({ userId, tmdbId })
    if (!review) {
        const err = new Error('Avaliação não encontrada')
        err.status = 404
        throw err
    }
    return review
}

async function listMyReviews(userId) {
    return Review.find({ userId }).sort({ createdAt: -1 })
}

async function getReviewStats(tmdbId) {
    const [result] = await Review.aggregate([
        { $match: { tmdbId } },
        { $group: { _id: null, average: { $avg: '$stars' }, total: { $sum: 1 } } },
    ])

    if (!result) return { average: null, total: 0 }
    return { average: parseFloat(result.average.toFixed(1)), total: result.total }
}

module.exports = { upsertReview, removeReview, listMyReviews, getReviewStats }
