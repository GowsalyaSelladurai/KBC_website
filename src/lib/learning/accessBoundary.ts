import { prisma } from "@/lib/prisma";

export type LearningValidationError = {
  valid: false;
  status: number;
  error: string;
};

export type AccessDenialReason =
  | "INVALID_INPUT"
  | "UNAUTHENTICATED"
  | "NOT_ENROLLED"
  | "PAYMENT_REQUIRED"
  | "ENROLLMENT_EXPIRED"
  | "ENROLLMENT_CANCELLED"
  | "COURSE_UNAVAILABLE";

export type CourseAccessCheckResult =
  | {
      allowed: true;
      mode: "development-unauthenticated" | "authenticated-enrolled";
      studentKey: string;
      courseId: string;
      warning: string;
    }
  | {
      allowed: false;
      status: number;
      reason: AccessDenialReason;
      error: string;
    };

/**
 * Integration boundary interface for future authentication, payment, and
 * enrollment verification (handled by the colleague's module).
 *
 * Integration contract when colleague's module is ready:
 * 1. Extract and verify authenticated student identity from session/JWT
 *    (return `401` with `reason: "UNAUTHENTICATED"` if missing/invalid).
 * 2. Verify active course enrollment and verified payment status
 *    (return `403` with `NOT_ENROLLED`, `PAYMENT_REQUIRED`,
 *     `ENROLLMENT_EXPIRED`, or `ENROLLMENT_CANCELLED` as applicable).
 * 3. Verify course availability (`PUBLISHED`).
 * 4. Return `{ allowed: true, mode: "authenticated-enrolled", studentKey: authenticatedStudentId, courseId, warning: "" }`.
 */
export type CourseAccessVerifier = (params: {
  studentKey: unknown;
  courseId: unknown;
}) => Promise<CourseAccessCheckResult>;

const SAFE_ID_REGEX = /^[A-Za-z0-9._:@-]+$/;

export function validateIdentifier(
  raw: unknown,
  label: string,
): { valid: true; value: string } | LearningValidationError {
  if (typeof raw !== "string") {
    return {
      valid: false,
      status: 400,
      error: `${label} must be a non-empty string.`,
    };
  }

  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 128 || !SAFE_ID_REGEX.test(trimmed)) {
    return {
      valid: false,
      status: 400,
      error: `${label} is invalid.`,
    };
  }

  return { valid: true, value: trimmed };
}

/**
 * Current Step 2 boundary implementation:
 * - Validates `studentKey` and `courseId` formats.
 * - Verifies that the target course exists and is PUBLISHED.
 * - Does NOT authenticate the student or verify enrollment/payment yet.
 */
export const verifyCourseLearningAccess: CourseAccessVerifier = async ({
  studentKey,
  courseId,
}) => {
  const studentCheck = validateIdentifier(studentKey, "studentKey");
  if (studentCheck.valid === false) {
    return {
      allowed: false,
      status: studentCheck.status,
      reason: "INVALID_INPUT",
      error: studentCheck.error,
    };
  }

  const courseCheck = validateIdentifier(courseId, "courseId");
  if (courseCheck.valid === false) {
    return {
      allowed: false,
      status: courseCheck.status,
      reason: "INVALID_INPUT",
      error: courseCheck.error,
    };
  }

  const course = await prisma.course.findFirst({
    where: {
      id: courseCheck.value,
      status: "PUBLISHED",
    },
    select: { id: true },
  });

  if (!course) {
    return {
      allowed: false,
      status: 404,
      reason: "COURSE_UNAVAILABLE",
      error: "Published course not found.",
    };
  }

  return {
    allowed: true,
    mode: "development-unauthenticated",
    studentKey: studentCheck.value,
    courseId: courseCheck.value,
    warning:
      "Development boundary only: studentKey is unauthenticated and enrollment is not verified.",
  };
};
