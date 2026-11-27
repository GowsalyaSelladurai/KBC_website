import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HttpError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { parsePositiveIntId } from "@/lib/courses/validation";
import {
  createBunnyVideo,
  deleteBunnyVideo,
  getBunnyEmbedUrl,
  getBunnyVideo,
} from "@/lib/bunny";

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
    await requireUser(true);
    const courseId = parsePositiveIntId(params.id);
    const moduleId = parsePositiveIntId(params.moduleId);
    const lessonId = parsePositiveIntId(params.lessonId);
    if (courseId === null || moduleId === null || lessonId === null) {
      return NextResponse.json(
        { error: "Invalid course, module, or lesson ID" },
        { status: 400 },
      );
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        moduleId,
        module: {
          courseId,
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 },
      );
    }

    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID || "";
    const embedUrl =
      lesson.bunnyVideoId && libraryId
        ? getBunnyEmbedUrl(libraryId, lesson.bunnyVideoId)
        : null;

    return NextResponse.json({
      lessonId: lesson.id,
      title: lesson.title,
      bunnyVideoId: lesson.bunnyVideoId,
      pendingVideoId: lesson.pendingVideoId,
      videoStatus: lesson.videoStatus,
      durationSeconds: lesson.durationSeconds,
      embedUrl,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status },
      );
    }
    console.error("Fetch lesson video error:", error);
    return NextResponse.json(
      { error: "Failed to fetch video details" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    await requireUser(true);
    const courseId = parsePositiveIntId(params.id);
    const moduleId = parsePositiveIntId(params.moduleId);
    const lessonId = parsePositiveIntId(params.lessonId);
    if (courseId === null || moduleId === null || lessonId === null) {
      return NextResponse.json(
        { error: "Invalid course, module, or lesson ID" },
        { status: 400 },
      );
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        moduleId,
        module: {
          courseId,
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 },
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

    const isReplace = request.nextUrl.searchParams.get("replace") === "true";
    let uploadVideoId: string;

    if (isReplace) {
      // SAFE REPLACEMENT WORKFLOW:
      // 1. Do NOT delete the existing Bunny video.
      // 2. Do NOT overwrite lesson.bunnyVideoId or reset lesson.videoStatus.
      // 3. Reuse existing pendingVideoId if still valid and not failed, preventing duplicate Bunny video objects.
      let targetPendingId = lesson.pendingVideoId;

      if (targetPendingId) {
        try {
          const check = await getBunnyVideo(targetPendingId);
          // If the pending video is valid and not in a failed state (5 or 6), reuse it!
          if (
            check &&
            check.guid &&
            check.status !== 5 &&
            check.status !== 6
          ) {
            // Reusing existing pending video - do not create a duplicate
          } else {
            // If failed on Bunny, clean it up before creating a fresh one
            await deleteBunnyVideo(targetPendingId).catch(() => {});
            targetPendingId = null;
          }
        } catch {
          targetPendingId = null;
        }
      }

      if (!targetPendingId) {
        const bunnyVideo = await createBunnyVideo(
          `${lesson.title} (Replacement)`,
        );
        targetPendingId = bunnyVideo.videoId;

        await prisma.lesson.update({
          where: { id: lessonId },
          data: {
            pendingVideoId: targetPendingId,
          },
        });
      }

      uploadVideoId = targetPendingId;
    } else {
      // NORMAL INITIAL UPLOAD:
      let bunnyVideoId = lesson.bunnyVideoId;

      if (!bunnyVideoId) {
        const bunnyVideo = await createBunnyVideo(lesson.title);
        bunnyVideoId = bunnyVideo.videoId;

        await prisma.lesson.update({
          where: { id: lessonId },
          data: {
            bunnyVideoId,
            videoStatus: "NOT_UPLOADED",
          },
        });
      }

      uploadVideoId = bunnyVideoId;
    }

    const expirationTime = Math.floor(Date.now() / 1000) + 86400;

    const signature = createHash("sha256")
      .update(`${libraryId}${apiKey}${expirationTime}${uploadVideoId}`)
      .digest("hex");

    return NextResponse.json({
      videoId: uploadVideoId,
      libraryId,
      expirationTime,
      signature,
      endpoint: "https://video.bunnycdn.com/tusupload",
      isReplacement: isReplace,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status },
      );
    }
    console.error("Bunny upload signature error:", error);

    return NextResponse.json(
      { error: "Failed to generate upload credentials" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params },
) {
  try {
    await requireUser(true);
    const courseId = parsePositiveIntId(params.id);
    const moduleId = parsePositiveIntId(params.moduleId);
    const lessonId = parsePositiveIntId(params.lessonId);
    if (courseId === null || moduleId === null || lessonId === null) {
      return NextResponse.json(
        { error: "Invalid course, module, or lesson ID" },
        { status: 400 },
      );
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        moduleId,
        module: {
          courseId,
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 },
      );
    }

    const isPendingOnly =
      request.nextUrl.searchParams.get("pending") === "true";

    if (isPendingOnly) {
      // Cancel a pending replacement upload:
      // Clean up the pending video from Bunny, but KEEP the committed video completely intact!
      if (lesson.pendingVideoId) {
        const pendingDeleted = await deleteBunnyVideo(lesson.pendingVideoId);
        if (!pendingDeleted) {
          return NextResponse.json(
            {
              error:
                "Failed to delete pending replacement video from Bunny Stream CDN. Please try again.",
            },
            { status: 502 },
          );
        }

        await prisma.lesson.update({
          where: { id: lessonId },
          data: {
            pendingVideoId: null,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Pending replacement cancelled. Original video preserved.",
      });
    }

    // Normal full deletion of lesson's committed video:
    // 1. If there is a pending replacement video, clean it up first
    if (lesson.pendingVideoId) {
      await deleteBunnyVideo(lesson.pendingVideoId).catch((err) =>
        console.error(
          "Failed to clean up pending Bunny video during full deletion:",
          err,
        ),
      );
    }

    // 2. If there is a committed video, delete it from Bunny Stream
    if (lesson.bunnyVideoId) {
      const deleted = await deleteBunnyVideo(lesson.bunnyVideoId);
      if (!deleted) {
        // Do NOT clear database reference if Bunny deletion failed!
        return NextResponse.json(
          {
            error:
              "Failed to delete video from Bunny Stream CDN. Database reference preserved.",
          },
          { status: 502 },
        );
      }
    }

    // 3. Only after Bunny deletion succeeds, update the database record
    try {
      await prisma.lesson.update({
        where: { id: lessonId },
        data: {
          bunnyVideoId: null,
          pendingVideoId: null,
          videoStatus: "NOT_UPLOADED",
          durationSeconds: null,
        },
      });
    } catch (dbError) {
      console.error(
        `CRITICAL: Video ${lesson.bunnyVideoId} was deleted from Bunny CDN, but database record update failed for lesson ${lessonId}:`,
        dbError,
      );

      return NextResponse.json(
        {
          error:
            "Video was removed from Bunny CDN, but updating the database record failed. Please retry.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status },
      );
    }
    console.error("Delete video error:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 },
    );
  }
}

