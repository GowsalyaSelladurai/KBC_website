import Link from "next/link";
import CourseBrowser from "@/components/CourseBrowser";
import type { PublicCourse } from "@/components/CourseCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const steps = [
  ["Choose a course plan", "Select a course tailored to your beauty goals."],
  ["Enroll online or via staff", "Reach out to academy staff or enroll when enabled."],
  ["Get your credentials", "Access is granted for your enrolled course."],
  ["Learn within your timeline", "Follow structured modules and video lessons."],
];

const feats = [
  ["🔒", "One device only", "Videos play on a single device per student."],
  ["⏱", "Timed access", "Access runs for the course plan duration."],
  ["🔓", "Sequential unlock", "Structured modules and lessons."],
  ["🛡", "Protected playback", "Hosted securely on Bunny Stream CDN."],
  ["🎥", "Live classes", "Scheduled academy sessions."],
];

export default async function Home() {
  const dbCourses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      modules: {
        include: {
          _count: { select: { lessons: true } },
        },
      },
    },
  });

  const courses: PublicCourse[] = dbCourses.map((c) => ({
    id: c.id,
    courseCode: c.courseCode,
    title: c.title,
    description: c.description,
    imageUrl: c.imageUrl,
    duration: c.duration,
    price: Number(c.price),
    lessonCount: c.modules.reduce((sum, m) => sum + m._count.lessons, 0),
  }));

  return (
    <>
      <section className="bg-[radial-gradient(circle_at_80%_20%,rgba(239,232,168,.14),transparent_50%)] py-16">
        <div className="wrap grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="tag mb-4 border border-gold">
              Now online · Beauty &amp; makeover classes
            </span>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Learn the art of <span className="text-gold">beauty</span>,
              wherever you are
            </h1>
            <p className="my-4 text-mute">
              Professional makeup, hair styling, nail art and more — taught by
              Kavya’s expert team.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/courses" className="btn">
                Browse Courses
              </Link>
              <Link href="/login" className="btn-o">
                Student Login
              </Link>
            </div>
          </div>
          <div className="mx-auto grid aspect-square w-full max-w-xs place-items-center rounded-full border-[6px] border-gold bg-ink text-center shadow-[0_0_80px_rgba(239,232,168,.15)]">
            <div className="font-serif text-6xl font-bold text-gold">
              K<p className="text-xs tracking-[.3em]">AVYAS BEAUTY CENTRE</p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="wrap">
          <h2 className="mb-5 text-3xl font-bold">
            Popular <span className="text-gold">courses</span>
          </h2>
          <CourseBrowser courses={courses} />
        </div>
      </section>
      <section className="bg-[#0f1111] py-12">
        <div className="wrap">
          <h2 className="mb-5 text-3xl font-bold">How it works</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([t, d], i) => (
              <div key={t} className="card">
                <span className="mb-3 grid h-8 w-8 place-items-center rounded-full bg-gold font-bold text-ink">
                  {i + 1}
                </span>
                <h3>{t}</h3>
                <p className="text-sm text-mute">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="wrap">
          <h2 className="mb-5 text-3xl font-bold">
            Built for <span className="text-gold">focused learning</span>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {feats.map(([i, t, d]) => (
              <div key={t} className="card">
                <h3>
                  {i} {t}
                </h3>
                <p className="text-sm text-mute">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
