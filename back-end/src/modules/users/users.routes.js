const { Router } = require('express')
const { body } = require('express-validator')
const auth = require('../../middlewares/auth')
const validate = require('../../middlewares/validate')
const { getMe, updateMe } = require('./users.controller')

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento do perfil do usuário
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *       401:
 *         description: Não autorizado
 */
router.get('/me', auth, getMe)

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Atualiza nome ou senha do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil atualizado
 */
router.patch(
    '/me',
    auth,
    [
        body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio'),
        body('password').optional().isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
    ],
    validate,
    updateMe
)

module.exports = router