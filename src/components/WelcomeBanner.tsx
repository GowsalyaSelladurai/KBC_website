
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Sparkles,
  GraduationCap,
  Play,
} from "lucide-react";

const slides = [
  {
    image: "/kbc-salon-hero.png",
    category: "WELCOME TO KBC",
    title: "The Art of Beauty",
    description:
      "Discover your creativity and begin your journey into the world of professional beauty.",
    duration: "Welcome",
  },
  {
    image: "/makeup.png",
    category: "PROFESSIONAL MAKEUP",
    title: "Create Beautiful Transformations",
    description:
      "Master professional makeup techniques, bridal looks, HD makeup and more.",
    duration: "7 Days",
  },
  {
    image: "/hairstlye.png",
    category: "HAIR STYLING",
    title: "Style Beyond Imagination",
    description:
      "Learn beautiful hairstyles, professional blow-drying, curls and elegant updos.",
    duration: "2 Days",
  },
  {
    image: "/nailart.png",
    category: "NAIL ART",
    title: "Turn Nails Into Art",
    description:
      "Explore creative nail designs, nail shaping, care and beautiful gel art.",
    duration: "1 Day",
  },
  {
    image: "/saree%20pleating.png",
    category: "SAREE PLEATING",
    title: "Master The Perfect Draping",
    description:
      "Learn elegant saree draping, professional pleating and perfect finishing.",
    duration: "1 Day",
  },
];

const transitions = [
  "cinematic-fade",
  "horizontal-slide",
  "vertical-reveal",
  "blur-clear",
  "diagonal-wipe",
  "circular-reveal",
  "split-reveal",
  "three-d-flip",
  "parallax-zoom",
  "curtain-reveal",
  "light-sweep",
  "morph-zoom",
];

/* Shared card interaction */
const goldHover =
  "transition-all duration-500 ease-out hover:-translate-y-1 hover:border-[#8C692C] hover:bg-gradient-to-br hover:from-[#FFF4CE] hover:via-[#E8D39A] hover:to-[#C9A45C] hover:text-[#17140D] hover:shadow-[0_0_22px_rgba(239,232,168,0.5),0_0_45px_rgba(201,164,92,0.35)] active:border-[#8C692C] active:bg-gradient-to-br active:from-[#FFF4CE] active:via-[#E8D39A] active:to-[#C9A45C] active:text-[#17140D] active:shadow-[0_0_22px_rgba(239,232,168,0.5),0_0_45px_rgba(201,164,92,0.35)]";

const infoCard =
  `group flex items-center gap-4 rounded-2xl border border-[#C9A45C]/55 bg-[#12110E] px-5 py-4 text-[#FAF5ED] shadow-[0_0_12px_rgba(201,164,92,0.08)] ${goldHover}`;

const infoIcon =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#C9A45C]/70 bg-[#C9A45C]/10 text-[#EFE8A8] transition-all duration-500 group-hover:border-[#8C692C] group-hover:bg-[#17140D]/10 group-hover:text-[#5D4218] group-hover:shadow-[0_0_18px_rgba(100,70,20,0.2)] group-active:border-[#8C692C] group-active:bg-[#17140D]/10 group-active:text-[#5D4218]";

