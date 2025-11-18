/* eslint-disable no-console */
/**
 * Seed script for Micro-Skill LMS.
 *
 * Inserts:
 * - 2 skills
 * - For each skill: 2 modules
 * - For each module: 4–6 videos (30–90s) with summary and 3 quiz questions with answers
 *
 * Uses public sample video URLs and placeholder assets.
 * Note: Unique constraints exist for (moduleId, order), (skillId, order),
 *       (videoId, order) on questions, and (questionId, text) on answers.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function upsertUser(email, name) {
  const passwordHash = 'placeholder_hash'; // Do not use in production
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name },
  });
}

function boundedDuration(i) {
  // Create 30–90s durations with a small pattern
  const base = 35 + (i * 10);
  return Math.max(30, Math.min(90, base));
}

function sampleVideoData(moduleId, index) {
  const titles = [
    'Intro and Learning Objectives',
    'Core Concept Deep Dive',
    'Hands-on Example',
    'Tips and Best Practices',
    'Quick Demo Walkthrough',
    'Recap and Next Steps',
  ];
  const title = titles[index % titles.length];
  const order = index + 1;

  // Using public sample video URLs (small sample clips)
  const urlSamples = [
    'https://sample-videos.com/video321/mp4/720/sample-5s.mp4',
    'https://filesamples.com/samples/video/mp4/sample_640x360.mp4',
    'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
  ];

  const durationSeconds = boundedDuration(index);

  return {
    moduleId,
    title: `${title}`,
    url: urlSamples[index % urlSamples.length],
    durationSeconds,
    order,
    transcriptUrl: null,
    captionsUrl: null,
    thumbnailUrl: 'https://via.placeholder.com/640x360.png?text=Micro+Skill+Video',
  };
}

function sampleSummaryContent(videoTitle) {
  return `Summary for "${videoTitle}": This micro-lesson distills the essential points in a concise, actionable format. Key takeaways include understanding the concept, seeing it applied, and knowing next steps.`;
}

function buildQuestionsForVideo(videoId) {
  // 3 questions per video, each with 4 answers (1 correct)
  const questions = [
    {
      text: 'What is the main objective of this video?',
      answers: ['Entertainment', 'Demonstrate core concept', 'Introduce advanced math', 'Discuss unrelated topic'],
      correctIndex: 1,
    },
    {
      text: 'Which best describes the example shown?',
      answers: ['Unrelated', 'Hands-on and practical', 'Purely theoretical', 'Obsolete technique'],
      correctIndex: 1,
    },
    {
      text: 'What is the recommended next step?',
      answers: ['Do nothing', 'Practice the concept', 'Ignore the content', 'Learn an unrelated skill'],
      correctIndex: 1,
    },
  ];

  return questions.map((q, idx) => ({
    videoId,
    text: q.text,
    order: idx + 1,
    multiSelect: false,
    answers: q.answers.map((a, i) => ({
      text: a,
      isCorrect: i === q.correctIndex,
    })),
  }));
}

async function createModuleWithContent(skillId, baseTitle, moduleOrder, videoCount) {
  const module = await prisma.module.create({
    data: {
      skillId,
      title: baseTitle,
      description: `This module focuses on ${baseTitle.toLowerCase()} with short, focused videos.`,
      order: moduleOrder,
      isPublished: true,
    },
  });

  for (let i = 0; i < videoCount; i += 1) {
    const v = await prisma.video.create({
      data: sampleVideoData(module.id, i),
    });

    await prisma.summary.create({
      data: {
        videoId: v.id,
        content: sampleSummaryContent(v.title),
        readingTimeSec: Math.max(30, Math.round(v.durationSeconds / 2)),
      },
    });

    // Create 3 questions with answers per video
    const questions = buildQuestionsForVideo(v.id);
    for (const q of questions) {
      // Create question (unique by videoId+order)
      const createdQ = await prisma.quizQuestion.create({
        data: {
          videoId: q.videoId,
          text: q.text,
          order: q.order,
          multiSelect: q.multiSelect,
        },
      });
      // Create answers (unique by questionId+text)
      for (const ans of q.answers) {
        await prisma.quizAnswer.create({
          data: {
            questionId: createdQ.id,
            text: ans.text,
            isCorrect: ans.isCorrect,
          },
        });
      }
    }
  }

  return module;
}

async function main() {
  console.log('Seeding database...');

  // Ensure at least one demo user exists (for progress/attempts)
  const demoUser = await upsertUser('demo.user@example.com', 'Demo User');

  // Create Skills (unique by name)
  const skillA = await prisma.skill.upsert({
    where: { id: 'skillA' },
    update: {},
    create: {
      id: 'skillA',
      name: 'Productivity Basics',
      description: 'Learn micro-habits and techniques to improve productivity.',
    },
  });

  const skillB = await prisma.skill.upsert({
    where: { id: 'skillB' },
    update: {},
    create: {
      id: 'skillB',
      name: 'Web Development Fundamentals',
      description: 'Quick lessons covering core web development concepts.',
    },
  });

  // Modules for each skill (order unique per skill)
  const modA1 = await createModuleWithContent(skillA.id, 'Time Management Essentials', 1, 4);
  const modA2 = await createModuleWithContent(skillA.id, 'Focus and Deep Work', 2, 5);

  const modB1 = await createModuleWithContent(skillB.id, 'HTML & CSS Quickstart', 1, 4);
  const modB2 = await createModuleWithContent(skillB.id, 'JavaScript Fundamentals', 2, 6);

  // Initialize progress for demo user for each module
  const modules = [modA1, modA2, modB1, modB2];
  for (const m of modules) {
    const totalVideos = await prisma.video.count({ where: { moduleId: m.id } });
    await prisma.progress.upsert({
      where: {
        user_module_unique: {
        userId: demoUser.id,
        moduleId: m.id,
        },
      },
      update: {
        totalVideos,
      },
      create: {
        userId: demoUser.id,
        moduleId: m.id,
        completedVideos: 0,
        totalVideos,
      },
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
