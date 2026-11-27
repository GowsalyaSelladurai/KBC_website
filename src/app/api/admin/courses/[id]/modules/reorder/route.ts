import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { parsePositiveIntId } from "@/lib/courses/validation";

type Params = {
  id: string;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    await requireUser(true);
    const courseId = parsePositiveIntId(params.id);
    if (courseId === null) {
      return NextResponse.json(
        { error: "Invalid course ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (!Array.isArray(body.moduleIds) || body.moduleIds.length === 0) {
      return NextResponse.json(
        { error: "moduleIds must be a non-empty array" },
        { status: 400 }
      );
    }

    const parsedModuleIds: number[] = [];
    for (const rawId of body.moduleIds) {
      const parsed = parsePositiveIntId(rawId);
      if (parsed === null) {
        return NextResponse.json(
          { error: "Every module ID must be a valid positive integer" },
          { status: 400 }
        );
      }
      parsedModuleIds.push(parsed);
    }

    if (new Set(parsedModuleIds).size !== parsedModuleIds.length) {
      return NextResponse.json(
        { error: "Duplicate module IDs are not allowed" },
        { status: 400 }
      );
    }

    const existingModules = await prisma.module.findMany({
      where: { courseId },
      select: { id: true },
    });

    if (existingModules.length === 0) {
      return NextResponse.json(
        { error: "No modules found for this course" },
        { status: 404 }
      );
    }

    if (existingModules.length !== parsedModuleIds.length) {
      return NextResponse.json(
        { error: "Submitted module IDs must include all modules in this course" },
        { status: 400 }
      );
    }

    const existingIds = new Set(existingModules.map((module) => module.id));

    if (!parsedModuleIds.every((moduleId) => existingIds.has(moduleId))) {
      return NextResponse.json(
        { error: "One or more module IDs do not belong to this course" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      parsedModuleIds.map((moduleId, index) =>
        prisma.module.update({
          where: { id: moduleId },
          data: { sortOrder: index },
        })
      )
    );

    const reorderedModules = await prisma.module.findMany({
      where: { courseId },
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
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status }
      );
    }
    console.error("Reorder modules error:", error);

    return NextResponse.json(
      { error: "Failed to reorder modules" },
      { status: 500 }
    );
  }
}