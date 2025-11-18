'use strict';
const express = require('express');
const { getFeed, listModules, getModuleById, getVideoById } = require('../controllers/content');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Content
 *     description: Public content routes
 */

/**
 * @swagger
 * /api/feed:
 *   get:
 *     summary: Get video feed
 *     description: |
 *       Returns a TikTok-style feed of videos.
 *       Supports simple cursor pagination using the "after" query param (ISO date from previous nextCursor).
 *     tags: [Content]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         required: false
 *         description: Max items to return (default 10, max 50)
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *           format: date-time
 *         required: false
 *         description: ISO timestamp to paginate after (exclusive)
 *     responses:
 *       200:
 *         description: Feed returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       title: { type: string }
 *                       url: { type: string }
 *                       durationSeconds: { type: integer }
 *                       thumbnailUrl: { type: string, nullable: true }
 *                       moduleId: { type: string }
 *                       createdAt: { type: string, format: date-time }
 *                 nextCursor:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 */
router.get('/feed', getFeed);

/**
 * @swagger
 * /api/modules:
 *   get:
 *     summary: List modules
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: Modules returned
 */
router.get('/modules', listModules);

/**
 * @swagger
 * /api/modules/{moduleId}:
 *   get:
 *     summary: Get module by id
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Module returned
 */
router.get('/modules/:moduleId', getModuleById);

/**
 * @swagger
 * /api/videos/{videoId}:
 *   get:
 *     summary: Get video by id
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Video returned
 */
router.get('/videos/:videoId', getVideoById);

module.exports = router;
