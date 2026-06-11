// Envolve funções async dos controllers para repassar erros ao errorHandler global
// Em vez de try/catch em todo controller, use: router.get('/', asyncHandler(controller))
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = asyncHandler
