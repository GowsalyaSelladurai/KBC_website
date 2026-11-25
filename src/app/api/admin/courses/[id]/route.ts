import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCreateCourse } from "@/lib/courses/validation";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        learningPoints: {
          orderBy: { sortOrder: "asc" },
        },
        modules: {
          orderBy: { sortOrder: "asc" },
          include: {
            lessons: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(course, { status: 200 });
  } catch (error) {
    console.error("GET single course error:", error);

    return NextResponse.json(
      { message: "Failed to fetch course." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const body = await request.json();
    const validation = validateCreateCourse(body);

    if (validation.success === false) {
      return NextResponse.json(
        {
          message: "Validation failed.",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    const course = await prisma.$transaction(async (tx) => {
      const existingCourse = await tx.course.findUnique({
        where: { id: params.id },
        select: { id: true },
      });

      if (!existingCourse) {
        return null;
      }

      await tx.courseLearningPoint.deleteMany({
        where: { courseId: params.id },
      });

      return tx.course.update({
        where: { id: params.id },
        data: {
          courseCode: data.courseCode,
          title: data.title,
          description: data.description || null,
          imageUrl: data.imageUrl || null,
          duration: data.duration || null,
          price: data.price,
          learningPoints: {
            create: (data.learningPoints ?? []).map(
              (content, index) => ({
                content,
                sortOrder: index,
              })
            ),
          },
        },
        include: {
          learningPoints: {
            orderBy: { sortOrder: "asc" },
          },
          modules: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(course, { status: 200 });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "This course code already exists." },
        { status: 409 }
      );
    }

    console.error("PUT course error:", error);

    return NextResponse.json(
      { message: "Failed to update course." },
      { status: 500 }
    );
  }
}