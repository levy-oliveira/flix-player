const mongoose = require('mongoose')

const blacklistSchema = new mongoose.Schema(
    {
        tmdbId: {
            type: Number,
            required: true,
            unique: true,
        },
        mediaType: {
            type: String,
            enum: ['movie', 'tv'],
            required: true,
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model('Blacklist', blacklistSchema)
