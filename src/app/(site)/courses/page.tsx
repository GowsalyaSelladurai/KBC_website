import CourseBrowser from "@/components/CourseBrowser";
import type { PublicCourse } from "@/components/CourseCard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Courses() {
  const dbCourses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
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
    <div className="wrap py-12">
      <h1 className="mb-5 text-4xl font-bold">
        All <span className="text-gold">courses</span>
      </h1>
      <CourseBrowser courses={courses} search />
    </div>
  );
}
