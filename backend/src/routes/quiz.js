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
 *     description: Returns questions without correctness flags.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       text:
 *                         type: string
 *                       order:
 *                         type: integer
 *                       multiSelect:
 *                         type: boolean
 *                       answers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             text:
 *                               type: string
 */
router.get('/video/:videoId', getVideoQuiz);

/**
 * @swagger
 * /api/quiz/attempts:
 *   post:
 *     summary: Submit quiz attempt
 *     description: |
 *       Accepts answers and returns scored result. Correctness is computed server-side.
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers]
 *             properties:
 *               videoId:
 *                 type: string
 *                 nullable: true
 *               moduleId:
 *                 type: string
 *                 nullable: true
 *               answers:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [questionId, selectedAnswerIds]
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     selectedAnswerIds:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       201:
 *         description: Attempt stored
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attempt:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     score: { type: integer }
 *                     total: { type: integer }
 *                     videoId: { type: string, nullable: true }
 *                     moduleId: { type: string, nullable: true }
 *                     completedAt: { type: string, format: date-time }
 *                 result:
 *                   type: object
 *                   properties:
 *                     score: { type: integer }
 *                     total: { type: integer }
 *                     percent: { type: integer }
 */
router.post('/attempts', supabaseOrLegacyAuth, submitAttempt);

module.exports = router;
