import { NextRequest, NextResponse } from "next/server";
import { HttpError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getBunnyConfig, getBunnyEmbedUrl } from "@/lib/bunny";

/**
 * Server-side thumbnail proxy for Bunny Stream videos.
 * Resolves the video's thumbnail from Bunny without exposing libraryId or API keys to client code.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { videoId: string } },
) {
  try {
    await requireUser(true);
    const { videoId } = params;
    if (!videoId || !/^[a-zA-Z0-9-]+$/.test(videoId)) {
      return new NextResponse(null, { status: 400 });
    }

    const { libraryId } = getBunnyConfig();
    const embedUrl = getBunnyEmbedUrl(libraryId, videoId);

    const embedRes = await fetch(embedUrl, {
      headers: { Accept: "text/html" },
      next: { revalidate: 3600 },
    });

    if (!embedRes.ok) {
      return new NextResponse(null, { status: 404 });
    }

    const html = await embedRes.text();
    const ogMatch =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      );

    const thumbnailUrl = ogMatch?.[1];
    if (!thumbnailUrl || !thumbnailUrl.startsWith("http")) {
      return new NextResponse(null, { status: 404 });
    }

    const imgRes = await fetch(thumbnailUrl, {
      next: { revalidate: 3600 },
    });

    if (!imgRes.ok) {
      return new NextResponse(null, { status: 404 });
    }

    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const buffer = await imgRes.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { error: error.message, message: error.message },
        { status: error.status },
      );
    }
    console.error("Video thumbnail fetch error:", error);
    return new NextResponse(null, { status: 404 });
  }
}
