import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const RUN_ID = `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const createdCourseIds = [];

async function createTestCourse({
  status = "PUBLISHED",
  lessons,
}) {
  const course = await prisma.course.create({
    data: {
      courseCode: `TEST-${RUN_ID}-${createdCourseIds.length + 1}`,
      title: `Test Course ${createdCourseIds.length + 1}`,
      price: 1000,
      status,
      modules: {
        create: [
          {
            title: "Module 1",
            sortOrder: 0,
            lessons: {
              create: lessons.map((l, idx) => ({
                title: l.title,
                sortOrder: idx,
                videoStatus: l.videoStatus,
                bunnyVideoId: l.bunnyVideoId ?? null,
                isPreview: l.isPreview ?? false,
              })),
            },
          },
        ],
      },
    },
    include: {
      modules: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  createdCourseIds.push(course.id);
  return {
    course,
    lessons: course.modules[0].lessons,
  };
}

test.after(async () => {
  if (createdCourseIds.length > 0) {
    await prisma.course.deleteMany({
      where: { id: { in: createdCourseIds } },
    });
  }
  await prisma.$disconnect();
});

test("1-5, 9, 11: Sequential unlocking, blocking unavailable lessons, READY transition, and idempotency", async () => {
  const studentKey = `student-${RUN_ID}-seq`;
  const { course, lessons } = await createTestCourse({
    status: "PUBLISHED",
    lessons: [
      { title: "L1", videoStatus: "READY", bunnyVideoId: "vid-1", isPreview: true },
      { title: "L2", videoStatus: "PROCESSING", bunnyVideoId: "vid-2", isPreview: false },
      { title: "L3", videoStatus: "READY", bunnyVideoId: "vid-3", isPreview: true },
    ],
  });
  const [l1, l2, l3] = lessons;

  // Case 1: First lesson READY -> unlocked, L2 unavailable, L3 locked
  let res = await fetch(`${BASE_URL}/api/learning/courses/${course.id}/progress?studentKey=${studentKey}`);
  assert.equal(res.status, 200);
  let data = await res.json();
  let flat = data.modules.flatMap((m) => m.lessons);
  assert.equal(flat[0].isUnlocked, true);
  assert.equal(flat[1].isUnlocked, false);
  assert.equal(flat[1].lockedReason, "VIDEO_NOT_READY");
  assert.equal(flat[2].isUnlocked, false);
  assert.equal(flat[2].lockedReason, "PREVIOUS_LESSON_INCOMPLETE");
  assert.equal(data.currentUnlockableLesson.id, l1.id);

  // Case 6: Out-of-order L3 completion rejected
  res = await fetch(`${BASE_URL}/api/learning/courses/${course.id}/lessons/${l3.id}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentKey }),
  });
  assert.equal(res.status, 403);

  // Case 3: Complete L1 -> L3 MUST remain locked because L2 is PROCESSING and incomplete
  res = await fetch(`${BASE_URL}/api/learning/courses/${course.id}/lessons/${l1.id}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentKey }),
  });
  assert.equal(res.status, 200);
  const c1 = await res.json();
  assert.equal(c1.alreadyCompleted, false);
  assert.equal(c1.nextUnlockableLesson, null);

  res = await fetch(`${BASE_URL}/api/learning/courses/${course.id}/progress?studentKey=${studentKey}`);
  data = await res.json();
  flat = data.modules.flatMap((m) => m.lessons);
  assert.equal(flat[0].isCompleted, true);
  assert.equal(flat[1].isUnlocked, false);
  assert.equal(flat[1].lockedReason, "VIDEO_NOT_READY");
  assert.equal(flat[2].isUnlocked, false);
  assert.equal(flat[2].lockedReason, "PREVIOUS_LESSON_INCOMPLETE");

  // Case 9: Duplicate completion of L1 is idempotent and preserves completedAt
  res = await fetch(`${BASE_URL}/api/learning/courses/${course.id}/lessons/${l1.id}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentKey }),
  });
  assert.equal(res.status, 200);
  const c1dup = await res.json();
  assert.equal(c1dup.alreadyCompleted, true);
  assert.equal(c1dup.completedLesson.completedAt, c1.completedLesson.completedAt);

  // Case 4: L2 becomes READY -> unlocks because L1 is completed, while L3 stays locked
  await prisma.lesson.update({
    where: { id: l2.id },
    data: { videoStatus: "READY" },
  });
  res = await fetch(`${BASE_URL}/api/learning/courses/${course.id}/progress?studentKey=${studentKey}`);
  data = await res.json();
  flat = data.modules.flatMap((m) => m.lessons);
  assert.equal(flat[1].isUnlocked, true);
  assert.equal(flat[2].isUnlocked, false);
  assert.equal(data.currentUnlockableLesson.id, l2.id);

  // Case 5: Completing L2 unlocks L3
  res = await fetch(`${BASE_URL}/api/learning/courses/${course.id}/lessons/${l2.id}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentKey }),
  });
  assert.equal(res.status, 200);
  const c2 = await res.json();
  assert.equal(c2.nextUnlockableLesson.id, l3.id);

  // Case 11: Even if L1 status changes later, existing L1 completion remains intact
  await prisma.lesson.update({
    where: { id: l1.id },
    data: { videoStatus: "PROCESSING" },
  });
  res = await fetch(`${BASE_URL}/api/learning/courses/${course.id}/progress?studentKey=${studentKey}`);
  data = await res.json();
  flat = data.modules.flatMap((m) => m.lessons);
  assert.equal(flat[0].isCompleted, true);
  assert.equal(flat[0].completedAt, c1.completedLesson.completedAt);
});

test("2: First lesson PROCESSING keeps later READY lessons locked", async () => {
  const studentKey = `student-${RUN_ID}-firstproc`;
  const { course } = await createTestCourse({
    status: "PUBLISHED",
    lessons: [
      { title: "L1", videoStatus: "PROCESSING", bunnyVideoId: "vid-1" },
      { title: "L2", videoStatus: "READY", bunnyVideoId: "vid-2" },
    ],
  });

  const res = await fetch(`${BASE_URL}/api/learning/courses/${course.id}/progress?studentKey=${studentKey}`);
  assert.equal(res.status, 200);
  const data = await res.json();
  const flat = data.modules.flatMap((m) => m.lessons);
  assert.equal(flat[0].isUnlocked, false);
  assert.equal(flat[0].lockedReason, "VIDEO_NOT_READY");
  assert.equal(flat[1].isUnlocked, false);
  assert.equal(flat[1].lockedReason, "PREVIOUS_LESSON_INCOMPLETE");
  assert.equal(data.currentUnlockableLesson, null);
});

test("7-8: Cross-course lesson and draft course rejected", async () => {
  const studentKey = `student-${RUN_ID}-cross`;
  const pub = await createTestCourse({
    status: "PUBLISHED",
    lessons: [{ title: "L1", videoStatus: "READY", bunnyVideoId: "vid-1" }],
  });
  const other = await createTestCourse({
    status: "PUBLISHED",
    lessons: [{ title: "Other L1", videoStatus: "READY", bunnyVideoId: "vid-other" }],
  });
  const draft = await createTestCourse({
    status: "DRAFT",
    lessons: [{ title: "Draft L1", videoStatus: "READY", bunnyVideoId: "vid-draft" }],
  });

  const crossRes = await fetch(
    `${BASE_URL}/api/learning/courses/${pub.course.id}/lessons/${other.lessons[0].id}/complete`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentKey }),
    },
  );
  assert.equal(crossRes.status, 404);

  const draftRes = await fetch(
    `${BASE_URL}/api/learning/courses/${draft.course.id}/progress?studentKey=${studentKey}`,
  );
  assert.equal(draftRes.status, 404);
});

test("10: Concurrent completion attempts for same & adjacent lessons serialize safely", async () => {
  const studentKey = `student-${RUN_ID}-conc`;
  const { course, lessons } = await createTestCourse({
    status: "PUBLISHED",
    lessons: [
      { title: "L1", videoStatus: "READY", bunnyVideoId: "vid-1" },
      { title: "L2", videoStatus: "READY", bunnyVideoId: "vid-2" },
    ],
  });
  const [l1, l2] = lessons;

  // Fire duplicate L1 requests and an out-of-order L2 request simultaneously
  const [r1a, r1b, r2] = await Promise.all([
    fetch(`${BASE_URL}/api/learning/courses/${course.id}/lessons/${l1.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentKey }),
    }),
    fetch(`${BASE_URL}/api/learning/courses/${course.id}/lessons/${l1.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentKey }),
    }),
    fetch(`${BASE_URL}/api/learning/courses/${course.id}/lessons/${l2.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentKey }),
    }),
  ]);

  assert.equal(r1a.status, 200);
  assert.equal(r1b.status, 200);
  const b1a = await r1a.json();
  const b1b = await r1b.json();
  // Exactly one should be initial completion and the other idempotent
  assert.notEqual(b1a.alreadyCompleted, b1b.alreadyCompleted);

  const rows = await prisma.lessonProgress.count({
    where: { studentKey, courseId: course.id },
  });
  // Either r2 ran before L1 (403 -> 1 row) or serialized after L1 committed (200 -> 2 rows),
  // but never duplicate rows and never L2 completed without L1.
  if (r2.status === 403) {
    assert.equal(rows, 1);
  } else {
    assert.equal(r2.status, 200);
    assert.equal(rows, 2);
  }
});

