const { Router } = require('express')
const { body, param } = require('express-validator')
const auth = require('../../middlewares/auth')
const validate = require('../../middlewares/validate')
const { addFavorite, removeFavorite, listFavorites } = require('./favorites.controller')

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Gerenciamento da lista de favoritos do usuário autenticado
 */

/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Adiciona um título aos favoritos do usuário autenticado
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tmdbId, mediaType]
 *             properties:
 *               tmdbId:
 *                 type: integer
 *                 example: 603
 *               mediaType:
 *                 type: string
 *                 enum: [movie, tv]
 *                 example: movie
 *     responses:
 *       201:
 *         description: Favorito adicionado com sucesso
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
    ],
    validate,
    addFavorite
)

/**
 * @swagger
 * /favorites/{tmdbId}:
 *   delete:
 *     summary: Remove um título dos favoritos do usuário autenticado
 *     tags: [Favorites]
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
 *         description: Favorito removido com sucesso
 *       404:
 *         description: Favorito não encontrado
 */
router.delete(
    '/:tmdbId',
    auth,
    [param('tmdbId').isInt({ min: 1 }).withMessage('tmdbId deve ser um número inteiro positivo')],
    validate,
    removeFavorite
)

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Lista os favoritos do usuário autenticado
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de favoritos
 */
router.get('/', auth, listFavorites)

module.exports = router