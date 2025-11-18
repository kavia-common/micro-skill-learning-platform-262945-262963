'use strict';
const express = require('express');
const { register, login, me } = require('../controllers/auth');
const { authMiddleware } = require('../middleware/auth'); // legacy
const { supabaseOrLegacyAuth } = require('../middleware/supabaseAuth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication routes
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (LEGACY - to be deprecated)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registered successfully
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login (LEGACY - to be deprecated)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Authenticated
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user (accepts legacy or Supabase token during migration)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 */
router.get('/me', supabaseOrLegacyAuth, me);

/**
 * @swagger
 * /api/auth/supabase/me:
 *   get:
 *     summary: Get current user using Supabase JWT
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user by Supabase session
 */
router.get('/supabase/me', supabaseOrLegacyAuth, me);

module.exports = router;
