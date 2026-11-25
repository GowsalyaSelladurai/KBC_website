import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
        id: params.moduleId,
        courseId: params.id,
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
        id: params.moduleId,
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
    const existingModule = await prisma.module.findFirst({
      where: {
        id: params.moduleId,
        courseId: params.id,
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
        id: params.moduleId,
      },
    });

    return NextResponse.json({
      message: "Module and its lessons deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE module error:", error);

    return NextResponse.json(
      { message: "Failed to delete module." },
      { status: 500 }
    );
  }
}