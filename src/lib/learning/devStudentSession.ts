/**
 * Temporary development-only student identity adapter.
 *
 * Integration note:
 * Replace `getDevStudentKey()` with the authenticated student ID from the
 * session/auth provider once the colleague's authentication and enrollment
 * module is integrated.
 */
const DEV_STUDENT_STORAGE_KEY = "kbc_dev_student_key";
const DEFAULT_DEV_STUDENT_KEY = "dev-student-kbc";

export function getDevStudentKey(): string {
  if (typeof window === "undefined") {
    return DEFAULT_DEV_STUDENT_KEY;
  }

  try {
    const existing = window.localStorage.getItem(DEV_STUDENT_STORAGE_KEY);
    if (existing && /^[A-Za-z0-9._:@-]+$/.test(existing)) {
      return existing;
    }
    window.localStorage.setItem(
      DEV_STUDENT_STORAGE_KEY,
      DEFAULT_DEV_STUDENT_KEY,
    );
    return DEFAULT_DEV_STUDENT_KEY;
  } catch {
    return DEFAULT_DEV_STUDENT_KEY;
  }
}
