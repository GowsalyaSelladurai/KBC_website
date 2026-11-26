
import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    publicId: string;
  }>;
};

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { publicId } = await params;

    const body = await request.json();
    const participantName =
      typeof body.participantName === "string"
        ? body.participantName.trim()
        : "";

    if (!participantName || participantName.length > 60) {
      return NextResponse.json(
        { success: false, message: "Enter a valid participant name." },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json(
        { success: false, message: "LiveKit environment variables are missing." },
        { status: 500 }
      );
    }

    const session = await prisma.liveSession.findUnique({
      where: { publicId },
      select: {
        id: true,
        publicId: true,
        title: true,
        roomName: true,
        status: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Live class session not found." },
        { status: 404 }
      );
    }

    if (session.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, message: "This live class has been cancelled." },
        { status: 403 }
      );
    }

    if (!session.roomName) {
      return NextResponse.json(
        { success: false, message: "Meeting room is not configured." },
        { status: 500 }
      );
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: `${participantName}-${Date.now()}`,
      name: participantName,
      ttl: "2h",
    });

    token.addGrant({
      roomJoin: true,
      room: session.roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    return NextResponse.json({
      success: true,
      token: jwt,
      serverUrl: livekitUrl,
      roomName: session.roomName,
      sessionTitle: session.title,
    });
  } catch (error) {
    console.error("LiveKit token error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to join the live class." },
      { status: 500 }
    );
  }
}
