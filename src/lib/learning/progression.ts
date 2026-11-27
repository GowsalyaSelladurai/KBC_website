import { Prisma, VideoStatus } from "@prisma/client";
import { getAuthorizedBunnyPlayback, type BunnyPlaybackInfo } from "@/lib/bunny";
import { prisma } from "@/lib/prisma";

export type LockedReason =
  | "VIDEO_NOT_READY"
  | "PREVIOUS_LESSON_INCOMPLETE"
  | null;

export type LessonProgressionItem = {
  id: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  description: string | null;
  sortOrder: number;
  durationSeconds: number | null;
  isPreview: boolean;
  videoStatus: VideoStatus;
  isEligible: boolean;
  isUnlocked: boolean;
  isCompleted: boolean;
  completedAt: string | null;
  lockedReason: LockedReason;
};

export type ModuleProgressionItem = {
  id: string;
  title: string;
  sortOrder: number;
  lessons: LessonProgressionItem[];
};

export type ProgressionSummary = {
  totalModules: number;
  totalLessons: number;
  totalEligibleLessons: number;
  completedLessons: number;
  completionPercentage: number;
};

export type CourseProgressionResult = {
  courseId: string;
  courseTitle: string;
  studentKey: string;
  modules: ModuleProgressionItem[];
  currentUnlockableLesson: LessonProgressionItem | null;
  summary: ProgressionSummary;
};

export class LearningRuleError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type DbClient = Prisma.TransactionClient | typeof prisma;

type RawLesson = {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  durationSeconds: number | null;
  isPreview: boolean;
  videoStatus: VideoStatus;
  bunnyVideoId: string | null;
};

function isLessonEligibleForLearning(lesson: RawLesson): boolean {
  return (
    lesson.videoStatus === "READY" &&
    typeof lesson.bunnyVideoId === "string" &&
    lesson.bunnyVideoId.trim().length > 0
  );
}

async function loadOrderedPublishedCourse(courseId: string, db: DbClient) {
  return db.course.findFirst({
    where: {
      id: courseId,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      modules: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          sortOrder: true,
          lessons: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            select: {
              id: true,
              title: true,
              description: true,
              sortOrder: true,
              durationSeconds: true,
              isPreview: true,
              videoStatus: true,
              bunnyVideoId: true,
            },
          },
        },
      },
    },
  });
}

function buildProgression(params: {
  course: NonNullable<Awaited<ReturnType<typeof loadOrderedPublishedCourse>>>;
  studentKey: string;
  completedRecords: Array<{ lessonId: string; completedAt: Date }>;
}): {
  progression: CourseProgressionResult;
  orderedLessons: LessonProgressionItem[];
} {
  const { course, studentKey, completedRecords } = params;

  const completedMap = new Map<string, Date>();
  for (const row of completedRecords) {
    completedMap.set(row.lessonId, row.completedAt);
  }

  const orderedLessons: LessonProgressionItem[] = [];
  let totalLessons = 0;
  let totalEligibleLessons = 0;
  let completedEligibleCount = 0;
  let previousLessonsAllCompleted = true;
  let currentUnlockableLesson: LessonProgressionItem | null = null;

  const modules: ModuleProgressionItem[] = course.modules.map((mod) => {
    const lessons: LessonProgressionItem[] = mod.lessons.map((lesson) => {
      totalLessons++;
      const isEligible = isLessonEligibleForLearning(lesson);
      const completedAtDate = completedMap.get(lesson.id) ?? null;
      const isCompleted = completedAtDate !== null;

      if (isEligible) {
        totalEligibleLessons++;
        if (isCompleted) {
          completedEligibleCount++;
        }
      }

      const isUnlocked =
        isEligible && (previousLessonsAllCompleted || isCompleted);

      const lockedReason: LockedReason = !isEligible
        ? "VIDEO_NOT_READY"
        : isUnlocked
          ? null
          : "PREVIOUS_LESSON_INCOMPLETE";

      const item: LessonProgressionItem = {
        id: lesson.id,
        moduleId: mod.id,
        moduleTitle: mod.title,
        title: lesson.title,
        description: lesson.description,
        sortOrder: lesson.sortOrder,
        durationSeconds: lesson.durationSeconds,
        isPreview: lesson.isPreview,
        videoStatus: lesson.videoStatus,
        isEligible,
        isUnlocked,
        isCompleted,
        completedAt: completedAtDate ? completedAtDate.toISOString() : null,
        lockedReason,
      };

      orderedLessons.push(item);

      if (!currentUnlockableLesson && isUnlocked && !isCompleted) {
        currentUnlockableLesson = item;
      }

      // Every preceding lesson in the curriculum must be completed before later lessons unlock.
      // An unavailable (non-READY) lesson cannot be completed, so it blocks all subsequent lessons.
      previousLessonsAllCompleted = previousLessonsAllCompleted && isCompleted;

      return item;
    });

    return {
      id: mod.id,
      title: mod.title,
      sortOrder: mod.sortOrder,
      lessons,
    };
  });

  const completionPercentage =
    totalEligibleLessons > 0
      ? Math.round((completedEligibleCount / totalEligibleLessons) * 100)
      : 0;

  return {
    progression: {
      courseId: course.id,
      courseTitle: course.title,
      studentKey,
      modules,
      currentUnlockableLesson,
      summary: {
        totalModules: course.modules.length,
        totalLessons,
        totalEligibleLessons,
        completedLessons: completedEligibleCount,
        completionPercentage,
      },
    },
    orderedLessons,
  };
}

