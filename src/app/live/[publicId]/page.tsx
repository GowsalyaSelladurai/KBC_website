
"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";

type MeetingDetails = {
  token: string;
  serverUrl: string;
  roomName: string;
  sessionTitle: string;
};

export default function LiveClassPage() {
  const params = useParams<{ publicId: string }>();
  const publicId = params.publicId;

  const [participantName, setParticipantName] = useState("");
  const [meeting, setMeeting] = useState<MeetingDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  const joinMeeting = async () => {
    if (!participantName.trim()) {
      setError("Please enter your name before joining.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/live/${encodeURIComponent(publicId)}/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            participantName: participantName.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to join meeting.");
      }

      setMeeting({
        token: result.token,
        serverUrl: result.serverUrl,
        roomName: result.roomName,
        sessionTitle: result.sessionTitle,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the meeting."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnected = useCallback(() => {
    setMeeting(null);
    setConnected(false);
  }, []);

  if (meeting) {
    return (
      <main className="min-h-screen bg-[#121414] p-3 text-white sm:p-5">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#C9A45C]/40 bg-[#1C1D1A] px-5 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A45C]">
                KBC Saloon Academy
              </p>
              <h1 className="mt-1 text-lg font-semibold">
                {meeting.sessionTitle}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {connected ? "Connected" : "Connecting"}
              </span>
            </div>
          </header>

          <section className="min-h-[75vh] overflow-hidden rounded-2xl border border-[#C9A45C]/35 bg-[#1C1D1A]">
            <LiveKitRoom
              token={meeting.token}
              serverUrl={meeting.serverUrl}
              connect={true}
              audio={true}
              video={true}
              onConnected={() => setConnected(true)}
              onDisconnected={handleDisconnected}
              data-lk-theme="default"
              style={{ height: "75vh" }}
            >
              <VideoConference />
              <RoomAudioRenderer />
            </LiveKitRoom>
          </section>

          <p className="text-center text-[10px] tracking-wider text-[#C9A45C]/70">
            KBC SALOON ACADEMY · LIVE LEARNING EXPERIENCE
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAF5ED] px-4 py-10 text-[#121414]">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#EFE8A8]/60 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#E8D8C5]/80 blur-[110px]" />

      <section className="relative w-full max-w-xl overflow-hidden rounded-[30px] border border-[#C9A45C]/60 bg-white shadow-[0_25px_80px_rgba(18,20,20,0.12),0_10px_30px_rgba(201,164,92,0.18)]">
        <div className="h-1.5 bg-gradient-to-r from-[#E8D8C5] via-[#EFE8A8] to-[#C9A45C]" />

        <div className="p-7 sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[25px] border border-[#C9A45C]/50 bg-gradient-to-br from-[#EFE8A8] to-[#E8D8C5] shadow-lg">
            <span className="font-serif text-5xl italic text-[#A17A32]">
              K
            </span>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#C9A45C]">
              KBC Saloon Academy
            </p>

            <h1 className="mt-3 font-serif text-3xl sm:text-4xl">
              Live <span className="italic text-[#C9A45C]">Classroom</span>
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#121414]/55">
              Welcome to your live learning session. Enter your name below
              to join the classroom.
            </p>
          </div>

          <div className="mt-9">
            <label className="mb-2 block text-xs font-bold">
              Your Name
            </label>

            <input
              value={participantName}
              onChange={(event) => setParticipantName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") joinMeeting();
              }}
              placeholder="Enter your name"
              maxLength={60}
              className="w-full rounded-xl border border-[#C9A45C]/50 bg-[#FAF5ED] px-4 py-4 text-sm outline-none transition focus:border-[#C9A45C] focus:ring-4 focus:ring-[#EFE8A8]/50"
            />

            {error && (
              <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={joinMeeting}
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-[#C9A45C] bg-gradient-to-br from-[#EFE8A8] via-[#EFE8A8] to-[#C9A45C] px-6 py-4 text-sm font-bold text-[#121414] shadow-[0_8px_22px_rgba(201,164,92,0.3)] transition hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(201,164,92,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="animate-spin">◌</span>
                  Connecting...
                </>
              ) : (
                <>
                  <span>▶</span>
                  Join Live Class
                </>
              )}
            </button>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3 border-t border-[#C9A45C]/20 pt-6">
            {[
              { icon: "🎙", label: "Audio" },
              { icon: "📹", label: "Video" },
              { icon: "💬", label: "Chat" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-[#C9A45C]/25 bg-[#FAF5ED] p-3 text-center"
              >
                <span className="text-xl">{item.icon}</span>
                <p className="mt-1 text-[10px] font-semibold text-[#121414]/60">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-[10px] text-[#121414]/40">
            Beauty · Education · Excellence
          </p>
        </div>
      </section>
    </main>
  );
}
