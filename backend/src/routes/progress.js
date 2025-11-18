'use strict';
const express = require('express');
const { getSummary, getModuleProgress, trackProgress } = require('../controllers/progress');
const { supabaseOrLegacyAuth } = require('../middleware/supabaseAuth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Progress
 *     description: Track and query learning progress
 */

/**
 * @swagger
 * /api/progress:
 *   get:
 *     summary: Get overall progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progress summary
 */
router.get('/', supabaseOrLegacyAuth, getSummary);

/**
 * @swagger
 * /api/progress/module/{moduleId}:
 *   get:
 *     summary: Get module progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Module progress
 */
router.get('/module/:moduleId', supabaseOrLegacyAuth, getModuleProgress);

/**
 * @swagger
 * /api/progress/track:
 *   post:
 *     summary: Track progress update
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Progress tracked
 */
router.post('/track', supabaseOrLegacyAuth, trackProgress);

module.exports = router;
