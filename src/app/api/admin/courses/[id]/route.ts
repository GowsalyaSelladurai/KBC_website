import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import {
  parsePositiveIntId,
  validateCreateCourse,
  validateMinimumCourseVideos,
} from "@/lib/courses/validation";

type RouteContext = {
  params: {
    id: string;
  };
};

function serializeCourse<T extends { durationDays: number }>(course: T) {
  return {
    ...course,
    duration:
      course.durationDays === 1
        ? "1 Day"
        : `${course.durationDays} Days`,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireUser(true);
    const courseId = parsePositiveIntId(params.id);
    if (courseId === null) {
      return NextResponse.json(
        { message: "Invalid course ID." },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
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

    return NextResponse.json(serializeCourse(course), { status: 200 });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status }
      );
    }
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
    await requireUser(true);
    const courseId = parsePositiveIntId(params.id);
    if (courseId === null) {
      return NextResponse.json(
        { message: "Invalid course ID." },
        { status: 400 }
      );
    }

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

    if (data.durationDays === undefined) {
      return NextResponse.json(
        {
          message: "Course duration is required and must be a positive number of days.",
          errors: ["Course duration is required and must be a positive number of days."],
        },
        { status: 400 },
      );
    }

    const existingCourseCheck = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: { lessons: true },
        },
      },
    });

    if (!existingCourseCheck) {
      return NextResponse.json(
        { message: "Course not found." },
        { status: 404 },
      );
    }

    const modulesToValidate = data.modules ?? existingCourseCheck.modules;
    const videoRuleError = validateMinimumCourseVideos(
      data.durationDays,
      modulesToValidate,
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

    const course = await prisma.$transaction(async (tx) => {
      await tx.courseLearningPoint.deleteMany({
        where: { courseId },
      });

      if (data.modules !== undefined) {
        const existingModuleIds = new Set(
          existingCourseCheck.modules.map((m) => m.id),
        );
        const keptModuleIds = data.modules
          .map((m) => m.id)
          .filter((id): id is number => typeof id === "number" && existingModuleIds.has(id));

        await tx.module.deleteMany({
          where: {
            courseId,
            id: { notIn: keptModuleIds },
          },
        });

        for (let modIndex = 0; modIndex < data.modules.length; modIndex++) {
          const mod = data.modules[modIndex];
          const isExistingMod = mod.id !== undefined && existingModuleIds.has(mod.id);

          if (isExistingMod && mod.id !== undefined) {
            const existingMod = existingCourseCheck.modules.find(
              (m) => m.id === mod.id,
            );
            const existingLessonIds = new Set(
              (existingMod?.lessons ?? []).map((l) => l.id),
            );
            const keptLessonIds = mod.lessons
              .map((l) => l.id)
              .filter(
                (id): id is number => typeof id === "number" && existingLessonIds.has(id),
              );

            await tx.lesson.deleteMany({
              where: {
                moduleId: mod.id,
                id: { notIn: keptLessonIds },
              },
            });

            await tx.module.update({
              where: { id: mod.id },
              data: {
                title: mod.title,
                sortOrder: modIndex,
              },
            });

            for (
              let lessonIndex = 0;
              lessonIndex < mod.lessons.length;
              lessonIndex++
            ) {
              const lesson = mod.lessons[lessonIndex];
              if (lesson.id !== undefined && existingLessonIds.has(lesson.id)) {
                const existingLesson = existingMod?.lessons.find(
                  (l) => l.id === lesson.id,
                );
                await tx.lesson.update({
                  where: { id: lesson.id },
                  data: {
                    title: lesson.title,
                    description: lesson.description || null,
                    sortOrder: lessonIndex,
                    durationSeconds: lesson.durationSeconds ?? null,
                    isPreview: Boolean(lesson.isPreview),
                    bunnyVideoId:
                      lesson.bunnyVideoId !== undefined
                        ? lesson.bunnyVideoId || null
                        : existingLesson?.bunnyVideoId ?? null,
                    videoStatus:
                      lesson.videoStatus ?? existingLesson?.videoStatus ?? "NOT_UPLOADED",
                  },
                });
              } else {
                await tx.lesson.create({
                  data: {
                    moduleId: mod.id,
                    title: lesson.title,
                    description: lesson.description || null,
                    sortOrder: lessonIndex,
                    durationSeconds: lesson.durationSeconds ?? null,
                    isPreview: Boolean(lesson.isPreview),
                    bunnyVideoId: lesson.bunnyVideoId || null,
                    videoStatus: lesson.videoStatus || "NOT_UPLOADED",
                  },
                });
              }
            }
          } else {
            await tx.module.create({
              data: {
                courseId,
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
              },
            });
          }
        }
      }

      return tx.course.update({
        where: { id: courseId },
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
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeCourse(course), { status: 200 });
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status }
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

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireUser(true);
    const courseId = parsePositiveIntId(params.id);
    if (courseId === null) {
      return NextResponse.json(
        { message: "Invalid course ID." },
        { status: 400 }
      );
    }

    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { message: "Course not found." },
        { status: 404 }
      );
    }

    // Prisma schema defines onDelete: Cascade on CourseLearningPoint, Module, and Lesson.
    // Bunny Stream videos are intentionally retained and not deleted here.
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json(
      {
        message: "Course deleted successfully.",
        id: courseId,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status }
      );
    }
    console.error("DELETE course error:", error);

    return NextResponse.json(
      { message: "Failed to delete course." },
      { status: 500 }
    );
  }
}