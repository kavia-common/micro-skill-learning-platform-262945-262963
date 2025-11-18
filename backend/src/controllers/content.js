'use strict';
const { getPrisma } = require('../db/prisma');

/**
 * PUBLIC_INTERFACE
 * getFeed
 * Returns a content feed (recent videos and modules).
 */
async function getFeed(req, res, next) {
  /** This is a public function that returns a basic content feed. */
  try {
    const prisma = getPrisma();
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, title: true, url: true, durationSeconds: true, thumbnailUrl: true, moduleId: true, createdAt: true },
    });
    const modules = await prisma.module.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
      take: 10,
      select: { id: true, title: true, description: true, order: true, skillId: true },
    });
    return res.json({ videos, modules });
  } catch (err) {
    return next(err);
  }
}

/**
 * PUBLIC_INTERFACE
 * listModules
 * Returns all published modules.
 */
async function listModules(req, res, next) {
  /** This is a public function that lists published modules. */
  try {
    const prisma = getPrisma();
    const modules = await prisma.module.findMany({
      where: { isPublished: true },
      orderBy: [{ skillId: 'asc' }, { order: 'asc' }],
      select: { id: true, title: true, description: true, order: true, skillId: true },
    });
    return res.json({ modules });
  } catch (err) {
    return next(err);
  }
}

/**
 * PUBLIC_INTERFACE
 * getModuleById
 * Returns module detail including videos.
 */
async function getModuleById(req, res, next) {
  /** This is a public function that returns module details. */
  try {
    const prisma = getPrisma();
    const moduleId = req.params.moduleId;
    const mod = await prisma.module.findUnique({
      where: { id: moduleId },
      select: {
        id: true,
        title: true,
        description: true,
        order: true,
        isPublished: true,
        skillId: true,
        videos: {
          select: { id: true, title: true, durationSeconds: true, order: true, thumbnailUrl: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!mod || !mod.isPublished) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Module not found' } });
    }
    return res.json({ module: mod });
  } catch (err) {
    return next(err);
  }
}

/**
 * PUBLIC_INTERFACE
 * getVideoById
 * Returns video detail, summary and quiz question count.
 */
async function getVideoById(req, res, next) {
  /** This is a public function that returns video details. */
  try {
    const prisma = getPrisma();
    const videoId = req.params.videoId;
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        title: true,
        url: true,
        durationSeconds: true,
        order: true,
        thumbnailUrl: true,
        moduleId: true,
        summary: { select: { id: true, content: true, readingTimeSec: true } },
        quizQuestions: { select: { id: true } },
      },
    });
    if (!video) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Video not found' } });
    }
    const quizCount = video.quizQuestions.length;
    delete video.quizQuestions;
    return res.json({ video, quizCount });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  // PUBLIC_INTERFACE
  getFeed,
  // PUBLIC_INTERFACE
  listModules,
  // PUBLIC_INTERFACE
  getModuleById,
  // PUBLIC_INTERFACE
  getVideoById,
};