export async function getCourseProgression(params: {
  studentKey: string;
  courseId: string;
  db?: DbClient;
}): Promise<CourseProgressionResult> {
  const db = params.db ?? prisma;
  const course = await loadOrderedPublishedCourse(params.courseId, db);

  if (!course) {
    throw new LearningRuleError(404, "Published course not found.");
  }

  const completedRecords = await db.lessonProgress.findMany({
    where: {
      studentKey: params.studentKey,
      courseId: course.id,
      completed: true,
    },
    select: {
      lessonId: true,
      completedAt: true,
    },
  });

  return buildProgression({
    course,
    studentKey: params.studentKey,
    completedRecords,
  }).progression;
}

export async function completeLessonForStudent(params: {
  studentKey: string;
  courseId: string;
  lessonId: string;
}) {
  return prisma.$transaction(async (tx) => {
    // Serialize progression writes per (studentKey, courseId) so simultaneous
    // duplicate or adjacent-lesson requests cannot read stale completion state.
    const lockKey = `kbc_learning:${params.studentKey}:${params.courseId}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

    const course = await loadOrderedPublishedCourse(params.courseId, tx);
    if (!course) {
      throw new LearningRuleError(404, "Published course not found.");
    }

    let foundLesson: RawLesson | null = null;
    for (const mod of course.modules) {
      const match = mod.lessons.find((l) => l.id === params.lessonId);
      if (match) {
        foundLesson = match;
        break;
      }
    }

    if (!foundLesson) {
      throw new LearningRuleError(
        404,
        "Lesson not found in this published course.",
      );
    }

    if (!isLessonEligibleForLearning(foundLesson)) {
      throw new LearningRuleError(
        409,
        "Lesson video is not ready for learning.",
      );
    }

    const completedRecords = await tx.lessonProgress.findMany({
      where: {
        studentKey: params.studentKey,
        courseId: course.id,
        completed: true,
      },
      select: {
        lessonId: true,
        completedAt: true,
      },
    });

    const { progression, orderedLessons } = buildProgression({
      course,
      studentKey: params.studentKey,
      completedRecords,
    });

    const targetItem = orderedLessons.find((l) => l.id === params.lessonId);
    if (!targetItem) {
      throw new LearningRuleError(
        404,
        "Lesson not found in this published course.",
      );
    }

    if (targetItem.isCompleted) {
      return {
        alreadyCompleted: true,
        completedLesson: targetItem,
        nextUnlockableLesson: progression.currentUnlockableLesson,
        summary: progression.summary,
      };
    }

    if (!targetItem.isUnlocked) {
      throw new LearningRuleError(
        403,
        "Previous lesson must be completed before completing this lesson.",
      );
    }

    await tx.lessonProgress.upsert({
      where: {
        studentKey_courseId_lessonId: {
          studentKey: params.studentKey,
          courseId: course.id,
          lessonId: params.lessonId,
        },
      },
      create: {
        studentKey: params.studentKey,
        courseId: course.id,
        lessonId: params.lessonId,
        completed: true,
      },
      update: {},
    });

    const updatedProgression = await getCourseProgression({
      studentKey: params.studentKey,
      courseId: course.id,
      db: tx,
    });

    const completedLesson =
      updatedProgression.modules
        .flatMap((m) => m.lessons)
        .find((l) => l.id === params.lessonId) ?? targetItem;

    return {
      alreadyCompleted: false,
      completedLesson,
      nextUnlockableLesson: updatedProgression.currentUnlockableLesson,
      summary: updatedProgression.summary,
    };
  });
}

export type LessonPlaybackResult = {
  courseId: string;
  courseTitle: string;
  studentKey: string;
  lesson: LessonProgressionItem;
  playback: BunnyPlaybackInfo;
};

export async function getLessonPlaybackForStudent(params: {
  studentKey: string;
  courseId: string;
  lessonId: string;
}): Promise<LessonPlaybackResult> {
  const course = await loadOrderedPublishedCourse(params.courseId, prisma);
  if (!course) {
    throw new LearningRuleError(404, "Published course not found.");
  }

  let foundLesson: RawLesson | null = null;
  for (const mod of course.modules) {
    const match = mod.lessons.find((l) => l.id === params.lessonId);
    if (match) {
      foundLesson = match;
      break;
    }
  }

  if (!foundLesson) {
    throw new LearningRuleError(
      404,
      "Lesson not found in this published course.",
    );
  }

  if (!isLessonEligibleForLearning(foundLesson)) {
    throw new LearningRuleError(
      409,
      "Lesson video is not ready for playback.",
    );
  }

  const completedRecords = await prisma.lessonProgress.findMany({
    where: {
      studentKey: params.studentKey,
      courseId: course.id,
      completed: true,
    },
    select: {
      lessonId: true,
      completedAt: true,
    },
  });

  const { orderedLessons } = buildProgression({
    course,
    studentKey: params.studentKey,
    completedRecords,
  });

  const targetItem = orderedLessons.find((l) => l.id === params.lessonId);
  if (!targetItem) {
    throw new LearningRuleError(
      404,
      "Lesson not found in this published course.",
    );
  }

  if (!targetItem.isUnlocked) {
    throw new LearningRuleError(
      403,
      "This lesson is locked. Complete preceding lessons first.",
    );
  }

  const playback = getAuthorizedBunnyPlayback(foundLesson.bunnyVideoId!);

  return {
    courseId: course.id,
    courseTitle: course.title,
    studentKey: params.studentKey,
    lesson: targetItem,
    playback,
  };
}
