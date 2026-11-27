export type VideoStatusValue =
  | "NOT_UPLOADED"
  | "PROCESSING"
  | "READY"
  | "FAILED";

export type DraftLessonInput = {
  id?: number;
  title: string;
  description?: string | null;
  sortOrder?: number;
  durationSeconds?: number | null;
  isPreview?: boolean;
  bunnyVideoId?: string | null;
  videoStatus?: VideoStatusValue;
};

export type DraftModuleInput = {
  id?: number;
  title: string;
  sortOrder?: number;
  lessons: DraftLessonInput[];
};

export type CreateCourseInput = {
  courseCode: string;
  title: string;
  description?: string;
  imageUrl?: string;
  duration?: string;
  durationDays?: number;
  price: number;
  learningPoints?: string[];
  modules?: DraftModuleInput[];
};

export type ValidationResult =
  | { success: true; data: CreateCourseInput }
  | { success: false; errors: string[] };

const validVideoStatuses: VideoStatusValue[] = [
  "NOT_UPLOADED",
  "PROCESSING",
  "READY",
  "FAILED",
];

/**
 * Parses a positive integer ID from a number or numeric string.
 * Returns null for missing, non-integer, zero, negative, or malformed values.
 */
export function parsePositiveIntId(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value > 0 ? value : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) return null;
    const parsed = Number(trimmed);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

/**
 * Interprets a course duration (positive integer days or string e.g. "7 Days", "1 Day", "1 Month", "15")
 * into a whole number of days. Returns null if duration cannot be parsed as a positive integer.
 */
export function parseCourseDurationDays(
  duration?: string | number | null,
): number | null {
  if (typeof duration === "number") {
    return Number.isSafeInteger(duration) && duration > 0 ? duration : null;
  }
  if (!duration || typeof duration !== "string") return null;
  const trimmed = duration.trim().toLowerCase();
  if (!trimmed) return null;

  const match = trimmed.match(/(\d+)\s*(day|days|d|week|weeks|w|month|months|mo)?/i);
  if (!match) return null;

  const num = Number(match[1]);
  if (!Number.isSafeInteger(num) || num <= 0) return null;

  const unit = (match[2] || "days").toLowerCase();
  if (unit.startsWith("month") || unit === "mo") return num * 30;
  if (unit.startsWith("week") || unit === "w") return num * 7;
  return num;
}

/**
 * Counts lessons that have an actual uploaded video (READY or PROCESSING with a video ID).
 * Excludes empty lesson placeholders, NOT_UPLOADED, and FAILED uploads.
 */
