'use strict';
const { getPrisma } = require('../db/prisma');

/**
 * PUBLIC_INTERFACE
 * getSummary
 * Returns overall progress summary for the authenticated user.
 */
async function getSummary(req, res, next) {
  /** This is a public function that returns user's overall progress. */
  try {
    const prisma = getPrisma();
    const progress = await prisma.progress.findMany({
      where: { userId: req.user.id },
      select: { moduleId: true, completedVideos: true, totalVideos: true, lastVideoId: true, updatedAt: true },
    });
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId: req.user.id },
      orderBy: { completedAt: 'desc' },
      select: { id: true, score: true, total: true, videoId: true, moduleId: true, completedAt: true },
      take: 10,
    });
    return res.json({ progress, recentAttempts: attempts });
  } catch (err) {
    return next(err);
  }
}

/**
 * PUBLIC_INTERFACE
 * getModuleProgress
 * Returns progress for a specific module.
 */
async function getModuleProgress(req, res, next) {
  /** This is a public function that returns module progress. */
  try {
    const prisma = getPrisma();
    const moduleId = req.params.moduleId;
    const prog = await prisma.progress.findUnique({
      where: { user_module_unique: { userId: req.user.id, moduleId } },
      select: { moduleId: true, completedVideos: true, totalVideos: true, lastVideoId: true, updatedAt: true },
    });
    if (!prog) {
      // Create a baseline if module exists
      const totalVideos = await prisma.video.count({ where: { moduleId } });
      return res.json({ moduleId, completedVideos: 0, totalVideos, lastVideoId: null, updatedAt: null });
    }
    return res.json(prog);
  } catch (err) {
    return next(err);
  }
}

/**
 * PUBLIC_INTERFACE
 * trackProgress
 * Tracks completion of a video for a module and updates counters.
 */
async function trackProgress(req, res, next) {
  /** This is a public function that records user progress. */
  try {
    const { moduleId, videoId, completed } = req.body || {};
    if (!moduleId || typeof moduleId !== 'string') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'moduleId is required' } });
    }
    if (videoId && typeof videoId !== 'string') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'videoId must be a string' } });
    }
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'completed must be a boolean' } });
    }
    const prisma = getPrisma();
    const totalVideos = await prisma.video.count({ where: { moduleId } });

    const existing = await prisma.progress.findUnique({
      where: { user_module_unique: { userId: req.user.id, moduleId } },
    });

    let completedVideos = existing ? existing.completedVideos : 0;
    if (completed) {
      // increment up to totalVideos
      completedVideos = Math.min(totalVideos, completedVideos + 1);
    } else {
      // allow decrement but not below zero
      completedVideos = Math.max(0, completedVideos - 1);
    }

    const saved = await prisma.progress.upsert({
      where: { user_module_unique: { userId: req.user.id, moduleId } },
      update: { completedVideos, totalVideos, lastVideoId: videoId || existing?.lastVideoId || null },
      create: { userId: req.user.id, moduleId, completedVideos, totalVideos, lastVideoId: videoId || null },
      select: { moduleId: true, completedVideos: true, totalVideos: true, lastVideoId: true, updatedAt: true },
    });

    return res.status(201).json(saved);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  // PUBLIC_INTERFACE
  getSummary,
  // PUBLIC_INTERFACE
  getModuleProgress,
  // PUBLIC_INTERFACE
  trackProgress,
};
