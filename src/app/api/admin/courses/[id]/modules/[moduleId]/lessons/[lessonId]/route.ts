import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { parsePositiveIntId } from "@/lib/courses/validation";

type Params = {
  id: string;
  moduleId: string;
  lessonId: string;
};

async function verifyLesson(
  courseId: number,
  moduleId: number,
  lessonId: number
) {
  return prisma.lesson.findFirst({
    where: {
      id: lessonId,
      moduleId,
      module: {
        courseId,
      },
    },
  });
}

// PUT - Update lesson
export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    await requireUser(true);
    const courseId = parsePositiveIntId(params.id);
    const moduleId = parsePositiveIntId(params.moduleId);
    const lessonId = parsePositiveIntId(params.lessonId);
    if (courseId === null || moduleId === null || lessonId === null) {
      return NextResponse.json(
        { error: "Invalid course, module, or lesson ID" },
        { status: 400 }
      );
    }

    const existingLesson = await verifyLesson(courseId, moduleId, lessonId);

    if (!existingLesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: body.title,
        description: body.description,
        durationSeconds: body.durationSeconds,
        isPreview: body.isPreview,
      },
    });

    return NextResponse.json(updatedLesson);
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status }
      );
    }
    console.error("Update lesson error:", error);

    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

// DELETE - Delete lesson
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    await requireUser(true);
    const courseId = parsePositiveIntId(params.id);
    const moduleId = parsePositiveIntId(params.moduleId);
    const lessonId = parsePositiveIntId(params.lessonId);
    if (courseId === null || moduleId === null || lessonId === null) {
      return NextResponse.json(
        { error: "Invalid course, module, or lesson ID" },
        { status: 400 }
      );
    }

    const existingLesson = await verifyLesson(courseId, moduleId, lessonId);

    if (!existingLesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json({
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status }
      );
    }
    console.error("Delete lesson error:", error);

    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}