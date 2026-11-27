
"use client";

import { useEffect, useState } from "react";
import { Sparkles, CalendarDays } from "lucide-react";

export default function OwnerWelcome() {
  const [greeting, setGreeting] = useState("Welcome");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour >= 5 && hour < 12) {
        setGreeting("Good Morning");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good Afternoon");
      } else {
        setGreeting("Good Evening");
      }

      setDate(
        now.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };

    updateGreeting();
    const timer = window.setInterval(updateGreeting, 60000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="kbc-welcome relative mb-8 overflow-hidden rounded-2xl border border-[#EFE8A8]/20 p-6 sm:p-9">

      {/* Animated glow */}
      <div className="kbc-welcome-glow kbc-welcome-glow-one" />
      <div className="kbc-welcome-glow kbc-welcome-glow-two" />

      {/* Floating particles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="kbc-welcome-particle"
          style={{
            left: `${5 + ((i * 17) % 90)}%`,
            top: `${12 + ((i * 23) % 75)}%`,
            animationDelay: `${i * -0.45}s`,
            animationDuration: `${3 + (i % 4)}s`,
          }}
        />
      ))}

      {/* Light sweep */}
      <div className="kbc-welcome-sweep" />

      <div className="relative z-10">

        <div className="kbc-welcome-label mb-5 flex items-center gap-2">
          <Sparkles size={16} className="text-[#EFE8A8]" />
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#EFE8A8]">
            KBC Salon Academy
          </span>
        </div>

        <h1 className="kbc-welcome-heading text-3xl font-semibold tracking-tight text-[#f5f3e8] sm:text-5xl">
          {greeting}
          <br className="sm:hidden" />
          <span className="kbc-welcome-name">
            {" "}Kavya!
          </span>
        </h1>

        <p className="kbc-welcome-subtitle mt-4 max-w-xl text-sm leading-7 text-[#c5c1ae] sm:text-base">
          Welcome back! Your academy is ready for another beautiful day.
          Let's make today exceptional.
        </p>

        <div className="kbc-welcome-date mt-7 flex items-center gap-2 text-sm text-[#c9c5ae]">
          <CalendarDays size={16} className="text-[#EFE8A8]" />
          <span>{date}</span>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#EFE8A8]/80 to-transparent" />
    </section>
  );
}
