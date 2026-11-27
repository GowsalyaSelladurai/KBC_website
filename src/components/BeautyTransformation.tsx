
"use client";

import { useState } from "react";
import {
  Sparkles,
  MoveHorizontal,
  Heart,
  Camera,
  Award,
} from "lucide-react";

export default function BeautyTransformation() {
  const [position, setPosition] = useState(50);

  const beforeImage =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop";

  const afterImage =
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1000&auto=format&fit=crop";

  const goldCard =
    "group relative rounded-2xl border border-[#C9A45C]/40 bg-white/80 p-5 shadow-[0_4px_18px_rgba(120,85,30,0.08)] transition-all duration-500 hover:-translate-y-2 hover:border-[#C9A45C] hover:shadow-[0_0_12px_rgba(201,164,92,0.45),0_0_30px_rgba(201,164,92,0.3),0_15px_35px_rgba(120,85,30,0.16)]";

  return (
    <section className="relative isolate overflow-hidden bg-[#FAF5ED] px-5 py-20 sm:px-8 lg:py-28">
      <div className="pointer-events-none absolute -left-32 top-20 -z-10 h-80 w-80 rounded-full bg-[#EFE8A8]/35 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-10 -z-10 h-80 w-80 rounded-full bg-[#C9A45C]/20 blur-[100px]" />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#C9A45C]/50 bg-white/80 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.28em] text-[#987638] shadow-sm">
            <Sparkles size={15} />
            The Art of Transformation
          </div>

          <h2 className="font-serif text-4xl leading-tight text-[#242424] sm:text-5xl lg:text-6xl">
            Beauty Before.
            <span className="mt-2 block bg-gradient-to-r from-[#987638] via-[#D6BB79] to-[#987638] bg-clip-text text-transparent">
              Beauty After.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-[#777064] sm:text-base">
            Discover the magic of professional beauty artistry.
            From elegant makeup to glamorous bridal transformations,
            creativity becomes an art at KBC Saloon Academy.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Before and After Card */}
          <div className="group relative">
            {/* Animated golden glow */}
            <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-br from-[#EFE8A8] via-[#C9A45C] to-[#987638] opacity-40 blur-xl transition-all duration-500 group-hover:opacity-90 group-hover:blur-2xl" />

            <div className="relative overflow-hidden rounded-[1.6rem] border border-[#C9A45C]/70 bg-[#171717] shadow-[0_8px_30px_rgba(120,85,30,0.15)] transition-all duration-500 group-hover:border-[#EFE8A8] group-hover:shadow-[0_0_15px_rgba(239,232,168,0.5),0_0_40px_rgba(201,164,92,0.35)]">
              <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[5/4]">
                <img
                  src={afterImage}
                  alt="Sample beauty transformation after look"
                  draggable={false}
                  className="absolute inset-0 h-full w-full select-none object-cover"
                />

                <div
                  className="absolute inset-y-0 left-0 z-10 overflow-hidden"
                  style={{ width: `${position}%` }}
                >
                  <img
                    src={beforeImage}
                    alt="Sample natural beauty before look"
                    draggable={false}
                    className="absolute inset-y-0 left-0 h-full max-w-none select-none object-cover"
                    style={{ width: "var(--slider-image-width)" }}
                  />
                </div>

                <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-white/50 bg-black/65 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md sm:left-6 sm:top-6">
                  Before
                </div>

                <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full border border-[#EFE8A8]/70 bg-black/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#EFE8A8] backdrop-blur-md sm:right-6 sm:top-6">
                  After
                </div>

                <div
                  className="pointer-events-none absolute bottom-0 top-0 z-20 w-[3px] bg-[#EFE8A8] shadow-[0_0_18px_rgba(239,232,168,0.9)]"
                  style={{ left: `${position}%` }}
                />

                <div
                  className="pointer-events-none absolute top-1/2 z-30 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-[#EFE8A8] bg-[#171717] text-[#EFE8A8] shadow-[0_0_25px_rgba(239,232,168,0.55)] transition-transform duration-300 group-hover:scale-110"
                  style={{ left: `${position}%` }}
                >
                  <MoveHorizontal size={21} />
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={position}
                  onChange={(event) =>
                    setPosition(Number(event.target.value))
                  }
                  aria-label="Drag to compare before and after"
                  className="absolute inset-0 z-40 h-full w-full cursor-ew-resize opacity-0"
                />

                <style jsx>{`
                  div:has(> input[type="range"]) {
                    --slider-image-width: ${100 / (position / 100 || 1)}%;
                  }
                `}</style>
              </div>

              <div className="flex items-center justify-between gap-3 bg-[#171717] px-5 py-4 sm:px-7">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#EFE8A8]">
                  <MoveHorizontal size={15} />
                  Drag to explore
                </div>
                <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">
                  Natural <span className="text-[#C9A45C]">/</span> Glamour
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-7">
            <div>
              <p className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#A47B37]">
                <Sparkles size={15} />
                Creativity Meets Technique
              </p>

              <h3 className="font-serif text-3xl leading-snug text-[#242424] sm:text-4xl lg:text-5xl">
                Every transformation
                <span className="block text-[#A47B37]">
                  tells a beautiful story.
                </span>
              </h3>

              <p className="mt-6 text-sm leading-8 text-[#777064] sm:text-base">
                Beauty is more than makeup. It is confidence,
                creativity and the art of bringing out someone's
                unique beauty through professional techniques.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Professional makeup artistry",
                "Luxury bridal makeup techniques",
                "Creative hair styling",
                "Beauty and makeover skills",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#C9A45C]/50 bg-white text-[#A47B37] shadow-sm transition-all duration-300 hover:border-[#C9A45C] hover:shadow-[0_0_15px_rgba(201,164,92,0.45)]">
                    <Sparkles size={15} />
                  </span>
                  <span className="text-sm font-medium text-[#49443C]">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* Golden Glow Highlight Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className={goldCard}>
                <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[#EFE8A8]/0 via-[#C9A45C]/0 to-[#987638]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-30" />
                <div className="relative">
                  <Camera className="mb-3 text-[#A47B37] transition-all duration-300 group-hover:scale-110 group-hover:text-[#C9A45C] group-hover:drop-shadow-[0_0_8px_rgba(201,164,92,0.7)]" size={23} />
                  <p className="font-serif text-lg text-[#242424]">
                    Learn
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#777064]">
                    Practical beauty techniques
                  </p>
                </div>
              </div>

              <div className={goldCard}>
                <div className="relative">
                  <Award className="mb-3 text-[#A47B37] transition-all duration-300 group-hover:scale-110 group-hover:text-[#C9A45C] group-hover:drop-shadow-[0_0_8px_rgba(201,164,92,0.7)]" size={23} />
                  <p className="font-serif text-lg text-[#242424]">
                    Create
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#777064]">
                    Your own beauty artistry
                  </p>
                </div>
              </div>
            </div>

            {/* Quote Card */}
            <div className="group relative rounded-2xl">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#EFE8A8] via-[#C9A45C] to-[#987638] opacity-20 blur-md transition-all duration-500 group-hover:opacity-70 group-hover:blur-lg" />
              <div className="relative rounded-2xl border border-[#C9A45C]/40 bg-gradient-to-r from-white to-[#F5EEDC] p-5 shadow-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:border-[#C9A45C] group-hover:shadow-[0_0_15px_rgba(201,164,92,0.3),0_10px_30px_rgba(120,85,30,0.12)]">
                <div className="flex items-start gap-3">
                  <Heart className="mt-1 shrink-0 text-[#A47B37]" size={20} />
                  <div>
                    <p className="font-serif text-xl leading-snug text-[#8F713D]">
                      Your creativity. Your artistry. Your future.
                    </p>
                    <p className="mt-2 text-xs leading-6 text-[#777064]">
                      Discover your potential with KBC Saloon Academy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-[10px] uppercase tracking-[0.2em] text-[#9A8B70]">
          Sample photography · Replace with actual KBC student work
        </p>
      </div>
    </section>
  );
}
