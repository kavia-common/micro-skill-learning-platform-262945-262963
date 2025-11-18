'use strict';
const express = require('express');
const { getVideoQuiz, submitAttempt } = require('../controllers/quiz');
const { supabaseOrLegacyAuth } = require('../middleware/supabaseAuth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Quiz
 *     description: Quiz endpoints
 */

/**
 * @swagger
 * /api/quiz/video/{videoId}:
 *   get:
 *     summary: Get quiz for a video
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Questions returned
 */
router.get('/video/:videoId', getVideoQuiz);

/**
 * @swagger
 * /api/quiz/attempts:
 *   post:
 *     summary: Submit quiz attempt
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Attempt stored
 */
router.post('/attempts', supabaseOrLegacyAuth, submitAttempt);

module.exports = router;
