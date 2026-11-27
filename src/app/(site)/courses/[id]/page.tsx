import Link from "next/link";
import { notFound } from "next/navigation";
import EnrollButton from "@/components/EnrollButton";
import PublicCurriculumPreview, {
  type PublicPreviewModule,
} from "@/components/PublicCurriculumPreview";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CourseDetail({
  params,
}: {
  params: { id: string };
}) {
  const courseId = /^\d+$/.test(params.id) ? Number(params.id) : Number.NaN;

  if (!Number.isSafeInteger(courseId) || courseId <= 0) {
    notFound();
  }

  const course = await prisma.course.findFirst({
    where: { id: courseId, status: "PUBLISHED" },
    select: {
      id: true,
      courseCode: true,
      title: true,
      description: true,
      imageUrl: true,
      durationDays: true,
      price: true,
      learningPoints: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          content: true,
        },
      },
      modules: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          title: true,
          lessons: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
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

  if (!course) notFound();

  const moduleCount = course.modules.length;
  const lessonCount = course.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0,
  );

  const previewModules: PublicPreviewModule[] = course.modules.map((mod) => ({
    id: String(mod.id),
    title: mod.title,
    lessons: mod.lessons.map((lesson) => ({
      id: String(lesson.id),
      title: lesson.title,
      description: lesson.description,
      durationSeconds: lesson.durationSeconds,
      canPreview: Boolean(
        lesson.isPreview &&
        lesson.videoStatus === "READY" &&
        lesson.bunnyVideoId,
      ),
    })),
  }));

  const freePreviewCount = previewModules.reduce(
    (sum, mod) => sum + mod.lessons.filter((l) => l.canPreview).length,
    0,
  );

  const durationLabel =
    course.durationDays === 1 ? "1 Day" : `${course.durationDays} Days`;

  return (
    <div className="wrap py-10">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-sm text-mute transition hover:text-gold"
      >
        ← Back to courses
      </Link>

      <div className="mt-5 grid items-start gap-8 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-8">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-[#262a2a] to-ink">
            {course.imageUrl ? (
              <img
                src={course.imageUrl}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-6xl text-gold/30">
                ✦
              </div>
            )}
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-mute">
                {durationLabel}
              </span>
              <span className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-mute">
                {moduleCount} {moduleCount === 1 ? "module" : "modules"}
              </span>
              <span className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-mute">
                {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
              </span>
              {freePreviewCount > 0 && (
                <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-medium text-gold">
                  {freePreviewCount} free{" "}
                  {freePreviewCount === 1 ? "preview" : "previews"}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold leading-tight md:text-4xl">
              {course.title}
            </h1>
            <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-mute">
              {course.description || "No course description provided."}
            </p>
          </div>

          {course.learningPoints.length > 0 && (
            <section className="card space-y-4">
              <h2 className="text-xl font-semibold text-white">
                What You Will Learn
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {course.learningPoints.map((point) => (
                  <li
                    key={point.id}
                    className="flex items-start gap-2.5 text-sm text-white/85"
                  >
                    <span className="mt-0.5 shrink-0 text-gold">✓</span>
                    <span>{point.content}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-semibold text-white">
                Course Curriculum
              </h2>
              <p className="text-xs text-mute">
                {moduleCount} {moduleCount === 1 ? "module" : "modules"} ·{" "}
                {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
              </p>
            </div>
            <PublicCurriculumPreview
              courseId={String(course.id)}
              modules={previewModules}
            />
          </section>
        </div>

        <aside className="card space-y-5 lg:sticky lg:top-24">
          <div>
            <p className="text-xs uppercase tracking-wider text-mute">
              Course Fee
            </p>
            <b className="mt-1 block font-serif text-3xl text-gold">
              ₹{Number(course.price).toLocaleString("en-IN")}
            </b>
          </div>

          <div className="space-y-2 border-y border-line py-4 text-sm text-mute">
            <div className="flex items-center justify-between">
              <span>Duration</span>
              <span className="text-white">
                {durationLabel}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Modules</span>
              <span className="text-white">{moduleCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Lessons</span>
              <span className="text-white">{lessonCount}</span>
            </div>
            {freePreviewCount > 0 && (
              <div className="flex items-center justify-between">
                <span>Free Previews</span>
                <span className="text-gold">{freePreviewCount} available</span>
              </div>
            )}
          </div>

          <EnrollButton
            course={{
              id: course.id,
              name: course.title,
              days: course.durationDays,
              price: Number(course.price),
            }}
          />
        </aside>
      </div>
    </div>
  );
}
