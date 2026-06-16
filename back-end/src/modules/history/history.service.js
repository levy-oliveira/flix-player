const WatchHistory = require('../../models/WatchHistory')

const saveProgress = async (userId, { tmdbId, mediaType, season, episode, progressSeconds }) => {
    const history = await WatchHistory.findOneAndUpdate(
        { userId, tmdbId, season, episode },
        {
            $set: {
                mediaType,
                progressSeconds,
            },
            $setOnInsert: {
                userId,
                tmdbId,
                season,
                episode,
                mediaType,
                progressSeconds,
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
    return WatchHistory.find({ userId }).sort({ atualizadoEm: -1 })
}

const getHistoryByTmdbId = async (userId, tmdbId) => {
    return WatchHistory.find({ userId, tmdbId }).sort({ season: 1, episode: 1 })
}

module.exports = { saveProgress, listHistory, getHistoryByTmdbId }