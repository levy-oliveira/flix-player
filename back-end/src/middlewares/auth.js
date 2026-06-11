const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config/env')

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token inválido ou expirado' })
  }
}

module.exports = auth
