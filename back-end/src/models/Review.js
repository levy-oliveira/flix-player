const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
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
        stars: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
    },
    { timestamps: true }
)

reviewSchema.index({ userId: 1, tmdbId: 1 }, { unique: true })

module.exports = mongoose.model('Review', reviewSchema)
