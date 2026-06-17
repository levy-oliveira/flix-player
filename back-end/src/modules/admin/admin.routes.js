const { Router } = require('express')
const { body, param } = require('express-validator')
const auth = require('../../middlewares/auth')
const requireManager = require('../../middlewares/requireManager')
const validate = require('../../middlewares/validate')
const  {listBlacklistIds}  = require('./admin.public.controller')
const {
    getStats,
    deleteUser,
    updateUserPlan,
    addToBlacklist,
    removeFromBlacklist,
    listBlacklist,
} = require('./admin.controller')

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Painel de gerente — acesso restrito a usuários com role manager
 */

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     summary: Retorna estatísticas gerais da plataforma
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 totalBlacklist:
 *                   type: integer
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 */
router.get('/stats', auth, requireManager, getStats)

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Remove um usuário e todos os seus dados em cascata
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário removido com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.delete(
    '/users/:id',
    auth,
    requireManager,
    [param('id').isMongoId().withMessage('ID inválido')],
    validate,
    deleteUser
)

/**
 * @swagger
 * /admin/users/{id}/plan:
 *   patch:
 *     summary: Altera o plano de um usuário
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plan]
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [free, basic, pro]
 *     responses:
 *       200:
 *         description: Plano atualizado com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       422:
 *         description: Dados inválidos
 */
router.patch(
    '/users/:id/plan',
    auth,
    requireManager,
    [
        param('id').isMongoId().withMessage('ID inválido'),
        body('plan').isIn(['free', 'basic', 'pro']).withMessage('Plano inválido'),
    ],
    validate,
    updateUserPlan
)

/**
 * @swagger
 * /admin/blacklist:
 *   post:
 *     summary: Adiciona um título à blacklist
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tmdbId]
 *             properties:
 *               tmdbId:
 *                 type: integer
 *                 example: 603
 *     responses:
 *       201:
 *         description: Título adicionado à blacklist
 *       409:
 *         description: Título já está na blacklist
 */
router.post(
    '/blacklist',
    auth,
    requireManager,
    [body('tmdbId').isInt({ min: 1 }).withMessage('tmdbId deve ser um número inteiro positivo')],
    validate,
    addToBlacklist
)

/**
 * @swagger
 * /admin/blacklist/{tmdbId}:
 *   delete:
 *     summary: Remove um título da blacklist
 *     tags: [Admin]
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
 *         description: Título removido da blacklist
 *       404:
 *         description: Título não encontrado na blacklist
 */
router.delete(
    '/blacklist/:tmdbId',
    auth,
    requireManager,
    [param('tmdbId').isInt({ min: 1 }).withMessage('tmdbId deve ser um número inteiro positivo')],
    validate,
    removeFromBlacklist
)

/**
 * @swagger
 * /admin/blacklist/public:
 *   get:
 *     summary: Lista apenas os IDs bloqueados (uso interno do proxy TMDB)
 *     tags: [Admin]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de tmdbIds bloqueados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ids:
 *                   type: array
 *                   items:
 *                     type: integer
 */
router.get('/blacklist/public', listBlacklistIds)

/**
 * @swagger
 * /admin/blacklist:
 *   get:
 *     summary: Lista todos os títulos na blacklist
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista da blacklist retornada com sucesso
 */
router.get('/blacklist', auth, requireManager, listBlacklist)

module.exports = router
