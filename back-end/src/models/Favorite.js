const mongoose = require('mongoose')

const favoriteSchema = new mongoose.Schema(
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
    },
    {
        timestamps: {
            createdAt: 'adicionadoEm',
            updatedAt: false,
        },
    }
)

favoriteSchema.index({ userId: 1, tmdbId: 1 }, { unique: true })

module.exports = mongoose.model('Favorite', favoriteSchema)