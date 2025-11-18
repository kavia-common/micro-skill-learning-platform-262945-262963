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
 *     summary: Get content feed
 *     tags: [Content]
 *     responses:
 *       200:
 *         description: Feed returned
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
