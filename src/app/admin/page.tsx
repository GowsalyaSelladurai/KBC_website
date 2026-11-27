import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [totalCourses, publishedCourses, draftCourses, totalLessons, recentCourses] =
    await Promise.all([
      prisma.course.count({ where: { status: { not: "ARCHIVED" } } }),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.course.count({ where: { status: "DRAFT" } }),
      prisma.lesson.count({
        where: { module: { course: { status: { not: "ARCHIVED" } } } },
      }),
      prisma.course.findMany({
        where: { status: { not: "ARCHIVED" } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          courseCode: true,
          title: true,
          status: true,
          price: true,
          _count: { select: { modules: true } },
        },
      }),
    ]);

  const kpi: [number, string][] = [
    [totalCourses, "Active Courses"],
    [publishedCourses, "Published"],
    [draftCourses, "Drafts"],
    [totalLessons, "Total Lessons"],
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/admin/courses" className="btn btn-sm">
          Manage Courses
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpi.map(([v, l]) => (
          <div key={l} className="card">
            <b className="font-serif text-3xl text-gold">{v}</b>
            <p className="text-sm text-mute">{l}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h3>Recent courses</h3>
          <Link href="/admin/courses/new" className="text-xs text-gold hover:underline">
            + Add Course
          </Link>
        </div>

        {recentCourses.length === 0 ? (
          <p className="py-6 text-center text-sm text-mute">
            No courses created yet.
          </p>
        ) : (
          recentCourses.map((c) => (
            <Link
              key={c.id}
              href={`/admin/courses/${c.id}`}
              className="flex items-center justify-between border-t border-line py-2.5 text-sm transition hover:bg-white/[0.02]"
            >
              <div>
                <b>{c.title}</b>
                <p className="text-mute">
                  {c.courseCode} · {c._count.modules} modules
                </p>
              </div>
              <span className="tag">{c.status}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
