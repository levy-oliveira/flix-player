const mongoose = require('mongoose')

const watchHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        tmdbId: {
            type: Number,
            required: true,
        },
        mediaType: {
            type: String,
            enum: ['movie', 'tv'],
            required: true,
        },
        season: {
            type: Number,
            required: true,
            min: 1,
        },
        episode: {
            type: Number,
            required: true,
            min: 1,
        },
        progressSeconds: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
    },
    {
        timestamps: {
            createdAt: false,
            updatedAt: 'atualizadoEm',
        },
    }
)

watchHistorySchema.index({ userId: 1, tmdbId: 1, season: 1, episode: 1 }, { unique: true })

module.exports = mongoose.model('WatchHistory', watchHistorySchema)