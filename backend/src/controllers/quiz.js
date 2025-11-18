'use strict';
const { getPrisma } = require('../db/prisma');
const { validateQuizAttempt } = require('../utils/validation');

/**
 * PUBLIC_INTERFACE
 * getVideoQuiz
 * Returns quiz questions and answers for a video.
 */
async function getVideoQuiz(req, res, next) {
  /** This is a public function that returns quiz questions for a video. */
  try {
    const prisma = getPrisma();
    const { videoId } = req.params;
    const questions = await prisma.quizQuestion.findMany({
      where: { videoId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        text: true,
        order: true,
        multiSelect: true,
        answers: { select: { id: true, text: true } }, // do not expose correctness
      },
    });
    if (!questions || questions.length === 0) {
      return res.json({ questions: [] });
    }
    return res.json({ questions });
  } catch (err) {
    return next(err);
  }
}

/**
 * PUBLIC_INTERFACE
 * submitAttempt
 * Submits answers and returns scoring result; stores attempt.
 */
async function submitAttempt(req, res, next) {
  /** This is a public function that scores and stores a quiz attempt. */
  try {
    const errors = validateQuizAttempt(req.body);
    if (errors.length) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: errors.join(', ') } });
    }
    const prisma = getPrisma();
    const { videoId, moduleId, answers } = req.body;

    // Gather correct answers for provided questions
    const questionIds = answers.map(a => a.questionId);
    const questions = await prisma.quizQuestion.findMany({
      where: { id: { in: questionIds } },
      include: { answers: true },
    });

    // Score calculation
    let score = 0;
    const total = questions.length;
    const answerMap = new Map(answers.map(a => [a.questionId, new Set(a.selectedAnswerIds)]));
    questions.forEach((q) => {
      const correctIds = new Set(q.answers.filter(a => a.isCorrect).map(a => a.id));
      const selected = answerMap.get(q.id) || new Set();
      // Correct if exactly match
      const isCorrect =
        correctIds.size === selected.size &&
        [...correctIds].every(id => selected.has(id));
      if (isCorrect) score += 1;
    });

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: req.user.id,
        videoId: videoId || null,
        moduleId: moduleId || null,
        score,
        total,
        completedAt: new Date(),
        answers, // store raw for audit
      },
      select: { id: true, score: true, total: true, videoId: true, moduleId: true, completedAt: true },
    });

    return res.status(201).json({ attempt, result: { score, total, percent: total ? Math.round((score / total) * 100) : 0 } });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  // PUBLIC_INTERFACE
  getVideoQuiz,
  // PUBLIC_INTERFACE
  submitAttempt,
};
