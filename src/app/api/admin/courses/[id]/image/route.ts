import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { parsePositiveIntId } from "@/lib/courses/validation";

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

    if (
      typeof body.imageUrl !== "string" ||
      !body.imageUrl.startsWith("/uploads/courses/")
    ) {
      return NextResponse.json(
        { error: "A valid course image URL is required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        imageUrl: body.imageUrl,
      },
    });

    return NextResponse.json({
      message: "Course image updated successfully",
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
    console.error("Course image update error:", error);

    return NextResponse.json(
      { error: "Failed to update course image" },
      { status: 500 }
    );
  }
}