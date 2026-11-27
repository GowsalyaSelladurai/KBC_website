import { NextResponse } from "next/server";
import { getBunnyConfig, getBunnyEmbedUrl } from "@/lib/bunny";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string; lessonId: string } },
) {
  try {
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: params.lessonId,
        module: {
          courseId: params.id,
          course: { status: "PUBLISHED" },
        },
      },
      select: {
        id: true,
        title: true,
        isPreview: true,
        videoStatus: true,
        bunnyVideoId: true,
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 },
      );
    }

    if (!lesson.isPreview) {
      return NextResponse.json(
        { error: "Preview is not available for this lesson" },
        { status: 403 },
      );
    }

    if (lesson.videoStatus !== "READY" || !lesson.bunnyVideoId) {
      return NextResponse.json(
        { error: "Preview video is not ready" },
        { status: 409 },
      );
    }

    const { libraryId } = getBunnyConfig();
    const embedUrl = getBunnyEmbedUrl(libraryId, lesson.bunnyVideoId);

    return NextResponse.json({
      lessonId: lesson.id,
      title: lesson.title,
      embedUrl,
    });
  } catch (err) {
    console.error("Failed to load lesson preview:", err);
    return NextResponse.json(
      { error: "Unable to load preview video" },
      { status: 500 },
    );
  }
}
