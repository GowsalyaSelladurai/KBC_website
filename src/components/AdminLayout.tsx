
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import LiquidGoldBackground from "./admin/LiquidGoldBackground";
import GoldenParticleCursor from "./GoldenParticleCursor";
import KBCIntro from "./admin/KBCIntro";

type IntroState = "checking" | "show" | "hidden";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [introState, setIntroState] = useState<IntroState>("checking");
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent duplicate initialization in React Strict Mode.
    if (initialized.current) return;
    initialized.current = true;

    const introKey = "kbc_admin_intro_seen";
    const hasSeenIntro = sessionStorage.getItem(introKey);

    if (!hasSeenIntro) {
      sessionStorage.setItem(introKey, "true");
      setIntroState("show");
    } else {
      setIntroState("hidden");
    }

    // Replay the intro on the next page refresh.
    const handleBeforeUnload = () => {
      sessionStorage.removeItem(introKey);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const closeIntro = useCallback(() => {
    setIntroState("hidden");
  }, []);

  return (
    <>
      <div className="relative isolate min-h-screen w-full overflow-hidden bg-[#121414] text-[#f5f3e8]">
        <LiquidGoldBackground />

        {introState === "hidden" && (
          <>
            <GoldenParticleCursor />
            <AdminSidebar />

            <div className="relative z-10 min-h-screen bg-transparent lg:ml-72">
              <AdminHeader />

              <main className="min-h-screen w-full bg-transparent p-4 sm:p-5 md:p-8">
                {children}
              </main>
            </div>
          </>
        )}
      </div>

      {introState === "checking" && (
        <div
          className="fixed inset-0"
          style={{
            zIndex: 999999,
            background:
              "radial-gradient(circle at center, #29251b 0%, #121414 55%, #080909 100%)",
          }}
        />
      )}

      {introState === "show" && (
        <KBCIntro onComplete={closeIntro} />
      )}
    </>
  );
}
