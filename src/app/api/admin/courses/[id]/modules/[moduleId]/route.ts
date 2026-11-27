import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { parsePositiveIntId } from "@/lib/courses/validation";

type RouteContext = {
  params: {
    id: string;
    moduleId: string;
  };
};

// PUT: Update module title.
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireUser(true);
    const courseId = parsePositiveIntId(params.id);
    const moduleId = parsePositiveIntId(params.moduleId);
    if (courseId === null || moduleId === null) {
      return NextResponse.json(
        { message: "Invalid course or module ID." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    if (!title) {
      return NextResponse.json(
        { message: "Module title is required." },
        { status: 400 }
      );
    }

    const existingModule = await prisma.module.findFirst({
      where: {
        id: moduleId,
        courseId,
      },
    });

    if (!existingModule) {
      return NextResponse.json(
        { message: "Module not found in this course." },
        { status: 404 }
      );
    }

    const updatedModule = await prisma.module.update({
      where: {
        id: moduleId,
      },
      data: {
        title,
      },
      include: {
        lessons: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    return NextResponse.json(updatedModule);
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status }
      );
    }
    console.error("PUT module error:", error);

    return NextResponse.json(
      { message: "Failed to update module." },
      { status: 500 }
    );
  }
}

// DELETE: Delete module and its lessons.
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireUser(true);
    const courseId = parsePositiveIntId(params.id);
    const moduleId = parsePositiveIntId(params.moduleId);
    if (courseId === null || moduleId === null) {
      return NextResponse.json(
        { message: "Invalid course or module ID." },
        { status: 400 }
      );
    }

    const existingModule = await prisma.module.findFirst({
      where: {
        id: moduleId,
        courseId,
      },
      select: {
        id: true,
      },
    });

    if (!existingModule) {
      return NextResponse.json(
        { message: "Module not found in this course." },
        { status: 404 }
      );
    }

    await prisma.module.delete({
      where: {
        id: moduleId,
      },
    });

    return NextResponse.json({
      message: "Module and its lessons deleted successfully.",
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status }
      );
    }
    console.error("DELETE module error:", error);

    return NextResponse.json(
      { message: "Failed to delete module." },
      { status: 500 }
    );
  }
}