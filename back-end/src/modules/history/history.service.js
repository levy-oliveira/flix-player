const WatchHistory = require('../../models/WatchHistory')
const User = require('../../models/User')
const { PLAN_LIMITS } = require('../../config/planLimits')

const getUserPlan = async (userId) => {
    const user = await User.findById(userId).select('plan')

    if (!user) {
        const err = new Error('Usuário não encontrado')
        err.status = 404
        throw err
    }

    return user.plan
}

const getPlanLimit = (plan) => PLAN_LIMITS[plan] ?? PLAN_LIMITS.free

const getDayBounds = (date = new Date()) => {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)

    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    return { start, end }
}

const countDistinctOpenedToday = async (userId, dayBounds) => {
    const titles = await WatchHistory.distinct('tmdbId', {
        userId,
        openedAt: { $gte: dayBounds.start, $lte: dayBounds.end },
    })

    return titles.length
}

const getWatchLimit = async (userId) => {
    const plan = await getUserPlan(userId)
    const limit = getPlanLimit(plan)

    if (!Number.isFinite(limit)) {
        const used = await countDistinctOpenedToday(userId, getDayBounds())
        return { used, limit: null, blocked: false }
    }

    const used = await countDistinctOpenedToday(userId, getDayBounds())

    return {
        used,
        limit,
        blocked: used >= limit,
    }
}

const saveProgress = async (userId, { tmdbId, mediaType, season, episode, progressSeconds }) => {
    const plan = await getUserPlan(userId)
    const limit = getPlanLimit(plan)
    const dayBounds = getDayBounds()
    const distinctToday = await countDistinctOpenedToday(userId, dayBounds)
    const existingTodayTitle = await WatchHistory.exists({
        userId,
        tmdbId,
        openedAt: { $gte: dayBounds.start, $lte: dayBounds.end },
    })

    if (Number.isFinite(limit) && !existingTodayTitle && distinctToday >= limit) {
        const err = new Error('Limite de títulos diários atingido')
        err.status = 403
        throw err
    }

    const history = await WatchHistory.findOneAndUpdate(
        { userId, tmdbId, season, episode },
        {
            $set: {
                mediaType,
                progressSeconds,
                openedAt: new Date(),
            },
            $setOnInsert: {
                userId,
                tmdbId,
                season,
                episode,
                mediaType,
                progressSeconds,
                openedAt: new Date(),
            },
        },
        {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        }
    )

    return history
}

const listHistory = async (userId) => {
    return WatchHistory.find({ userId }).sort({ openedAt: -1 })
}

const getHistoryByTmdbId = async (userId, tmdbId) => {
    return WatchHistory.find({ userId, tmdbId }).sort({ season: 1, episode: 1 })
}

module.exports = { saveProgress, listHistory, getHistoryByTmdbId, getWatchLimit }