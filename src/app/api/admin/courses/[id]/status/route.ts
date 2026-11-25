import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  id: string;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const allowedStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"];

    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Status must be DRAFT, PUBLISHED, or ARCHIVED" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Prevent unnecessary status updates
    if (course.status === body.status) {
      return NextResponse.json(
        { error: `Course is already ${body.status}` },
        { status: 400 }
      );
    }

    // Publishing validation
    if (body.status === "PUBLISHED") {
      if (course.modules.length === 0) {
        return NextResponse.json(
          { error: "Add at least one module before publishing" },
          { status: 400 }
        );
      }

      const hasLessons = course.modules.some(
        (module) => module.lessons.length > 0
      );

      if (!hasLessons) {
        return NextResponse.json(
          { error: "Add at least one lesson before publishing" },
          { status: 400 }
        );
      }
    }

    // Archive or restore the course
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        status: body.status,
      },
    });

    const messages: Record<string, string> = {
      PUBLISHED: "Course published successfully",
      DRAFT: course.status === "ARCHIVED"
        ? "Course restored successfully"
        : "Course unpublished successfully",
      ARCHIVED: "Course archived successfully",
    };

    return NextResponse.json({
      message: messages[body.status],
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Course status update error:", error);

    return NextResponse.json(
      { error: "Failed to update course status" },
      { status: 500 }
    );
  }
}