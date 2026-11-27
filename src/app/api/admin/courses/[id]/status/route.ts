import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import {
  parsePositiveIntId,
  validateMinimumCourseVideos,
} from "@/lib/courses/validation";

type Params = {
  id: string;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    await requireUser(true);
    const courseId = parsePositiveIntId(params.id);
    if (courseId === null) {
      return NextResponse.json(
        { error: "Invalid course ID" },
        { status: 400 }
      );
    }
    const body = await request.json();

    const allowedStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"];

    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Status must be DRAFT, PUBLISHED, or ARCHIVED" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
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

      const videoRuleError = validateMinimumCourseVideos(
        course.durationDays,
        course.modules
      );
      if (videoRuleError) {
        return NextResponse.json(
          { error: videoRuleError },
          { status: 400 }
        );
      }
    }

    // Archive or restore the course
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
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
      course: {
        ...updatedCourse,
        duration:
          updatedCourse.durationDays === 1
            ? "1 Day"
            : `${updatedCourse.durationDays} Days`,
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status }
      );
    }
    console.error("Course status update error:", error);

    return NextResponse.json(
      { error: "Failed to update course status" },
      { status: 500 }
    );
  }
}