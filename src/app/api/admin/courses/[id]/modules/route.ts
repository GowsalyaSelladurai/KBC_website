import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { parsePositiveIntId } from "@/lib/courses/validation";

type RouteContext = {
  params: {
    id: string;
  };
};

// GET: Fetch modules and their lessons for a course.
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await requireUser(true);
    const courseId = parsePositiveIntId(params.id);
    if (courseId === null) {
      return NextResponse.json(
        { message: "Invalid course ID." },
        { status: 400 },
      );
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found." },
        { status: 404 },
      );
    }

    const modules = await prisma.module.findMany({
      where: {
        courseId,
      },
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        lessons: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    return NextResponse.json(modules);
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status },
      );
    }
    console.error("GET modules error:", error);

    return NextResponse.json(
      { message: "Failed to fetch modules." },
      { status: 500 },
    );
  }
}

// POST: Create a module.
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    await requireUser(true);
    const courseId = parsePositiveIntId(params.id);
    if (courseId === null) {
      return NextResponse.json(
        { message: "Invalid course ID." },
        { status: 400 },
      );
    }

    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : "";

    if (!title) {
      return NextResponse.json(
        { message: "Module title is required." },
        { status: 400 },
      );
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found." },
        { status: 404 },
      );
    }

    const lastModule = await prisma.module.findFirst({
      where: {
        courseId,
      },
      orderBy: {
        sortOrder: "desc",
      },
      select: {
        sortOrder: true,
      },
    });

    const nextSortOrder = (lastModule?.sortOrder ?? -1) + 1;

    const courseModule = await prisma.module.create({
      data: {
        title,
        courseId,
        sortOrder: nextSortOrder,
      },
      include: {
        lessons: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

return NextResponse.json(courseModule, { status: 201 });  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status },
      );
    }
    console.error("POST module error:", error);

    return NextResponse.json(
      { message: "Failed to create module." },
      { status: 500 },
    );
  }
}
