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
 *     description: |
 *       Accepts a body with moduleId, optional videoId, and a boolean completed flag.
 *       Increments or decrements the user's completedVideos within the module and updates lastVideoId.
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [moduleId, completed]
 *             properties:
 *               moduleId:
 *                 type: string
 *                 description: The module being progressed
 *               videoId:
 *                 type: string
 *                 nullable: true
 *                 description: The video the user just completed or uncompleted
 *               completed:
 *                 type: boolean
 *                 description: true to increment, false to decrement completion count
 *     responses:
 *       201:
 *         description: Progress tracked
 */
router.post('/track', supabaseOrLegacyAuth, trackProgress);

module.exports = router;
