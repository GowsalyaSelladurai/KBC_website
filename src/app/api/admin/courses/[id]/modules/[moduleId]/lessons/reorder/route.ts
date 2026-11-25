import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  id: string;
  moduleId: string;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id, moduleId } = params;
    const body = await request.json();

    if (!Array.isArray(body.lessonIds) || body.lessonIds.length === 0) {
      return NextResponse.json(
        { error: "lessonIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (
      !body.lessonIds.every(
        (lessonId: unknown) =>
          typeof lessonId === "string" && lessonId.trim().length > 0
      )
    ) {
      return NextResponse.json(
        { error: "Every lesson ID must be a valid string" },
        { status: 400 }
      );
    }

    if (new Set(body.lessonIds).size !== body.lessonIds.length) {
      return NextResponse.json(
        { error: "Duplicate lesson IDs are not allowed" },
        { status: 400 }
      );
    }

    const moduleExists = await prisma.module.findFirst({
      where: {
        id: moduleId,
        courseId: id,
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

    if (existingLessons.length !== body.lessonIds.length) {
      return NextResponse.json(
        { error: "Submitted lesson IDs must include all lessons in this module" },
        { status: 400 }
      );
    }

    const existingIds = new Set(existingLessons.map((lesson) => lesson.id));

    if (!body.lessonIds.every((lessonId: string) => existingIds.has(lessonId))) {
      return NextResponse.json(
        { error: "One or more lesson IDs do not belong to this module" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      body.lessonIds.map((lessonId: string, index: number) =>
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
    console.error("Reorder lessons error:", error);

    return NextResponse.json(
      { error: "Failed to reorder lessons" },
      { status: 500 }
    );
  }
}
