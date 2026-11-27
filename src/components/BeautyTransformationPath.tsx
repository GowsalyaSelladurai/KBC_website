
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Compass,
  BookOpen,
  Hand,
  Palette,
  Crown,
  ArrowRight,
} from "lucide-react";

const journeyStages = [
  {
    number: "01",
    title: "DISCOVER",
    description: "Find your passion",
    icon: Compass,
  },
  {
    number: "02",
    title: "LEARN",
    description: "Learn from professionals",
    icon: BookOpen,
  },
  {
    number: "03",
    title: "PRACTICE",
    description: "Build your confidence",
    icon: Hand,
  },
  {
    number: "04",
    title: "CREATE",
    description: "Bring ideas to life",
    icon: Palette,
  },
  {
    number: "05",
    title: "SHINE",
    description: "Become the artist",
    icon: Crown,
  },
];

export default function BeautyTransformationPath() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Autoplay may be blocked by the browser.
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="beauty-transformation-path"
      className="relative overflow-hidden bg-[#FAF5ED] py-20 md:py-28"
    >
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-[#EFE8A8]/30 blur-[100px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#C9A45C]/15 blur-[110px]" />

      <div className="wrap relative mx-auto max-w-7xl px-5">

        {/* Heading */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#C9A45C]/40 bg-white/70 px-5 py-2">
            <Sparkles size={15} className="text-[#A98236]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#8D713D]">
              Your Journey Starts Here
            </span>
          </div>

          <h2 className="font-serif text-4xl font-semibold leading-tight text-[#24211D] md:text-6xl">
            From Passion to
            <span className="block text-[#B18A42]">
              Profession.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#70675B] md:text-base">
            Discover your talent, learn new skills, practise your art
            and create a beautiful future with KBC Saloon Academy.
          </p>
        </div>

        {/* Automatic Video Banner */}
        <div className="group relative overflow-hidden rounded-[28px] border border-[#C9A45C]/40 bg-[#171411] shadow-[0_25px_80px_rgba(45,34,17,0.20)]">

          <div className="relative aspect-video min-h-[320px] w-full overflow-hidden bg-[#171411] md:min-h-[520px]">

            {/* Video */}
            <video
              ref={videoRef}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                videoReady ? "opacity-100" : "opacity-0"
              }`}
              src="/videos/beauty-transformation.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onCanPlay={() => setVideoReady(true)}
            />

            {/* Poster / fallback */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                videoReady ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
              style={{
                backgroundImage: "url('/kbc-salon-hero.png')",
              }}
            />

            {/* Video overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/15" />

            <div className="relative z-10 flex h-full min-h-[320px] items-center px-7 py-12 md:min-h-[520px] md:px-16">

              <div className="max-w-2xl">

                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#EFE8A8]/30 bg-black/25 px-4 py-2 backdrop-blur-md">
                  <Sparkles size={14} className="text-[#EFE8A8]" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#EFE8A8]">
                    The KBC Student Journey
                  </span>
                </div>

                <h3 className="font-serif text-4xl font-semibold leading-tight text-[#FAF5ED] md:text-7xl">
                  Every Journey
                  <span className="block text-[#EFE8A8]">
                    Creates a Star.
                  </span>
                </h3>

                <p className="mt-6 max-w-lg text-sm leading-7 text-white/85 md:text-lg">
                  Discover your passion. Learn with experts.
                  Practise your skills. Create your art.
                  Shine with confidence.
                </p>

                <div className="mt-8 flex items-center gap-3">
                  <span className="h-[2px] w-12 bg-[#EFE8A8]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#EFE8A8]">
                    Watch the transformation
                  </span>
                </div>

              </div>

            </div>

            {/* Bottom label */}
            <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between border-t border-white/15 bg-black/30 px-6 py-4 backdrop-blur-sm md:px-10">
              <span className="text-[9px] font-semibold tracking-[0.25em] text-[#EFE8A8]">
                KAVYAS BEAUTY CENTRE
              </span>
              <span className="text-[9px] tracking-[0.2em] text-white/70">
                KBC SALOON ACADEMY
              </span>
            </div>

          </div>
        </div>

        {/* Five stages */}
        <div className="mt-14">

          <div className="mb-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A98236]">
              The Five Steps
            </p>

            <h3 className="mt-3 font-serif text-2xl font-semibold text-[#24211D] md:text-3xl">
              Your Transformation Path
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">

            {journeyStages.map((stage) => {
              const Icon = stage.icon;

              return (
                <div
                  key={stage.number}
                  className="group relative overflow-hidden rounded-2xl border border-[#C9A45C]/25 bg-white/75 p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#C9A45C] hover:shadow-[0_15px_35px_rgba(160,123,53,0.15)]"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFE8A8]/50 text-[#9C7837] transition duration-300 group-hover:bg-[#C9A45C] group-hover:text-white">
                    <Icon size={22} />
                  </div>

                  <p className="text-[9px] font-bold tracking-[0.25em] text-[#B18A42]">
                    STEP {stage.number}
                  </p>

                  <h4 className="mt-2 text-sm font-bold tracking-[0.15em] text-[#29241D]">
                    {stage.title}
                  </h4>

                  <p className="mt-2 text-xs text-[#81776A]">
                    {stage.description}
                  </p>

                </div>
              );
            })}

          </div>
        </div>

        {/* Closing message */}
        <div className="mt-12 text-center">
          <p className="font-serif text-xl italic text-[#766342] md:text-2xl">
            "Your talent is the beginning. Your confidence is the transformation."
          </p>

          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#B18A42]">
            KBC Saloon Academy
          </p>
        </div>

      </div>
    </section>
  );
}