test("12-13: Existing free-preview API and admin courses API remain unaffected", async () => {
  const { course, lessons } = await createTestCourse({
    status: "PUBLISHED",
    lessons: [
      { title: "Preview", videoStatus: "READY", bunnyVideoId: "vid-prev", isPreview: true },
      { title: "Paid", videoStatus: "READY", bunnyVideoId: "vid-paid", isPreview: false },
    ],
  });

  const previewOk = await fetch(
    `${BASE_URL}/api/courses/${course.id}/lessons/${lessons[0].id}/preview`,
  );
  assert.equal(previewOk.status, 200);
  const previewData = await previewOk.json();
  assert.ok(previewData.embedUrl.includes("vid-prev"));

  const previewDenied = await fetch(
    `${BASE_URL}/api/courses/${course.id}/lessons/${lessons[1].id}/preview`,
  );
  assert.equal(previewDenied.status, 403);

  const adminRes = await fetch(`${BASE_URL}/api/admin/courses`);
  assert.equal(adminRes.status, 200);
});

test("Phase 7 (1-9, 14-15): Protected playback authorization, unlocking, readiness, and secret safety", async () => {
  const studentKey = `student-${RUN_ID}-playback`;
  const { course, lessons } = await createTestCourse({
    status: "PUBLISHED",
    lessons: [
      { title: "Ready L1", videoStatus: "READY", bunnyVideoId: "vid-play-1", isPreview: false },
      { title: "Ready L2", videoStatus: "READY", bunnyVideoId: "vid-play-2", isPreview: true },
      { title: "Proc L3", videoStatus: "PROCESSING", bunnyVideoId: "vid-play-3", isPreview: false },
      { title: "NoId L4", videoStatus: "READY", bunnyVideoId: null, isPreview: false },
    ],
  });
  const [l1, l2, l3, l4] = lessons;

  const otherCourse = await createTestCourse({
    status: "PUBLISHED",
    lessons: [{ title: "Other L1", videoStatus: "READY", bunnyVideoId: "vid-other-p" }],
  });
  const draftCourse = await createTestCourse({
    status: "DRAFT",
    lessons: [{ title: "Draft L1", videoStatus: "READY", bunnyVideoId: "vid-draft-p" }],
  });

  // 1, 14, 15: First lesson playback allowed when unlocked; ignores client-supplied bunnyVideoId/embedUrl; never leaks API keys
  let res = await fetch(
    `${BASE_URL}/api/learning/courses/${course.id}/lessons/${l1.id}/playback?studentKey=${studentKey}&bunnyVideoId=evil-id&embedUrl=https://evil.example/embed`,
  );
  assert.equal(res.status, 200);
  const rawBody = await res.text();
  const p1 = JSON.parse(rawBody);
  assert.equal(p1.lesson.id, l1.id);
  assert.ok(p1.playback.embedUrl.includes("vid-play-1"));
  assert.ok(!p1.playback.embedUrl.includes("evil-id"));
  assert.ok(!p1.playback.embedUrl.includes("evil.example"));
  assert.equal(p1.playback.tokenProtected, false);
  assert.equal(p1.lesson.bunnyVideoId, undefined);
  assert.ok(!rawBody.includes(process.env.BUNNY_STREAM_API_KEY || "__NEVER_EMPTY__"));

  // 2: Locked second lesson playback rejected (even though isPreview: true)
  res = await fetch(
    `${BASE_URL}/api/learning/courses/${course.id}/lessons/${l2.id}/playback?studentKey=${studentKey}`,
  );
  assert.equal(res.status, 403);

  // 3 & 4: Completing L1 unlocks L2, then L2 playback is allowed
  res = await fetch(`${BASE_URL}/api/learning/courses/${course.id}/lessons/${l1.id}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentKey, bunnyVideoId: "evil-id", embedUrl: "https://evil.example" }),
  });
  assert.equal(res.status, 200);

  res = await fetch(
    `${BASE_URL}/api/learning/courses/${course.id}/lessons/${l2.id}/playback?studentKey=${studentKey}`,
  );
  assert.equal(res.status, 200);
  const p2 = await res.json();
  assert.ok(p2.playback.embedUrl.includes("vid-play-2"));

  // 6: Cross-course lesson playback rejected
  res = await fetch(
    `${BASE_URL}/api/learning/courses/${course.id}/lessons/${otherCourse.lessons[0].id}/playback?studentKey=${studentKey}`,
  );
  assert.equal(res.status, 404);

  // 7: Unpublished course playback rejected
  res = await fetch(
    `${BASE_URL}/api/learning/courses/${draftCourse.course.id}/lessons/${draftCourse.lessons[0].id}/playback?studentKey=${studentKey}`,
  );
  assert.equal(res.status, 404);

  // 8: PROCESSING video playback rejected
  res = await fetch(
    `${BASE_URL}/api/learning/courses/${course.id}/lessons/${l3.id}/playback?studentKey=${studentKey}`,
  );
  assert.equal(res.status, 409);

  // 9: READY lesson with missing bunnyVideoId rejected
  res = await fetch(
    `${BASE_URL}/api/learning/courses/${course.id}/lessons/${l4.id}/playback?studentKey=${studentKey}`,
  );
  assert.equal(res.status, 409);
});