export function countValidUploadedVideos(
  modules?: Array<{
    lessons?: Array<{
      bunnyVideoId?: string | null;
      videoStatus?: string | null;
    }>;
  }>,
): number {
  if (!Array.isArray(modules)) return 0;

  let count = 0;
  for (const mod of modules) {
    if (!Array.isArray(mod.lessons)) continue;
    for (const lesson of mod.lessons) {
      const hasVideoId =
        typeof lesson.bunnyVideoId === "string" &&
        lesson.bunnyVideoId.trim().length > 0;
      const isUploadedStatus =
        lesson.videoStatus === "READY" || lesson.videoStatus === "PROCESSING";
      if (hasVideoId && isUploadedStatus) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Validates that the number of actual uploaded lesson videos is at least
 * equal to the course duration in days. Returns an error message or null if valid.
 */
export function validateMinimumCourseVideos(
  duration?: string | number | null,
  modules?: Array<{
    lessons?: Array<{
      bunnyVideoId?: string | null;
      videoStatus?: string | null;
    }>;
  }>,
): string | null {
  const requiredDays = parseCourseDurationDays(duration);
  if (requiredDays === null || requiredDays <= 0) {
    return null;
  }

  const uploadedCount = countValidUploadedVideos(modules);
  if (uploadedCount < requiredDays) {
    const videoLabel = requiredDays === 1 ? "video" : "videos";
    return `A ${requiredDays}-day course requires at least ${requiredDays} uploaded lesson ${videoLabel}. Currently ${uploadedCount} uploaded.`;
  }

  return null;
}

export function validateCreateCourse(input: unknown): ValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      success: false,
      errors: ["Invalid request body."],
    };
  }

  const body = input as Record<string, unknown>;
  const errors: string[] = [];

  const courseCode =
    typeof body.courseCode === "string" ? body.courseCode.trim() : "";

  const title = typeof body.title === "string" ? body.title.trim() : "";

  const description =
    typeof body.description === "string" ? body.description.trim() : undefined;

  const imageUrl =
    typeof body.imageUrl === "string" ? body.imageUrl.trim() : undefined;

  const duration =
    typeof body.duration === "string"
      ? body.duration.trim()
      : typeof body.duration === "number" && Number.isSafeInteger(body.duration) && body.duration > 0
        ? `${body.duration} Days`
        : undefined;

  let durationDays: number | undefined;
  if (body.durationDays !== undefined && body.durationDays !== null) {
    if (
      typeof body.durationDays !== "number" ||
      !Number.isSafeInteger(body.durationDays) ||
      body.durationDays <= 0
    ) {
      errors.push("Duration days must be a positive integer.");
    } else {
      durationDays = body.durationDays;
    }
  }

  const price = typeof body.price === "number" ? body.price : Number.NaN;

  const learningPoints = body.learningPoints;

  if (
    body.learningPoints !== undefined &&
    !Array.isArray(body.learningPoints)
  ) {
    errors.push("Learning points must be an array.");
  }

  if (
    Array.isArray(learningPoints) &&
    learningPoints.some((point) => typeof point !== "string")
  ) {
    errors.push("Learning points must contain only strings.");
  }

  if (!courseCode) {
    errors.push("Course code is required.");
  }

  if (!title) {
    errors.push("Course title is required.");
  }

  if (!Number.isFinite(price) || price < 0) {
    errors.push("Price must be a valid non-negative number.");
  }

  if (body.description !== undefined && typeof body.description !== "string") {
    errors.push("Description must be a string.");
  }

  if (
    body.imageUrl !== undefined &&
    body.imageUrl !== null &&
    typeof body.imageUrl !== "string"
  ) {
    errors.push("Course image is required.");
  }

  if (body.duration !== undefined && body.duration !== null) {
    if (typeof body.duration === "number") {
      if (!Number.isSafeInteger(body.duration) || body.duration <= 0) {
        errors.push("Duration must be a positive integer.");
      } else if (durationDays === undefined) {
        durationDays = body.duration;
      }
    } else if (typeof body.duration === "string") {
      const parsedFromText = parseCourseDurationDays(body.duration);
      if (body.duration.trim() && parsedFromText === null) {
        errors.push("Duration must be a positive number of days.");
      } else if (durationDays === undefined && parsedFromText !== null) {
        durationDays = parsedFromText;
      }
    } else {
      errors.push("Duration must be a string or positive integer.");
    }
  }

  if (body.modules !== undefined && !Array.isArray(body.modules)) {
    errors.push("Modules must be an array.");
  }

  const sanitizedModules: DraftModuleInput[] | undefined = Array.isArray(
    body.modules,
  )
    ? body.modules.map((rawMod, modIndex) => {
        const mod = (rawMod && typeof rawMod === "object" ? rawMod : {}) as Record<
          string,
          unknown
        >;
        const modTitle =
          typeof mod.title === "string" ? mod.title.trim() : "";
        if (!modTitle) {
          errors.push(`Module ${modIndex + 1} title is required.`);
        }

        const rawLessons = Array.isArray(mod.lessons) ? mod.lessons : [];
        const lessons: DraftLessonInput[] = rawLessons.map(
          (rawLesson, lessonIndex) => {
            const l = (
              rawLesson && typeof rawLesson === "object" ? rawLesson : {}
            ) as Record<string, unknown>;
            const lTitle =
              typeof l.title === "string" ? l.title.trim() : "";
            if (!lTitle) {
              errors.push(
                `Lesson ${lessonIndex + 1} in module "${modTitle || modIndex + 1}" requires a title.`,
              );
            }

            const status = validVideoStatuses.includes(
              l.videoStatus as VideoStatusValue,
            )
              ? (l.videoStatus as VideoStatusValue)
              : "NOT_UPLOADED";

            const bunnyVideoId =
              typeof l.bunnyVideoId === "string" && l.bunnyVideoId.trim()
                ? l.bunnyVideoId.trim()
                : null;

            const durationSeconds =
              typeof l.durationSeconds === "number" &&
              Number.isFinite(l.durationSeconds) &&
              l.durationSeconds > 0
                ? Math.round(l.durationSeconds)
                : null;

            let lessonId: number | undefined;
            if (l.id !== undefined && l.id !== null) {
              const parsedLessonId = parsePositiveIntId(l.id);
              if (parsedLessonId === null) {
                errors.push(
                  `Lesson ${lessonIndex + 1} in module "${modTitle || modIndex + 1}" has an invalid ID.`,
                );
              } else {
                lessonId = parsedLessonId;
              }
            }

            return {
              id: lessonId,
              title: lTitle,
              description:
                typeof l.description === "string"
                  ? l.description.trim() || null
                  : null,
              sortOrder: lessonIndex,
              durationSeconds,
              isPreview: Boolean(l.isPreview),
              bunnyVideoId,
              videoStatus: status,
            };
          },
        );

        let modId: number | undefined;
        if (mod.id !== undefined && mod.id !== null) {
          const parsedModId = parsePositiveIntId(mod.id);
          if (parsedModId === null) {
            errors.push(`Module ${modIndex + 1} has an invalid ID.`);
          } else {
            modId = parsedModId;
          }
        }

        return {
          id: modId,
          title: modTitle,
          sortOrder: modIndex,
          lessons,
        };
      })
    : undefined;

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const sanitizedLearningPoints = Array.isArray(learningPoints)
    ? learningPoints
        .filter((point): point is string => typeof point === "string")
        .map((point) => point.trim())
        .filter((point) => point.length > 0)
    : [];

  return {
    success: true,
    data: {
      courseCode,
      title,
      description,
      imageUrl,
      duration,
      durationDays,
      price,
      learningPoints: sanitizedLearningPoints,
      modules: sanitizedModules,
    },
  };
}
