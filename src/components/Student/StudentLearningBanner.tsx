
"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  Sparkles,
  GraduationCap,
  Award,
  TrendingUp,
} from "lucide-react";

type StudentLearningBannerProps = {
  progress: number;
  onExploreCourses: () => void;
};

export default function StudentLearningBanner({
  progress,
  onExploreCourses,
}: StudentLearningBannerProps) {
  const safeProgress = Math.min(100, Math.max(0, progress));

  return (
    <section className="group relative isolate min-h-[390px] overflow-hidden
      rounded-[30px] border border-[#B89970]/30 bg-[#171717]
      shadow-[0_20px_60px_rgba(0,0,0,0.25)]">

      {/* Background glow */}
      <div className="pointer-events-none absolute -left-24 -top-28
        h-72 w-72 rounded-full bg-[#B89970]/10 blur-[100px]" />

      <div className="grid min-h-[390px] md:grid-cols-[1.05fr_0.95fr]">

        {/* LEFT CONTENT */}
        <div className="relative z-10 flex flex-col justify-center
          px-7 py-10 sm:px-10 lg:px-12">

          <div className="mb-7 flex w-fit items-center gap-2 rounded-full
            border border-[#B89970]/40 bg-[#B89970]/10 px-4 py-2">
            <Sparkles size={14} className="text-[#D9C77A]" />
            <span className="text-[10px] font-semibold uppercase
              tracking-[0.28em] text-[#D9C77A]">
              KBC Academy • Learning Studio
            </span>
          </div>

          <p className="mb-3 text-sm font-medium tracking-wide text-[#B89970]">
            Your Beauty Learning Journey
          </p>

          <h1 className="max-w-xl text-4xl font-semibold leading-[1.12]
            tracking-tight text-[#F5F0E8] sm:text-5xl">
            Welcome Back!
            <span className="mt-2 block font-serif italic
              text-[#D9C77A]">
              Create. Learn. Shine.
            </span>
          </h1>

          <p className="mt-5 max-w-md text-sm leading-7 text-[#C9C1B6]">
            Sustain your growth journey and fulfill your aspirations.
            Discover your potential and master your beauty skills.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">

            <button
              onClick={onExploreCourses}
              className="group/btn inline-flex items-center gap-3
                rounded-full bg-gradient-to-r from-[#B89970]
                via-[#E8DDCE] to-[#B89970] px-6 py-3.5
                text-sm font-bold text-[#171717]
                shadow-[0_8px_25px_rgba(184,153,112,0.2)]
                transition-all duration-300
                hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(184,153,112,0.35)]"
            >
              Explore Courses
              <ArrowUpRight
                size={18}
                className="transition-transform group-hover/btn:translate-x-1
                  group-hover/btn:-translate-y-1"
              />
            </button>

            <div className="flex items-center gap-2 text-xs text-[#D9CFC1]">
              <Award size={17} className="text-[#D9C77A]" />
              Learn from experts
            </div>
          </div>

          {/* Progress card */}
          <div className="mt-9 max-w-[340px] rounded-2xl
            border border-white/10 bg-white/[0.06] p-4
            shadow-lg backdrop-blur-xl">

            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={18} className="text-[#D9C77A]" />
                <span className="text-xs font-medium text-[#F5F0E8]">
                  Your Learning Progress
                </span>
              </div>

              <span className="text-sm font-bold text-[#D9C77A]">
                {safeProgress}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r
                  from-[#B89970] to-[#EFE8A8] transition-all duration-700"
                style={{ width: `${safeProgress}%` }}
              />
            </div>

            <div className="mt-3 flex items-center gap-2 text-[11px]
              text-[#BEB5A9]">
              <TrendingUp size={13} className="text-[#D9C77A]" />
              Every lesson brings you closer to mastery
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative min-h-[300px] overflow-hidden md:min-h-full">

          <Image
            src="/beauty-interior.jpg"
            alt="Elegant KBC Academy beauty interior"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center
              transition-transform duration-[1200ms]
              group-hover:scale-105"
          />

          {/* Image lighting */}
          <div className="absolute inset-0 bg-gradient-to-t
            from-[#171717]/45 via-transparent to-[#171717]/10" />

          <div className="absolute inset-0 bg-gradient-to-r
            from-[#171717]/30 via-transparent to-transparent" />

          {/* Floating glass label */}
          <div className="absolute bottom-6 right-6
            rounded-2xl border border-white/30
            bg-black/30 px-5 py-4 text-white
            shadow-2xl backdrop-blur-xl">

            <p className="text-[10px] uppercase tracking-[0.25em]
              text-[#EFE8A8]">
              Beauty & Excellence
            </p>

            <p className="mt-1 font-serif text-xl">
              Your journey starts here.
            </p>
          </div>

          {/* Decorative gold corner */}
          <div className="pointer-events-none absolute right-0 top-0
            h-28 w-28 rounded-bl-full border-b border-l
            border-[#D9C77A]/40" />
        </div>
      </div>
    </section>
  );
}
