const User = require('../../models/User')
const Favorite = require('../../models/Favorite')
const WatchHistory = require('../../models/WatchHistory')
const Blacklist = require('../../models/Blacklist')

let Review
try {
    Review = require('../../models/Review')
} catch {
    Review = null
}

const getStats = async () => {
    const totalUsers = await User.countDocuments()
    const totalBlacklist = await Blacklist.countDocuments()
    return { totalUsers, totalBlacklist }
}

const deleteUser = async (targetId) => {
    const user = await User.findById(targetId)
    if (!user) {
        const e = new Error('Usuário não encontrado')
        e.status = 404
        throw e
    }

    const deletions = [
        Favorite.deleteMany({ userId: targetId }),
        WatchHistory.deleteMany({ userId: targetId }),
        User.findByIdAndDelete(targetId),
    ]
    if (Review) deletions.push(Review.deleteMany({ userId: targetId }))

    await Promise.all(deletions)
}

const updateUserPlan = async (targetId, plan) => {
    const user = await User.findByIdAndUpdate(
        targetId,
        { plan },
        { new: true, runValidators: true }
    )
    if (!user) {
        const e = new Error('Usuário não encontrado')
        e.status = 404
        throw e
    }
    return user
}

const addToBlacklist = async (tmdbId, managerId) => {
    try {
        const entry = await Blacklist.create({ tmdbId, addedBy: managerId })
        return entry
    } catch (err) {
        if (err.code === 11000) {
            const e = new Error('Título já está na blacklist')
            e.status = 409
            throw e
        }
        throw err
    }
}

const removeFromBlacklist = async (tmdbId) => {
    const entry = await Blacklist.findOneAndDelete({ tmdbId })
    if (!entry) {
        const e = new Error('Título não encontrado na blacklist')
        e.status = 404
        throw e
    }
}

const listBlacklist = async () => {
    return Blacklist.find().sort({ createdAt: -1 })
}

module.exports = { getStats, deleteUser, updateUserPlan, addToBlacklist, removeFromBlacklist, listBlacklist }
