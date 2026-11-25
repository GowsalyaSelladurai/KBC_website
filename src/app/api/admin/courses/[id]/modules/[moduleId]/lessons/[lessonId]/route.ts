import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  id: string;
  moduleId: string;
  lessonId: string;
};

async function verifyLesson(
  courseId: string,
  moduleId: string,
  lessonId: string
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
    const { id, moduleId, lessonId } = params;

    const existingLesson = await verifyLesson(id, moduleId, lessonId);

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
    const { id, moduleId, lessonId } = params;

    const existingLesson = await verifyLesson(id, moduleId, lessonId);

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
    console.error("Delete lesson error:", error);

    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}