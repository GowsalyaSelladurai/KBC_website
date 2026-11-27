import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { HttpError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { createBunnyVideo, getBunnyEmbedUrl } from "@/lib/bunny";

/**
 * Prepares a Bunny Stream TUS upload session for an unsaved/draft lesson
 * without prematurely creating Course, Module, or Lesson rows in PostgreSQL.
 */
export async function POST(request: NextRequest) {
  try {
    await requireUser(true);
    let title = "Lesson Video";
    try {
      const body = await request.json();
      if (typeof body?.title === "string" && body.title.trim()) {
        title = body.title.trim();
      }
    } catch {
      // optional body
    }

    const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const apiKey = process.env.BUNNY_STREAM_API_KEY;

    if (!libraryId || !apiKey) {
      return NextResponse.json(
        { error: "Video upload configuration is missing." },
        { status: 500 },
      );
    }

    const created = await createBunnyVideo(title);
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;
    const signature = createHash("sha256")
      .update(`${libraryId}${apiKey}${expirationTime}${created.videoId}`)
      .digest("hex");

    return NextResponse.json({
      videoId: created.videoId,
      libraryId: created.libraryId,
      expirationTime,
      signature,
      endpoint: "https://video.bunnycdn.com/tusupload",
      embedUrl: getBunnyEmbedUrl(created.libraryId, created.videoId),
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status },
      );
    }
    console.error("Prepare draft video upload error:", error);
    return NextResponse.json(
      { error: "Could not start video upload. Please try again." },
      { status: 500 },
    );
  }
}
