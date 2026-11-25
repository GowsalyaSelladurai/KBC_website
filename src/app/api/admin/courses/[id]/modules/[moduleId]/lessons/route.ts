import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
    moduleId: string;
  };
};

// GET: Fetch all lessons in a module.
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const module = await prisma.module.findFirst({
      where: {
        id: params.moduleId,
        courseId: params.id,
      },
      select: {
        id: true,
      },
    });

    if (!module) {
      return NextResponse.json(
        { message: "Module not found in this course." },
        { status: 404 }
      );
    }

    const lessons = await prisma.lesson.findMany({
      where: {
        moduleId: params.moduleId,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("GET lessons error:", error);

    return NextResponse.json(
      { message: "Failed to fetch lessons." },
      { status: 500 }
    );
  }
}

// POST: Create a lesson.
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : undefined;

    if (!title) {
      return NextResponse.json(
        { message: "Lesson title is required." },
        { status: 400 }
      );
    }

    const module = await prisma.module.findFirst({
      where: {
        id: params.moduleId,
        courseId: params.id,
      },
      select: {
        id: true,
      },
    });

    if (!module) {
      return NextResponse.json(
        { message: "Module not found in this course." },
        { status: 404 }
      );
    }

    const lastLesson = await prisma.lesson.findFirst({
      where: {
        moduleId: params.moduleId,
      },
      orderBy: {
        sortOrder: "desc",
      },
      select: {
        sortOrder: true,
      },
    });

    const nextSortOrder = (lastLesson?.sortOrder ?? -1) + 1;

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        moduleId: params.moduleId,
        sortOrder: nextSortOrder,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("POST lesson error:", error);

    return NextResponse.json(
      { message: "Failed to create lesson." },
      { status: 500 }
    );
  }
}