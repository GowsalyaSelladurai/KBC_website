import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteBunnyVideo, getBunnyVideo } from "@/lib/bunny";

type Params = {
  id: string;
  moduleId: string;
  lessonId: string;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    const { id, moduleId, lessonId } = params;

    let body: { videoId?: string } = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

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
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 },
      );
    }

    // CASE 1: REPLACEMENT WORKFLOW COMPLETION
    // If a pending replacement video exists and matches the completed video
    if (
      lesson.pendingVideoId &&
      (!body.videoId || body.videoId === lesson.pendingVideoId)
    ) {
      const pendingVideoId = lesson.pendingVideoId;
      const oldVideoId = lesson.bunnyVideoId;

      // 1. Verify the replacement video against Bunny before committing
      let replacementBunnyVideo;
      try {
        replacementBunnyVideo = await getBunnyVideo(pendingVideoId);
      } catch (err) {
        console.error("Failed to verify replacement video on Bunny CDN:", err);
        return NextResponse.json(
          { error: "Replacement video could not be verified on Bunny CDN" },
          { status: 400 },
        );
      }

      if (!replacementBunnyVideo || !replacementBunnyVideo.guid) {
        return NextResponse.json(
          { error: "Replacement video not found on Bunny CDN" },
          { status: 400 },
        );
      }

      // 2. Only after verification, safely commit the replacement in the database
      const durationSeconds =
        typeof replacementBunnyVideo.length === "number" &&
        replacementBunnyVideo.length > 0
          ? Math.round(replacementBunnyVideo.length)
          : null;

      const updatedLesson = await prisma.lesson.update({
        where: { id: lessonId },
        data: {
          bunnyVideoId: pendingVideoId,
          pendingVideoId: null,
          videoStatus: "PROCESSING",
          durationSeconds: durationSeconds ?? lesson.durationSeconds,
        },
      });

      // 3. Delete the previous Bunny video ONLY after the replacement has been safely committed.
      // If deleting the old Bunny video fails, do not invalidate the newly committed replacement.
      if (oldVideoId && oldVideoId !== pendingVideoId) {
        deleteBunnyVideo(oldVideoId).catch((err) => {
          console.error(
            `Safe cleanup notice: Failed to delete previous Bunny video ${oldVideoId} after replacement:`,
            err,
          );
        });
      }

      return NextResponse.json({
        message: "Replacement video committed successfully. Processing started.",
        lesson: updatedLesson,
      });
    }

    // CASE 2: NORMAL INITIAL UPLOAD COMPLETION
    if (!lesson.bunnyVideoId) {
      return NextResponse.json(
        { error: "Bunny video ID is missing" },
        { status: 400 },
      );
    }

    // Verify initial video against Bunny
    try {
      await getBunnyVideo(lesson.bunnyVideoId);
    } catch (err) {
      console.error("Failed to verify initial video on Bunny CDN:", err);
      return NextResponse.json(
        { error: "Video could not be verified on Bunny CDN" },
        { status: 400 },
      );
    }

    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        videoStatus: "PROCESSING",
      },
    });

    return NextResponse.json({
      message: "Video upload completed. Processing started.",
      lesson: updatedLesson,
    });
  } catch (error) {
    console.error("Video upload completion error:", error);

    return NextResponse.json(
      { error: "Failed to update video status" },
      { status: 500 },
    );
  }
}
