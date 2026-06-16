const { Router } = require('express')
const { body, param } = require('express-validator')
const auth = require('../../middlewares/auth')
const validate = require('../../middlewares/validate')
const { saveProgress, listHistory, getHistoryByTmdbId } = require('./history.controller')

const router = Router()

/**
 * @swagger
 * tags:
 *   name: History
 *   description: Gerenciamento do histórico de reprodução do usuário autenticado
 */

/**
 * @swagger
 * /history:
 *   post:
 *     summary: Salva ou atualiza o progresso de reprodução
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tmdbId, mediaType, season, episode, progressSeconds]
 *             properties:
 *               tmdbId:
 *                 type: integer
 *                 example: 1399
 *               mediaType:
 *                 type: string
 *                 enum: [movie, tv]
 *                 example: tv
 *               season:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *               episode:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *               progressSeconds:
 *                 type: integer
 *                 minimum: 0
 *                 example: 1245
 *     responses:
 *       201:
 *         description: Progresso salvo com sucesso
 *       401:
 *         description: Não autorizado
 *       422:
 *         description: Dados inválidos
 */
router.post(
    '/',
    auth,
    [
        body('tmdbId').isInt({ min: 1 }).withMessage('tmdbId deve ser um número inteiro positivo'),
        body('mediaType').isIn(['movie', 'tv']).withMessage('mediaType deve ser movie ou tv'),
        body('season').isInt({ min: 1 }).withMessage('season deve ser um número inteiro maior ou igual a 1'),
        body('episode').isInt({ min: 1 }).withMessage('episode deve ser um número inteiro maior ou igual a 1'),
        body('progressSeconds').isInt({ min: 0 }).withMessage('progressSeconds deve ser um número inteiro maior ou igual a 0'),
    ],
    validate,
    saveProgress
)

/**
 * @swagger
 * /history:
 *   get:
 *     summary: Lista o histórico do usuário autenticado
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Histórico retornado com sucesso
 */
router.get('/', auth, listHistory)

/**
 * @swagger
 * /history/{tmdbId}:
 *   get:
 *     summary: Lista os registros de progresso de um título específico
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tmdbId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Registros do título retornados com sucesso
 */
router.get(
    '/:tmdbId',
    auth,
    [param('tmdbId').isInt({ min: 1 }).withMessage('tmdbId deve ser um número inteiro positivo')],
    validate,
    getHistoryByTmdbId
)

module.exports = router