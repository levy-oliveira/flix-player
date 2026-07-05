const { Router } = require('express')
const { body, param } = require('express-validator')
const auth = require('../../middlewares/auth')
const validate = require('../../middlewares/validate')
const { upsertReview, removeReview, listMyReviews, getReviewStats, getMyReview } = require('./reviews.controller')

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Avaliações de filmes e séries
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Cria ou atualiza a avaliação do usuário autenticado para um título
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tmdbId, mediaType, stars]
 *             properties:
 *               tmdbId:
 *                 type: integer
 *                 example: 603
 *               mediaType:
 *                 type: string
 *                 enum: [movie, tv]
 *                 example: movie
 *               stars:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *     responses:
 *       201:
 *         description: Avaliação salva com sucesso
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
        body('stars').isInt({ min: 1, max: 5 }).withMessage('stars deve ser um inteiro entre 1 e 5'),
    ],
    validate,
    upsertReview
)

/**
 * @swagger
 * /reviews/{tmdbId}:
 *   delete:
 *     summary: Remove a avaliação do usuário autenticado para um título
 *     tags: [Reviews]
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
 *         description: Avaliação removida com sucesso
 *       404:
 *         description: Avaliação não encontrada
 */
router.delete(
    '/:tmdbId',
    auth,
    [param('tmdbId').isInt({ min: 1 }).withMessage('tmdbId deve ser um número inteiro positivo')],
    validate,
    removeReview
)

/**
 * @swagger
 * /reviews/me:
 *   get:
 *     summary: Lista todas as avaliações do usuário autenticado
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de avaliações do usuário
 */
router.get('/me', auth, listMyReviews)


router.get(
    '/me/:tmdbId',
    auth,
    [param('tmdbId').isInt({ min: 1 }).withMessage('tmdbId inválido')],
    validate,
    getMyReview
)


/**
 * @swagger
 * /reviews/{tmdbId}:
 *   get:
 *     summary: Retorna a média e o total de avaliações de um título
 *     tags: [Reviews]
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
 *         description: Estatísticas de avaliação do título
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 average:
 *                   type: number
 *                   nullable: true
 *                   example: 4.2
 *                 total:
 *                   type: integer
 *                   example: 15
 */
router.get(
    '/:tmdbId',
    auth,
    [param('tmdbId').isInt({ min: 1 }).withMessage('tmdbId deve ser um número inteiro positivo')],
    validate,
    getReviewStats
)

module.exports = router
