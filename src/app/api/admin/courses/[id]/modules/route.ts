import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    id: string;
  };
};

// GET: Fetch modules and their lessons for a course.
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found." },
        { status: 404 }
      );
    }

    const modules = await prisma.module.findMany({
      where: {
        courseId: params.id,
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
    console.error("GET modules error:", error);

    return NextResponse.json(
      { message: "Failed to fetch modules." },
      { status: 500 }
    );
  }
}

// POST: Create a module.
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    if (!title) {
      return NextResponse.json(
        { message: "Module title is required." },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found." },
        { status: 404 }
      );
    }

    const lastModule = await prisma.module.findFirst({
      where: {
        courseId: params.id,
      },
      orderBy: {
        sortOrder: "desc",
      },
      select: {
        sortOrder: true,
      },
    });

    const nextSortOrder = (lastModule?.sortOrder ?? -1) + 1;

    const module = await prisma.module.create({
      data: {
        title,
        courseId: params.id,
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

    return NextResponse.json(module, { status: 201 });
  } catch (error) {
    console.error("POST module error:", error);

    return NextResponse.json(
      { message: "Failed to create module." },
      { status: 500 }
    );
  }
}