const User = require('../../models/User')
const Favorite = require('../../models/Favorite')
const WatchHistory = require('../../models/WatchHistory')
const Blacklist = require('../../models/Blacklist')
const { MANAGER_BOOTSTRAP_PASSWORD } = require('../../config/env')

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

const listUsers = async () => {
    return User.find()
        .select('name email role plan createdAt')
        .sort({ createdAt: -1 })
        .lean()
}

const createManager = async ({ name, email, password, bootstrapPassword }) => {
    if (bootstrapPassword !== MANAGER_BOOTSTRAP_PASSWORD) {
        const error = new Error('Senha de bootstrap inválida')
        error.status = 403
        throw error
    }

    const exists = await User.findOne({ email })
    if (exists) {
        const error = new Error('Email já cadastrado')
        error.status = 409
        throw error
    }

    const user = await User.create({
        name,
        email,
        password,
        role: 'manager',
        plan: 'pro',
    })

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            plan: user.plan,
        },
    }
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

const addToBlacklist = async (tmdbId, mediaType, managerId) => {
    try {
        const entry = await Blacklist.create({ tmdbId, mediaType, addedBy: managerId })
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

module.exports = { getStats, listUsers, createManager, deleteUser, updateUserPlan, addToBlacklist, removeFromBlacklist, listBlacklist }
