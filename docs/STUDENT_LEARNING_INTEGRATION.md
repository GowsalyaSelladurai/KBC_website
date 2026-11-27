# Student Learning Module — Integration Readiness Guide

**Project:** KBC Salon Academy (`F:\KBC`)  
**Stack:** Next.js 14 (App Router), TypeScript, Prisma, PostgreSQL, Bunny Stream  
**Status:** Independent Student Learning Module Complete (Pre-Integration / Development Boundary)

---

## 1. Current Architecture

The student-side module is isolated from authentication, payment, and enrollment tables so it can integrate cleanly once the colleague's module is ready:

- **Public Course Pages**
  - `src/app/(site)/courses/page.tsx` — Server Component listing `PUBLISHED` courses via Prisma.
  - `src/app/(site)/courses/[id]/page.tsx` — Server Component displaying course details, `CourseLearningPoint` outcomes, grouped curriculum, `<EnrollButton />`, and `<PublicCurriculumPreview />`.
  - `src/components/PublicCurriculumPreview.tsx` — Client modal calling the free-preview API.
- **Student Learning UI**
  - `src/app/(site)/learn/[courseId]/page.tsx` — Server Component validating `status === "PUBLISHED"` and rendering `<CourseLearningWorkspace />`.
  - `src/components/learning/CourseLearningWorkspace.tsx` — Client workspace managing progression, lesson selection, playback requests, completion, and navigation.
  - `src/components/learning/StudentVideoPlayer.tsx` — Renders the server-authorized Bunny embed `<iframe>` with no download links or autoplay.
  - `src/components/learning/CurriculumSidebar.tsx` — Module/lesson sidebar reflecting backend lock/completion/readiness state.
  - `src/lib/learning/devStudentSession.ts` — Isolated temporary `studentKey` helper (`localStorage` key `kbc_dev_student_key`, default `"dev-student-kbc"`).
- **Learning Backend**
  - `src/lib/learning/accessBoundary.ts` — Centralized `verifyCourseLearningAccess()` boundary and `validateIdentifier()`.
  - `src/lib/learning/progression.ts` — `getCourseProgression()`, `completeLessonForStudent()` (with `pg_advisory_xact_lock`), and `getLessonPlaybackForStudent()`.
  - `src/lib/bunny.ts` — Server-side `getBunnyConfig()`, `getBunnyEmbedUrl()`, and `getAuthorizedBunnyPlayback()`.

---

## 2. Current Student-Side Scope

Implemented:
- Public course listing and detail pages (no public REST JSON endpoint; rendered via Server Components).
- Free-preview video endpoint for `isPreview: true` + `READY` lessons in `PUBLISHED` courses.
- `LessonProgress` table in PostgreSQL (`prisma/schema.prisma`).
- Sequential lesson unlocking across the full curriculum (unavailable lessons block later lessons).
- Concurrency-safe, idempotent lesson completion.
- Protected playback authorization endpoint.
- Responsive student learning workspace at `/learn/[courseId]`.

