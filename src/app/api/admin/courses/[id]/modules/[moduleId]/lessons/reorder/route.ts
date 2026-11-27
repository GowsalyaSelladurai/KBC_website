import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { parsePositiveIntId } from "@/lib/courses/validation";

type Params = {
  id: string;
  moduleId: string;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    await requireUser(true);
    const courseId = parsePositiveIntId(params.id);
    const moduleId = parsePositiveIntId(params.moduleId);
    if (courseId === null || moduleId === null) {
      return NextResponse.json(
        { error: "Invalid course or module ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!Array.isArray(body.lessonIds) || body.lessonIds.length === 0) {
      return NextResponse.json(
        { error: "lessonIds must be a non-empty array" },
        { status: 400 }
      );
    }

    const parsedLessonIds: number[] = [];
    for (const rawId of body.lessonIds) {
      const parsed = parsePositiveIntId(rawId);
      if (parsed === null) {
        return NextResponse.json(
          { error: "Every lesson ID must be a valid positive integer" },
          { status: 400 }
        );
      }
      parsedLessonIds.push(parsed);
    }

    if (new Set(parsedLessonIds).size !== parsedLessonIds.length) {
      return NextResponse.json(
        { error: "Duplicate lesson IDs are not allowed" },
        { status: 400 }
      );
    }

    const moduleExists = await prisma.module.findFirst({
      where: {
        id: moduleId,
        courseId,
      },
    });

    if (!moduleExists) {
      return NextResponse.json(
        { error: "Module not found in this course" },
        { status: 404 }
      );
    }

    const existingLessons = await prisma.lesson.findMany({
      where: { moduleId },
      select: { id: true },
    });

    if (existingLessons.length !== parsedLessonIds.length) {
      return NextResponse.json(
        { error: "Submitted lesson IDs must include all lessons in this module" },
        { status: 400 }
      );
    }

    const existingIds = new Set(existingLessons.map((lesson) => lesson.id));

    if (!parsedLessonIds.every((lessonId) => existingIds.has(lessonId))) {
      return NextResponse.json(
        { error: "One or more lesson IDs do not belong to this module" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      parsedLessonIds.map((lessonId, index) =>
        prisma.lesson.update({
          where: { id: lessonId },
          data: { sortOrder: index },
        })
      )
    );

    const reorderedLessons = await prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      message: "Lessons reordered successfully",
      lessons: reorderedLessons,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status }
      );
    }
    console.error("Reorder lessons error:", error);

    return NextResponse.json(
      { error: "Failed to reorder lessons" },
      { status: 500 }
    );
  }
}
