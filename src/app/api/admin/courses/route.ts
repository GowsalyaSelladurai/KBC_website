import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCreateCourse } from "@/lib/courses/validation";

const validStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status");

    if (
      status &&
      !validStatuses.includes(status as (typeof validStatuses)[number])
    ) {
      return NextResponse.json(
        { message: "Invalid course status." },
        { status: 400 },
      );
    }

    const courses = await prisma.course.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { courseCode: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(status ? { status: status as (typeof validStatuses)[number] } : {}),
      },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    console.error("GET courses error:", error);

    return NextResponse.json(
      { message: "Failed to fetch courses." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = validateCreateCourse(body);

    if (validation.success === false) {
      return NextResponse.json(
        {
          message: "Validation failed.",
          errors: validation.errors,
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    const course = await prisma.course.create({
      data: {
        courseCode: data.courseCode,
        title: data.title,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        duration: data.duration || null,
        price: data.price,
        learningPoints: {
          create: (data.learningPoints ?? []).map((content, index) => ({
            content,
            sortOrder: index,
          })),
        },
      },
      include: {
        learningPoints: {
          orderBy: { sortOrder: "asc" },
        },
        modules: true,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "This course code already exists." },
        { status: 409 },
      );
    }

    console.error("POST course error:", error);

    return NextResponse.json(
      { message: "Failed to create course." },
      { status: 500 },
    );
  }
}
