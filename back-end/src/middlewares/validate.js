const { validationResult } = require('express-validator')

// Use depois das regras de validação do express-validator em cada rota
// ex: router.post('/login', [...rules], validate, controller)
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    })
  }
  next()
}

module.exports = validate
