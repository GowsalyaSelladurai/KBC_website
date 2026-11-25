import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  id: string;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (
      typeof body.imageUrl !== "string" ||
      !body.imageUrl.startsWith("/uploads/courses/")
    ) {
      return NextResponse.json(
        { error: "A valid course image URL is required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        imageUrl: body.imageUrl,
      },
    });

    return NextResponse.json({
      message: "Course image updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Course image update error:", error);

    return NextResponse.json(
      { error: "Failed to update course image" },
      { status: 500 }
    );
  }
}