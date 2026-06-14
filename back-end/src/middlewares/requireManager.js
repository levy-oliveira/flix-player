const requireManager = (req, res, next) => {
    if (req.role !== 'manager') {
        return res.status(403).json({ success: false, message: 'Acesso restrito ao gerente' })
    }
    next()
}

module.exports = requireManager