import Link from "next/link";
import CourseLearningWorkspace from "@/components/learning/CourseLearningWorkspace";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LearnCoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const course = await prisma.course.findFirst({
    where: {
      id: params.courseId,
      status: "PUBLISHED",
    },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      duration: true,
    },
  });

  if (!course) {
    return (
      <div className="kbc-luxury-bg min-h-[calc(100vh-4rem)] py-16">
        <div className="wrap">
          <div className="kbc-gold-card mx-auto max-w-lg space-y-4 rounded-2xl p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#D6AD65]/35 bg-[#211A12] text-xl text-[#D6AD65]">
              ✦
            </div>
            <h1 className="font-serif text-2xl font-semibold text-white">
              Course Unavailable
            </h1>
            <p className="text-sm text-[#BDB4A7]">
              This course is either unpublished or does not exist.
            </p>
            <Link href="/courses" className="kbc-gold-btn !rounded-full">
              Browse Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kbc-luxury-bg min-h-[calc(100vh-4rem)]">
      <CourseLearningWorkspace course={course} />
    </div>
  );
}
