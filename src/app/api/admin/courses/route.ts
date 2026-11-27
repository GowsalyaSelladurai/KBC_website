import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import {
  validateCreateCourse,
  validateMinimumCourseVideos,
} from "@/lib/courses/validation";

const validStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

function serializeCourse<T extends { durationDays: number }>(course: T) {
  return {
    ...course,
    duration:
      course.durationDays === 1
        ? "1 Day"
        : `${course.durationDays} Days`,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireUser(true);
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

    return NextResponse.json(courses.map(serializeCourse), { status: 200 });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status },
      );
    }
    console.error("GET courses error:", error);

    return NextResponse.json(
      { message: "Failed to fetch courses." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUser(true);
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

    if (data.durationDays === undefined) {
      return NextResponse.json(
        {
          message: "Course duration is required and must be a positive number of days.",
          errors: ["Course duration is required and must be a positive number of days."],
        },
        { status: 400 },
      );
    }

    const videoRuleError = validateMinimumCourseVideos(
      data.durationDays,
      data.modules,
    );
    if (videoRuleError) {
      return NextResponse.json(
        {
          message: videoRuleError,
          errors: [videoRuleError],
        },
        { status: 400 },
      );
    }

    const course = await prisma.course.create({
      data: {
        courseCode: data.courseCode,
        title: data.title,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        durationDays: data.durationDays,
        price: data.price,
        learningPoints: {
          create: (data.learningPoints ?? []).map((content, index) => ({
            content,
            sortOrder: index,
          })),
        },
        ...(data.modules && data.modules.length > 0
          ? {
              modules: {
                create: data.modules.map((mod, modIndex) => ({
                  title: mod.title,
                  sortOrder: modIndex,
                  lessons: {
                    create: mod.lessons.map((lesson, lessonIndex) => ({
                      title: lesson.title,
                      description: lesson.description || null,
                      sortOrder: lessonIndex,
                      durationSeconds: lesson.durationSeconds ?? null,
                      isPreview: Boolean(lesson.isPreview),
                      bunnyVideoId: lesson.bunnyVideoId || null,
                      videoStatus: lesson.videoStatus || "NOT_UPLOADED",
                    })),
                  },
                })),
              },
            }
          : {}),
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
    });

    return NextResponse.json(serializeCourse(course), { status: 201 });
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status },
      );
    }
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
