import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBunnyEmbedUrl } from "@/lib/bunny";

type Params = {
  id: string;
  moduleId: string;
  lessonId: string;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { id, moduleId, lessonId } = params;

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        moduleId,
        module: {
          courseId: id,
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (!lesson.bunnyVideoId) {
      return NextResponse.json(
        { error: "Bunny video ID is missing" },
        { status: 400 },
      );
    }

    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const apiKey = process.env.BUNNY_STREAM_API_KEY;

    if (!libraryId || !apiKey) {
      return NextResponse.json(
        { error: "Bunny configuration is missing" },
        { status: 500 },
      );
    }

    const bunnyResponse = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos/${lesson.bunnyVideoId}`,
      {
        headers: {
          AccessKey: apiKey,
        },
        cache: "no-store",
      },
    );

    if (!bunnyResponse.ok) {
      console.error("Bunny status API error:", bunnyResponse.status);

      return NextResponse.json(
        { error: "Failed to fetch video status from Bunny" },
        { status: 502 },
      );
    }

    const bunnyVideo = await bunnyResponse.json();

    let videoStatus: "NOT_UPLOADED" | "PROCESSING" | "READY" | "FAILED";

    switch (bunnyVideo.status) {
      case 4:
      case 8:
        videoStatus = "READY";
        break;

      case 5:
      case 6:
        videoStatus = "FAILED";
        break;

      case 1:
      case 2:
      case 3:
      case 7:
        videoStatus = "PROCESSING";
        break;

      case 0:
      default:
        // Status 0: Video object created in Bunny, but file upload has not completed or started.
        // If the lesson was already committed as READY, preserve READY status.
        // If the lesson was already marked PROCESSING (upload completed and awaiting Bunny transcode queue), keep PROCESSING.
        // Otherwise, keep as NOT_UPLOADED so a newly created video object never falsely triggers PROCESSING.
        if (lesson.videoStatus === "READY") {
          videoStatus = "READY";
        } else if (lesson.videoStatus === "PROCESSING") {
          videoStatus = "PROCESSING";
        } else {
          videoStatus = "NOT_UPLOADED";
        }
        break;
    }

    // Capture duration in seconds if Bunny has calculated it
    const durationSeconds =
      typeof bunnyVideo.length === "number" && bunnyVideo.length > 0
        ? Math.round(bunnyVideo.length)
        : lesson.durationSeconds;

    const updatedLesson = await prisma.lesson.update({
      where: {
        id: lessonId,
      },
      data: {
        videoStatus,
        durationSeconds,
      },
    });

    return NextResponse.json({
      videoStatus: updatedLesson.videoStatus,
      bunnyStatus: bunnyVideo.status,
      durationSeconds: updatedLesson.durationSeconds,
      embedUrl: getBunnyEmbedUrl(libraryId, lesson.bunnyVideoId),
    });
  } catch (error) {
    console.error("Video status check error:", error);

    return NextResponse.json(
      { error: "Failed to check video status" },
      { status: 500 },
    );
  }
}

