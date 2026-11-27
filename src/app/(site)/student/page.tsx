"use client";
import { useState } from "react";
import Link from "next/link";
import LiveList from "@/components/LiveList";

export default function Student() {
  const [tab, setTab] = useState("courses");

  return (
    <div className="wrap py-10">
      <h1 className="text-3xl font-bold">
        Student <span className="text-gold">Portal</span>
      </h1>
      <div className="mb-4 mt-5 flex gap-2">
        {[
          ["courses", "My courses"],
          ["live", "Live classes"],
          ["rec", "Recordings"],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-full border px-4 py-1.5 text-sm ${
              tab === k
                ? "border-gold bg-gold text-ink"
                : "border-line text-mute"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "courses" && (
        <div className="card p-8 text-center">
          <p className="text-sm text-mute">No enrolled courses yet.</p>
          <Link href="/courses" className="btn btn-sm mt-4 inline-block">
            Browse Courses
          </Link>
        </div>
      )}
      {tab === "live" && <LiveList />}
      {tab === "rec" && (
        <div className="card !p-4 text-sm text-mute">
          No recordings available.
        </div>
      )}
    </div>
  );
}
