export type CreateCourseInput = {
  courseCode: string;
  title: string;
  description?: string;
  imageUrl?: string;
  duration?: string;
  price: number;
  learningPoints?: string[];
};

export type ValidationResult =
  | { success: true; data: CreateCourseInput }
  | { success: false; errors: string[] };

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
    typeof body.duration === "string" ? body.duration.trim() : undefined;

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

  if (body.imageUrl !== undefined && typeof body.imageUrl !== "string") {
    errors.push("Image URL must be a string.");
  }

  if (body.duration !== undefined && typeof body.duration !== "string") {
    errors.push("Duration must be a string.");
  }

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
      price,
      learningPoints: sanitizedLearningPoints,
    },
  };
}
