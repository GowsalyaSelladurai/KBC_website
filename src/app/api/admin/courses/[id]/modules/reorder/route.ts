import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  id: string;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!Array.isArray(body.moduleIds) || body.moduleIds.length === 0) {
      return NextResponse.json(
        { error: "moduleIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (
      !body.moduleIds.every(
        (moduleId: unknown) =>
          typeof moduleId === "string" && moduleId.trim().length > 0
      )
    ) {
      return NextResponse.json(
        { error: "Every module ID must be a valid string" },
        { status: 400 }
      );
    }

    if (new Set(body.moduleIds).size !== body.moduleIds.length) {
      return NextResponse.json(
        { error: "Duplicate module IDs are not allowed" },
        { status: 400 }
      );
    }

    const existingModules = await prisma.module.findMany({
      where: { courseId: id },
      select: { id: true },
    });

    if (existingModules.length === 0) {
      return NextResponse.json(
        { error: "No modules found for this course" },
        { status: 404 }
      );
    }

    if (existingModules.length !== body.moduleIds.length) {
      return NextResponse.json(
        { error: "Submitted module IDs must include all modules in this course" },
        { status: 400 }
      );
    }

    const existingIds = new Set(existingModules.map((module) => module.id));

    if (!body.moduleIds.every((moduleId: string) => existingIds.has(moduleId))) {
      return NextResponse.json(
        { error: "One or more module IDs do not belong to this course" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      body.moduleIds.map((moduleId: string, index: number) =>
        prisma.module.update({
          where: { id: moduleId },
          data: { sortOrder: index },
        })
      )
    );

    const reorderedModules = await prisma.module.findMany({
      where: { courseId: id },
      orderBy: { sortOrder: "asc" },
      include: {
        lessons: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({
      message: "Modules reordered successfully",
      modules: reorderedModules,
    });
  } catch (error) {
    console.error("Reorder modules error:", error);

    return NextResponse.json(
      { error: "Failed to reorder modules" },
      { status: 500 }
    );
  }
}