export default function WelcomeBanner() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [transitionCount, setTransitionCount] = useState(0);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      setCurrentDate(
        now.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      );

      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };

    updateDateTime();

    const clock = setInterval(updateDateTime, 60000);

    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    const slideshow = setInterval(() => {
      setActiveSlide((previous) => (previous + 1) % slides.length);
      setTransitionCount((previous) => (previous + 1) % transitions.length);
    }, 5000);

    return () => clearInterval(slideshow);
  }, []);

  const currentSlide = slides[activeSlide];
  const currentTransition = transitions[transitionCount];

  const goToSlide = (index: number) => {
    setActiveSlide(index);
    setTransitionCount((previous) => (previous + 1) % transitions.length);
  };

  return (
    <section className="relative isolate min-h-[760px] overflow-hidden bg-[#080807] text-[#FAF5ED] sm:min-h-[790px] lg:min-h-[820px]">
      {/* BACKGROUND SLIDESHOW */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <img
          key={`${activeSlide}-${transitionCount}`}
          src={currentSlide.image}
          alt={currentSlide.category}
          className={`welcome-slide welcome-${currentTransition}`}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#080807]/95 via-[#121414]/80 to-[#121414]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080807] via-transparent to-[#080807]/35" />
      </div>

      {/* LIGHT SWEEP EFFECT */}
      {currentTransition === "light-sweep" && (
        <div
          key={`light-${transitionCount}`}
          className="welcome-light-sweep pointer-events-none absolute inset-0 z-[-1]"
        />
      )}

      {/* GOLD AMBIENT GLOW */}
      <div className="pointer-events-none absolute -left-40 top-20 -z-10 h-[400px] w-[400px] rounded-full bg-[#C9A45C]/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 -z-10 h-[450px] w-[450px] rounded-full bg-[#EFE8A8]/10 blur-[140px]" />

      {/* MAIN CONTENT */}
      <div className="relative mx-auto flex min-h-[760px] max-w-[1500px] flex-col justify-center px-5 pb-28 pt-24 sm:min-h-[790px] sm:px-10 lg:min-h-[820px] lg:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          {/* LEFT CONTENT */}
          <div className="relative z-10 max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#C9A45C]/60 bg-[#080807]/90 px-5 py-2.5 shadow-[0_0_20px_rgba(201,164,92,0.15)] backdrop-blur-md">
              <Sparkles size={16} className="text-[#EFE8A8]" />
              <span className="text-[10px] font-semibold tracking-[0.32em] text-[#EFE8A8] sm:text-xs">
                KBC SALOON ACADEMY
              </span>
            </div>

            <div
              key={`content-${activeSlide}`}
              className="welcome-content-enter"
            >
              <p className="mb-5 text-xs font-semibold tracking-[0.35em] text-[#EFE8A8] sm:text-sm">
                {currentSlide.category}
              </p>

              <h1 className="max-w-3xl font-serif text-5xl font-medium leading-[1.08] tracking-tight text-[#FAF5ED] sm:text-6xl md:text-7xl lg:text-[82px]">
                Welcome to the
                <span className="mt-2 block bg-gradient-to-r from-[#EFE8A8] via-[#C9A45C] to-[#F8E7B0] bg-clip-text text-transparent">
                  Art of Beauty.
                </span>
                <span className="mt-3 block text-3xl leading-tight text-[#FAF5ED]/90 sm:text-4xl md:text-5xl lg:text-6xl">
                  Where Excellence Begins.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-sm leading-8 text-[#FAF5ED]/75 sm:text-base sm:leading-9">
                {currentSlide.description}
              </p>

              <div className="mt-5 flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-[#EFE8A8]">
                <span className="h-px w-10 bg-[#C9A45C]" />
                {currentSlide.title}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/courses"
                className="group inline-flex items-center gap-3 rounded-full border border-[#EFE8A8] bg-gradient-to-r from-[#EFE8A8] to-[#C9A45C] px-7 py-4 text-sm font-bold tracking-wide text-[#121414] shadow-[0_0_25px_rgba(201,164,92,0.3)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_45px_rgba(201,164,92,0.65)]"
              >
                Explore Courses
                <ArrowUpRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-3 rounded-full border border-[#C9A45C]/80 bg-[#080807]/90 px-7 py-4 text-sm font-semibold tracking-wide text-[#FAF5ED] shadow-[0_0_18px_rgba(201,164,92,0.12)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-[#EFE8A8] hover:bg-[#1A1812] hover:shadow-[0_0_30px_rgba(201,164,92,0.4)]"
              >
                <Play size={15} className="text-[#EFE8A8]" />
                Student Login
              </Link>
            </div>
          </div>

          {/* RIGHT COURSE SHOWCASE CARD */}
          <div className="relative mx-auto hidden w-full max-w-[460px] lg:block">
            <div className="absolute -inset-8 rounded-[40px] bg-[#C9A45C]/20 blur-[65px] transition-all duration-500 group-hover:bg-[#EFE8A8]/35" />

            <div
              key={`showcase-${activeSlide}`}
              className={`welcome-showcase group relative overflow-hidden rounded-[30px] border border-[#C9A45C]/80 bg-[#080807] p-3 text-[#FAF5ED] shadow-[0_0_25px_rgba(201,164,92,0.25),0_20px_80px_rgba(0,0,0,0.75)] ${goldHover}`}
            >
              <div className="relative h-[430px] overflow-hidden rounded-[23px] border border-[#C9A45C]/40">
                <img
                  src={currentSlide.image}
                  alt={currentSlide.category}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#080807] via-[#121414]/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <span className="inline-flex rounded-full border border-[#C9A45C]/80 bg-[#080807] px-4 py-2 text-[10px] font-semibold tracking-[0.25em] text-[#EFE8A8] shadow-[0_0_15px_rgba(201,164,92,0.25)]">
                    FEATURED EXPERIENCE
                  </span>

                  <h2 className="mt-4 font-serif text-3xl text-[#FAF5ED]">
                    {currentSlide.title}
                  </h2>

                  <div className="mt-4 flex items-center gap-2 text-sm text-[#EFE8A8]">
                    <GraduationCap size={17} />
                    {currentSlide.duration}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-b-[20px] bg-[#080807] px-4 py-4 transition-colors duration-500 group-hover:bg-transparent group-active:bg-transparent">
                <div>
                  <p className="text-[10px] tracking-[0.25em] text-[#C9A45C] transition-colors group-hover:text-[#76551D] group-active:text-[#76551D]">
                    DISCOVER YOUR POTENTIAL
                  </p>
                  <p className="mt-1 text-sm text-[#FAF5ED] transition-colors group-hover:text-[#17140D] group-active:text-[#17140D]">
                    Learn. Create. Shine.
                  </p>
                </div>

                <Link
                  href="/courses"
                  aria-label="Explore courses"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C9A45C] bg-[#1A1812] text-[#EFE8A8] shadow-[0_0_12px_rgba(201,164,92,0.2)] transition-all duration-300 hover:border-[#17140D] hover:bg-[#17140D] hover:text-[#EFE8A8] hover:shadow-[0_0_25px_rgba(100,70,20,0.4)]"
                >
                  <ArrowUpRight size={21} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE INDICATORS */}
        <div className="absolute bottom-[118px] left-5 flex items-center gap-3 sm:left-10 lg:left-16">
          {slides.map((slide, index) => (
            <button
              key={slide.category}
              onClick={() => goToSlide(index)}
              aria-label={`Show ${slide.category}`}
              aria-current={activeSlide === index ? "true" : undefined}
              className={`h-[4px] rounded-full transition-all duration-500 ${
                activeSlide === index
                  ? "w-12 bg-[#EFE8A8] shadow-[0_0_12px_rgba(239,232,168,0.7)]"
                  : "w-5 bg-[#FAF5ED]/35 hover:bg-[#EFE8A8]/70"
              }`}
            />
          ))}

          <span className="ml-2 text-[10px] tracking-[0.2em] text-[#FAF5ED]/60">
            0{activeSlide + 1} / 0{slides.length}
          </span>
        </div>

        {/* BOTTOM INFORMATION CARDS */}
        <div className="absolute bottom-0 left-0 right-0 grid grid-cols-1 gap-3 border-t border-[#C9A45C]/50 bg-[#080807]/95 px-4 py-3 backdrop-blur-xl sm:grid-cols-3 sm:gap-4 sm:px-6">
          {/* TODAY CARD */}
          <div className={infoCard}>
            <div className={infoIcon}>
              <CalendarDays size={19} />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-semibold tracking-[0.25em] text-[#C9A45C] transition-colors group-hover:text-[#76551D] group-active:text-[#76551D]">
                TODAY
              </p>
              <p className="mt-1 truncate text-xs text-[#FAF5ED] transition-colors group-hover:text-[#17140D] group-active:text-[#17140D] sm:text-sm">
                {currentDate || "Loading date..."}
              </p>
            </div>
          </div>

          {/* CURRENT TIME CARD */}
          <div className={infoCard}>
            <div className={infoIcon}>
              <Clock3 size={19} />
            </div>

            <div>
              <p className="text-[9px] font-semibold tracking-[0.25em] text-[#C9A45C] transition-colors group-hover:text-[#76551D] group-active:text-[#76551D]">
                CURRENT TIME
              </p>
              <p className="mt-1 text-sm text-[#FAF5ED] transition-colors group-hover:text-[#17140D] group-active:text-[#17140D]">
                {currentTime || "Loading time..."}
              </p>
            </div>
          </div>

          {/* PHILOSOPHY CARD */}
          <div className={infoCard}>
            <div className={infoIcon}>
              <Sparkles size={19} />
            </div>

            <div>
              <p className="text-[9px] font-semibold tracking-[0.25em] text-[#C9A45C] transition-colors group-hover:text-[#76551D] group-active:text-[#76551D]">
                OUR PHILOSOPHY
              </p>
              <p className="mt-1 text-sm text-[#FAF5ED] transition-colors group-hover:text-[#17140D] group-active:text-[#17140D]">
                Beauty. Creativity. Excellence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ALL 12 TRANSITION ANIMATIONS */}
      <style jsx>{`
        .welcome-slide {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          will-change: transform, opacity, filter, clip-path;
          animation-duration: 1.6s;
          animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          animation-fill-mode: both;
        }

        /* 1. CINEMATIC FADE */
        .welcome-cinematic-fade {
          animation-name: cinematicFade;
        }

        @keyframes cinematicFade {
          from {
            opacity: 0;
            transform: scale(1.12);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* 2. HORIZONTAL SLIDE */
        .welcome-horizontal-slide {
          animation-name: horizontalSlide;
        }

        @keyframes horizontalSlide {
          from {
            opacity: 0.5;
            transform: translateX(100%) scale(1.04);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        /* 3. VERTICAL REVEAL */
        .welcome-vertical-reveal {
          animation-name: verticalReveal;
        }

        @keyframes verticalReveal {
          from {
            clip-path: inset(100% 0 0 0);
            transform: scale(1.08);
          }
          to {
            clip-path: inset(0 0 0 0);
            transform: scale(1);
          }
        }

        /* 4. BLUR TO CLEAR */
        .welcome-blur-clear {
          animation-name: blurClear;
        }

        @keyframes blurClear {
          from {
            opacity: 0.3;
            filter: blur(25px);
            transform: scale(1.08);
          }
          to {
            opacity: 1;
            filter: blur(0);
            transform: scale(1);
          }
        }

        /* 5. DIAGONAL WIPE */
        .welcome-diagonal-wipe {
          animation-name: diagonalWipe;
        }

        @keyframes diagonalWipe {
          from {
            clip-path: polygon(0 0, 0 0, 0 0, 0 0);
            transform: scale(1.08);
          }
          to {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            transform: scale(1);
          }
        }

        /* 6. CIRCULAR REVEAL */
        .welcome-circular-reveal {
          animation-name: circularReveal;
        }

        @keyframes circularReveal {
          from {
            clip-path: circle(0% at 50% 50%);
            transform: scale(1.08);
          }
          to {
            clip-path: circle(100% at 50% 50%);
            transform: scale(1);
          }
        }

        /* 7. SPLIT REVEAL */
        .welcome-split-reveal {
          animation-name: splitReveal;
        }

        @keyframes splitReveal {
          from {
            clip-path: inset(0 50% 0 50%);
            transform: scale(1.08);
          }
          to {
            clip-path: inset(0 0 0 0);
            transform: scale(1);
          }
        }

        /* 8. 3D FLIP */
        .welcome-three-d-flip {
          transform-origin: center;
          animation-name: threeDFlip;
        }

        @keyframes threeDFlip {
          from {
            opacity: 0;
            transform: perspective(1000px) rotateY(-85deg) scale(0.9);
          }
          to {
            opacity: 1;
            transform: perspective(1000px) rotateY(0) scale(1);
          }
        }

        /* 9. PARALLAX ZOOM */
        .welcome-parallax-zoom {
          animation-name: parallaxZoom;
        }

        @keyframes parallaxZoom {
          from {
            opacity: 0.5;
            transform: scale(1.35) translateX(4%);
          }
          to {
            opacity: 1;
            transform: scale(1) translateX(0);
          }
        }

        /* 10. CURTAIN REVEAL */
        .welcome-curtain-reveal {
          animation-name: curtainReveal;
        }

        @keyframes curtainReveal {
          from {
            clip-path: inset(0 50% 0 50%);
            transform: scale(1.05);
          }
          to {
            clip-path: inset(0 0 0 0);
            transform: scale(1);
          }
        }

        /* 11. LIGHT SWEEP */
        .welcome-light-sweep {
          background: linear-gradient(
            110deg,
            transparent 20%,
            rgba(239, 232, 168, 0.16) 45%,
            rgba(255, 255, 255, 0.24) 50%,
            rgba(239, 232, 168, 0.16) 55%,
            transparent 80%
          );
          transform: translateX(-120%);
          animation: lightSweep 1.8s ease-in-out forwards;
        }

        @keyframes lightSweep {
          to {
            transform: translateX(120%);
          }
        }

        /* 12. MORPH ZOOM */
        .welcome-morph-zoom {
          animation-name: morphZoom;
        }

        @keyframes morphZoom {
          from {
            opacity: 0;
            clip-path: inset(20% 20% 20% 20% round 50%);
            transform: scale(1.2);
            filter: saturate(0.5);
          }
          to {
            opacity: 1;
            clip-path: inset(0 0 0 0 round 0%);
            transform: scale(1);
            filter: saturate(1);
          }
        }

        /* CONTENT ANIMATION */
        .welcome-content-enter {
          animation: contentEnter 0.8s ease both;
        }

        @keyframes contentEnter {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .welcome-showcase {
          animation: showcaseEnter 0.9s ease both;
        }

        @keyframes showcaseEnter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .welcome-slide,
          .welcome-light-sweep,
          .welcome-content-enter,
          .welcome-showcase {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
