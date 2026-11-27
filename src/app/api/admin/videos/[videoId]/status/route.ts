import { NextRequest, NextResponse } from "next/server";
import { HttpError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import {
  getBunnyConfig,
  getBunnyEmbedUrl,
  getBunnyVideoOptional,
} from "@/lib/bunny";

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } },
) {
  try {
    await requireUser(true);
    const { videoId } = params;
    const afterUpload =
      request.nextUrl.searchParams.get("afterUpload") === "1";

    const { libraryId } = getBunnyConfig();
    const bunnyVideo = await getBunnyVideoOptional(videoId);

    if (!bunnyVideo) {
      return NextResponse.json(
        {
          exists: false,
          videoStatus: "UNAVAILABLE",
          durationSeconds: null,
          embedUrl: null,
          error: "Video is unavailable or no longer exists in Bunny Stream.",
        },
        { status: 404 },
      );
    }

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
        videoStatus = afterUpload ? "PROCESSING" : "NOT_UPLOADED";
        break;
    }

    const durationSeconds =
      typeof bunnyVideo.length === "number" && bunnyVideo.length > 0
        ? Math.round(bunnyVideo.length)
        : null;

    return NextResponse.json({
      exists: true,
      videoStatus,
      durationSeconds,
      embedUrl: getBunnyEmbedUrl(libraryId, videoId),
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status },
      );
    }
    console.error("Draft video status check error:", error);
    return NextResponse.json(
      { error: "Unable to check video status." },
      { status: 500 },
    );
  }
}
