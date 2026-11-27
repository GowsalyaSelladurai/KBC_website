const BUNNY_API_BASE = "https://video.bunnycdn.com";

export function getBunnyConfig() {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const apiKey = process.env.BUNNY_STREAM_API_KEY;

  if (!libraryId || !apiKey) {
    throw new Error("Bunny Stream environment variables are missing");
  }

  return { libraryId, apiKey };
}

export function getBunnyEmbedUrl(libraryId: string, videoId: string): string {
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&preload=true`;
}

export type BunnyPlaybackInfo = {
  embedUrl: string;
  tokenProtected: boolean;
  expiresAt: string | null;
  securityNote: string;
};

/**
 * Builds a playback embed URL for an already-authorized lesson video.
 * Keeps Bunny Stream credentials strictly server-side.
 *
 * Note: Bunny Stream Token Authentication (`BUNNY_STREAM_TOKEN_SECURITY_KEY`)
 * is not configured yet, so `tokenProtected` is explicitly `false`.
 */
export function getAuthorizedBunnyPlayback(videoId: string): BunnyPlaybackInfo {
  const { libraryId } = getBunnyConfig();
  const hasTokenKey = Boolean(
    process.env.BUNNY_STREAM_TOKEN_SECURITY_KEY?.trim(),
  );

  // Token signing is intentionally not fabricated when BUNNY_STREAM_TOKEN_SECURITY_KEY
  // is absent. Once enabled in Bunny Stream and configured in .env, signed embed
  // URLs with expiration can be generated here without changing callers.
  return {
    embedUrl: getBunnyEmbedUrl(libraryId, videoId),
    tokenProtected: false,
    expiresAt: null,
    securityNote: hasTokenKey
      ? "Token key detected, but token signing is not yet enabled in getAuthorizedBunnyPlayback."
      : "Bunny Stream Token Authentication is not configured; playback URL is not token-signed.",
  };
}

export async function createBunnyVideo(title: string) {
  const { libraryId, apiKey } = getBunnyConfig();

  const response = await fetch(
    `${BUNNY_API_BASE}/library/${libraryId}/videos`,
    {
      method: "POST",
      headers: {
        AccessKey: apiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bunny API error (${response.status}): ${errorText}`);
  }

  const video = await response.json();

  return {
    libraryId,
    videoId: video.guid as string,
    title: video.title as string,
  };
}

export class BunnyApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function getBunnyVideo(videoId: string) {
  const { libraryId, apiKey } = getBunnyConfig();

  const response = await fetch(
    `${BUNNY_API_BASE}/library/${libraryId}/videos/${videoId}`,
    {
      headers: {
        AccessKey: apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new BunnyApiError(
      response.status,
      `Bunny API error (${response.status}): ${errorText}`,
    );
  }

  return await response.json();
}

export async function getBunnyVideoOptional(videoId: string) {
  try {
    return await getBunnyVideo(videoId);
  } catch (err) {
    if (err instanceof BunnyApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function deleteBunnyVideo(videoId: string): Promise<boolean> {
  try {
    const { libraryId, apiKey } = getBunnyConfig();

    const response = await fetch(
      `${BUNNY_API_BASE}/library/${libraryId}/videos/${videoId}`,
      {
        method: "DELETE",
        headers: {
          AccessKey: apiKey,
          Accept: "application/json",
        },
      }
    );

    // 200/204 means deleted; 404 means video does not exist / already deleted on Bunny CDN.
    // In both cases, the video no longer exists on Bunny CDN.
    if (response.ok || response.status === 404) {
      return true;
    }

    const errorText = await response.text().catch(() => "");
    console.error(`Bunny video delete failed (${response.status}):`, errorText);
    return false;
  } catch (error) {
    console.error(`Failed to delete Bunny video ${videoId}:`, error);
    return false;
  }
}
