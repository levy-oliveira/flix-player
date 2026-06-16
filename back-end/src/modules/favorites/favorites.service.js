const Favorite = require('../../models/Favorite')

const addFavorite = async (userId, { tmdbId, mediaType }) => {
    const favorite = await Favorite.findOneAndUpdate(
        { userId, tmdbId },
        {
            $set: {
                mediaType,
            },
            $setOnInsert: {
                userId,
                tmdbId,
                mediaType,
            },
        },
        {
            upsert: true,
            new: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        }
    )

    return favorite
}

const removeFavorite = async (userId, tmdbId) => {
    const favorite = await Favorite.findOneAndDelete({ userId, tmdbId })

    if (!favorite) {
        const err = new Error('Favorito não encontrado')
        err.status = 404
        throw err
    }

    return favorite
}

const listFavorites = async (userId) => {
    return Favorite.find({ userId }).sort({ adicionadoEm: -1 })
}

module.exports = { addFavorite, removeFavorite, listFavorites }