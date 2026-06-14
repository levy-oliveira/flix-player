const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Nome é obrigatório'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email é obrigatório'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Senha é obrigatória'],
            minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
            select: false,
        },
        role: {
            type: String,
            enum: ['user', 'manager'],
            default: 'user',
        },
        plan: {
            type: String,
            enum: ['free', 'basic', 'pro'],
            default: 'free',
        },
    },
    { timestamps: true }
)

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return
    this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = async function (candidate) {
    return bcrypt.compare(candidate, this.password)
}

module.exports = mongoose.model('User', userSchema)