Not implemented (colleague's scope):
- User/Student authentication and session management.
- Enrollment creation, expiry, cancellation, and payment verification.
- Student dashboard (`/student` and `/watch/[id]` placeholders remain untouched).
- Bunny Stream Token Authentication (`BUNNY_STREAM_TOKEN_SECURITY_KEY` is not configured).

---

## 3. Existing API Contracts

### 3.1 `GET /api/courses/[id]/lessons/[lessonId]/preview`
- **File:** `src/app/api/courses/[id]/lessons/[lessonId]/preview/route.ts`
- **Auth:** Public (no `studentKey` required).
- **Checks:** Course `status === "PUBLISHED"`, lesson belongs to course, `lesson.isPreview === true`, `lesson.videoStatus === "READY"`, non-empty `lesson.bunnyVideoId`.
- **Responses:**
  - `200`: `{ lessonId: string, title: string, embedUrl: string }`
  - `403`: `{ error: "Preview is not available for this lesson" }`
  - `404`: `{ error: "Lesson not found" }`
  - `409`: `{ error: "Preview video is not ready" }`

### 3.2 `GET /api/learning/courses/[id]/progress`
- **File:** `src/app/api/learning/courses/[id]/progress/route.ts`
- **Query Params:** `studentKey` *(temporary development field; will be removed during integration)*.
- **Responses:**
  - `200`: `{ courseId, courseTitle, studentKey, modules, currentUnlockableLesson, summary, accessMode }`
  - `400`: `{ error, reason: "INVALID_INPUT" }`
  - `404`: `{ error, reason: "COURSE_UNAVAILABLE" }`

### 3.3 `GET /api/learning/courses/[id]/next-lesson`
- **File:** `src/app/api/learning/courses/[id]/next-lesson/route.ts`
- **Query Params:** `studentKey` *(temporary development field)*.
- **Responses:**
  - `200`: `{ courseId, courseTitle, studentKey, nextLesson, summary, accessMode }`
  - `400` / `404`: Same boundary errors as `progress`.

### 3.4 `POST /api/learning/courses/[id]/lessons/[lessonId]/complete`
- **File:** `src/app/api/learning/courses/[id]/lessons/[lessonId]/complete/route.ts`
- **Body:** `{ studentKey: string }` *(temporary development field; client video IDs or embed URLs are ignored)*.
- **Responses:**
  - `200`: `{ alreadyCompleted: boolean, completedLesson, nextUnlockableLesson, summary, accessMode }`
  - `400`: Invalid `lessonId`, invalid JSON, or invalid `studentKey`.
  - `403`: Previous lesson incomplete (`"Previous lesson must be completed before completing this lesson."`).
  - `404`: Published course or lesson in course not found.
  - `409`: Lesson video not `READY` or missing `bunnyVideoId`.

### 3.5 `GET /api/learning/courses/[id]/lessons/[lessonId]/playback`
- **File:** `src/app/api/learning/courses/[id]/lessons/[lessonId]/playback/route.ts`
- **Query Params:** `studentKey` *(temporary development field)*.
- **Responses:**
  - `200`: `{ courseId, courseTitle, studentKey, lesson, playback: { embedUrl, tokenProtected, expiresAt, securityNote }, accessMode }`
  - `400`: Invalid `lessonId`, `courseId`, or `studentKey`.
  - `403`: Lesson is locked (`"This lesson is locked. Complete preceding lessons first."`).
  - `404`: Published course or lesson in course not found.
  - `409`: Lesson video not `READY` or missing `bunnyVideoId`.

> **Note on Public Listing & Detail:** `/courses` and `/courses/[id]` are Next.js Server Components querying Prisma directly (there are no separate public `/api/courses` JSON endpoints).

---

## 4. Current Development Identity Mechanism

- `src/lib/learning/devStudentSession.ts` exports `getDevStudentKey()`, which reads/persists `"dev-student-kbc"` in `window.localStorage` under `kbc_dev_student_key`.
- All four learning APIs currently accept `studentKey` from the request (`searchParams` or JSON body) and validate only its string format (`^[A-Za-z0-9._:@-]+$`, length `1..128`).
- **Warning:** `studentKey` is **not authenticated**. Any caller can pass an arbitrary `studentKey` in development mode.

---

## 5. Authentication Integration Contract

When integrating the colleague's authentication module:

1. **Derive identity server-side:** Read the authenticated student/user ID from the server session/JWT inside `verifyCourseLearningAccess()` (or pass `NextRequest` / server session context into it).
2. **Stop trusting client `studentKey`:**
   - Remove `studentKey` query parameters and body fields from `CourseLearningWorkspace.tsx` and the 4 learning API routes.
   - Delete or replace `src/lib/learning/devStudentSession.ts`.
3. **Unauthenticated requests:** Return `401` with `{ error: "Authentication required.", reason: "UNAUTHENTICATED" }`.

---

## 6. Enrollment & Payment Verification Contract

`src/lib/learning/accessBoundary.ts` already defines `AccessDenialReason`:
- `"UNAUTHENTICATED"` → HTTP `401`
- `"NOT_ENROLLED"` → HTTP `403`
- `"PAYMENT_REQUIRED"` → HTTP `403`
- `"ENROLLMENT_EXPIRED"` → HTTP `403`
- `"ENROLLMENT_CANCELLED"` → HTTP `403`
- `"COURSE_UNAVAILABLE"` → HTTP `404`

Inside `verifyCourseLearningAccess()`:
1. Authenticate student (`401` if missing/invalid).
2. Verify `Course.status === "PUBLISHED"` (`404` if not).
3. Query colleague's enrollment/payment records for `(authenticatedStudentId, courseId)`:
   - Must exist (`NOT_ENROLLED`), be active (`ENROLLMENT_CANCELLED` / `ENROLLMENT_EXPIRED`), and have confirmed payment where `Course.price > 0` (`PAYMENT_REQUIRED`).
4. Return `{ allowed: true, mode: "authenticated-enrolled", studentKey: authenticatedStudentId, courseId, warning: "" }`.

Also add the same server-side enrollment check to `src/app/(site)/learn/[courseId]/page.tsx` so unauthenticated or unenrolled users are redirected or shown an enrollment-required view before rendering `<CourseLearningWorkspace />`.

---

## 7. Progress Data Migration Considerations

In `prisma/schema.prisma`, `LessonProgress` stores:
- `studentKey String`
- `courseId String` (FK → `Course.id`, `onDelete: Cascade`)
- `lessonId String` (FK → `Lesson.id`, `onDelete: Cascade`)
- `@@unique([studentKey, courseId, lessonId])`

**Compatibility:**
- `studentKey` is a `String` (`1..128` chars), compatible with `cuid()`, UUIDs, or numeric IDs serialized as strings.
- **No schema migration is strictly required** for initial integration if `LessonProgress.studentKey` stores the authenticated `studentId`/`userId` string.
- **Development progress:** Existing `dev-student-kbc` / test `studentKey` rows should be discarded (or explicitly mapped if any real tester progress needs to be kept) before production launch.
- **Optional future hardening:** Once the colleague's `User`/`Student` model exists, an optional foreign key from `LessonProgress.studentKey` (or a renamed `studentId` column) to that model can be added in a future migration.

---

## 8. Protected Playback Contract

- `GET /api/learning/courses/[id]/lessons/[lessonId]/playback` never exposes `bunnyVideoId`, `pendingVideoId`, `BUNNY_STREAM_API_KEY`, or `BUNNY_STREAM_TOKEN_SECURITY_KEY`.
- **Current limitation:** `BUNNY_STREAM_TOKEN_SECURITY_KEY` is not configured in `.env`, so `getAuthorizedBunnyPlayback()` returns `tokenProtected: false` and an unsigned Bunny embed URL.
- **Post-integration hardening:** Enable Bunny Stream Token Authentication in Bunny dashboard, add `BUNNY_STREAM_TOKEN_SECURITY_KEY` to `.env`, and generate time-limited SHA-256 signed embed URLs inside `getAuthorizedBunnyPlayback()`.

---

## 9. Course & Lesson Data Requirements

- Course must have `status === "PUBLISHED"`.
- Modules and lessons are ordered deterministically by `[{ sortOrder: "asc" }, { createdAt: "asc" }]`.
- Only lessons with `videoStatus === "READY"` and non-empty `bunnyVideoId` can be played or completed.
- Non-`READY` lessons remain visible in the curriculum and **block** all subsequent lessons.

---

## 10. Expected Integration Dependencies

From the colleague's module, we need:
1. A server-side helper to resolve the currently authenticated student ID from a Next.js request/cookies (e.g., `getAuthenticatedStudent(request)`).
2. A server-side helper or Prisma query to check active enrollment + payment status + expiry for `(studentId, courseId)`.
3. Route alignment between colleague's `/student` dashboard, `/watch/[id]` placeholder, and `/learn/[courseId]`, plus wiring `<EnrollButton />` on `/courses/[id]` to the real checkout/enrollment flow.

---

## 11. Recommended Integration Sequence

1. Plug colleague's auth + enrollment check into `verifyCourseLearningAccess()` in `src/lib/learning/accessBoundary.ts`.
2. Update `progress`, `next-lesson`, `complete`, and `playback` routes to read student identity from the verified access result instead of `studentKey` request params/body.
3. Add server-side auth/enrollment guard to `src/app/(site)/learn/[courseId]/page.tsx` and remove `devStudentSession.ts` / `studentKey` params from `CourseLearningWorkspace.tsx`.
4. Link colleague's `/student` dashboard "Continue Learning" action to `/learn/[courseId]` (and retire/redirect the `/watch/[id]` placeholder).
5. Wire `<EnrollButton />` to colleague's payment/enrollment flow.
6. Enable Bunny Stream Token Authentication in `src/lib/bunny.ts`.

---

## 12. Integration Risks (Prioritized)

| Severity | Risk | Detail & Mitigation |
| --- | --- | --- |
| **High** | **Unauthenticated `studentKey` if not removed** | Leaving `studentKey` query/body params active after launch would allow spoofing. Remove client `studentKey` inputs in all 4 learning routes during integration. |
| **High** | **Missing Bunny Token Authentication** | Without `BUNNY_STREAM_TOKEN_SECURITY_KEY`, embed URLs are unsigned (`tokenProtected: false`). Enable Bunny Token Auth before production. |
| **Medium** | **API error format differences** | Learning APIs return `{ error, reason? }`, while older admin routes return `{ message, errors? }`. Align client error handling if colleague's auth wrapper uses a different error shape. |
| **Medium** | **Route conflict (`/watch/[id]` vs `/learn/[courseId]`)** | `src/app/(site)/watch/[id]/page.tsx` is a placeholder ("No active enrollment found"). Decide whether `/student` links to `/learn/[courseId]` or `/watch/[id]` redirects. |
| **Medium** | **Unpublished / modified courses after enrollment** | If an admin unpublishes a course or changes a lesson to `PROCESSING`, `loadOrderedPublishedCourse()` returns `404` or `VIDEO_NOT_READY`. Existing `LessonProgress` rows remain preserved. |
| **Low** | **Cross-course constraint in code only** | `LessonProgress` enforces `courseId` matching `Lesson.module.courseId` in application code rather than a composite DB FK. |
| **Low** | **Broken initial migration on shadow DB** | `20261124100044_init_courses/migration.sql` has a pre-existing syntax error on line 1; use `prisma migrate diff` + `prisma migrate deploy` or `prisma/bootstrap_clean_db.sql` for fresh DBs. |

---

## 13. Integration Testing Checklist (Post-Integration)

1. Authenticated & actively enrolled student can load `/learn/[courseId]`, `progress`, `next-lesson`, `playback`, and `complete`.
2. Unauthenticated request to `/learn/[courseId]` and all learning APIs is rejected (`401` / redirect to `/login`).
3. Authenticated student **not** enrolled in the course is rejected (`403`, `NOT_ENROLLED`).
4. Authenticated student with pending/failed payment is rejected (`403`, `PAYMENT_REQUIRED`).
5. Authenticated student with expired or cancelled enrollment is rejected (`403`, `ENROLLMENT_EXPIRED` / `ENROLLMENT_CANCELLED`).
6. Spoofed `studentKey` in query/body is ignored; server uses session student ID only.
7. Two different authenticated students have completely isolated `LessonProgress` on the same course.
8. Sequential unlocking, unavailable-lesson blocking, `pg_advisory_xact_lock` concurrency, free preview, and admin APIs continue passing.

---

## 14. Known Limitations

- Temporary `studentKey` (`dev-student-kbc`) is unauthenticated.
- Bunny Stream Token Authentication is not configured (`tokenProtected: false`).
- Interactive browser tests could not be run in this environment because Chrome remote debugging (`DevToolsActivePort`) and Playwright/Puppeteer were unavailable.
