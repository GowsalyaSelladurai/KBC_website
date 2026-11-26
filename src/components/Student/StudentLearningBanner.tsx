
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";

type NavTab =
  | "dashboard"
  | "courses"
  | "my-learning"
  | "progress"
  | "profile";

type Props = {
  progress: number;
  onExploreCourses: () => void;
  onNavigate?: (tab: NavTab) => void;
  activeTab?: NavTab;
};

const slides = [
  {
    title: "Professional Makeup",
    image: "/courses/makeup.jpg",
    subtitle: "Master the art of professional beauty",
  },
  {
    title: "Hair Styling",
    image: "/courses/hair-styling.jpg",
    subtitle: "Create beautiful hairstyles with confidence",
  },
  {
    title: "Nail Art",
    image: "/courses/nail-art.jpg",
    subtitle: "Turn creativity into beautiful nail designs",
  },
  {
    title: "Saree Pleating",
    image: "/courses/saree-pleating.jpg",
    subtitle: "Learn elegant draping and pleating techniques",
  },
];

const navigation: { label: string; id: NavTab }[] = [
  { label: "Home", id: "dashboard" },
  { label: "Courses", id: "courses" },
  { label: "My Learning", id: "my-learning" },
  { label: "Progress", id: "progress" },
  { label: "Profile", id: "profile" },
];

export default function StudentLearningBanner({
  progress,
  onExploreCourses,
  onNavigate,
  activeTab = "dashboard",
}: Props) {
  const [activeSlide, setActiveSlide] = useState(0);

  const safeProgress = Math.min(100, Math.max(0, progress));

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const changeSlide = (direction: number) => {
    setActiveSlide(
      (current) =>
        (current + direction + slides.length) % slides.length
    );
  };

  return (
    <section className="relative isolate min-h-[680px] w-full overflow-hidden rounded-[28px] border-2 border-[#C9A45C] bg-[#121414] shadow-[0_20px_55px_rgba(80,50,15,0.22)] md:min-h-[650px]">

      {/* Full Background Image Carousel */}
      {slides.map((slide, index) => (
        <div
          key={slide.title}
          className={`absolute inset-0 -z-20 transition-all duration-1000 ease-in-out ${
            activeSlide === index
              ? "scale-100 opacity-100"
              : "scale-110 opacity-0"
          }`}
          aria-hidden={activeSlide !== index}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ))}

      {/* Readability Overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#121414]/95 via-[#121414]/75 to-[#121414]/20" />

      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#121414]/65 via-transparent to-[#121414]/45" />

      {/* Header Navigation */}
      <header className="relative flex flex-wrap items-center justify-between gap-5 border-b border-[#EFE8A8]/20 bg-[#121414]/30 px-5 py-5 backdrop-blur-md md:px-9">

        {/* Logo */}
        <div className="flex items-center gap-3">

          <div className="relative h-[65px] w-[65px] shrink-0 overflow-hidden rounded-full border-2 border-[#C9A45C] bg-black shadow-[0_0_20px_rgba(201,164,92,0.25)]">

            <Image
              src="/logo.jpeg"
              alt="Kavyas Beauty Centre"
              fill
              sizes="65px"
              className="object-contain"
            />

          </div>

          <div>
            <h2 className="font-serif text-xl font-bold tracking-wide text-[#EFE8A8] md:text-2xl">
              KBC ACADEMY
            </h2>

            <p className="text-[10px] uppercase tracking-[0.22em] text-white/75 md:text-xs">
              Learning New Style
            </p>
          </div>

        </div>

        {/* Navigation */}
        <nav className="flex flex-wrap items-center gap-2 md:gap-3">

          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "courses") {
                  onExploreCourses();
                } else {
                  onNavigate?.(item.id);
                }
              }}
              className={`rounded-full px-3 py-2 text-xs font-medium transition-all duration-300 md:px-5 md:text-sm ${
                activeTab === item.id
                  ? "border border-[#C9A45C] bg-[#C9A45C] text-[#121414] shadow-[0_0_18px_rgba(201,164,92,0.35)]"
                  : "text-white/90 hover:border hover:border-[#C9A45C]/70 hover:bg-white/10 hover:text-[#EFE8A8]"
              }`}
            >
              {item.label}
            </button>
          ))}

        </nav>

      </header>

      {/* Main Hero */}
      <div className="relative flex min-h-[570px] items-center px-6 py-12 md:min-h-[540px] md:px-12 lg:px-16">

        <div className="max-w-[650px]">

          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="text-[#EFE8A8]" size={20} />

            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#EFE8A8] md:text-sm">
              Welcome to KBC Academy
            </span>
          </div>

          <h1 className="font-serif text-5xl font-bold leading-[1.12] tracking-tight text-white md:text-6xl lg:text-7xl">

            Your Beauty

            <span className="mt-2 block bg-gradient-to-r from-[#EFE8A8] via-[#C9A45C] to-[#FFF8ED] bg-clip-text text-transparent">
              Learning Journey
            </span>

          </h1>

          <h2 className="mt-7 font-serif text-3xl italic text-[#EFE8A8] md:text-4xl">
            Create. Learn. Shine.
          </h2>

          <div className="mt-5 h-[2px] w-32 bg-gradient-to-r from-[#C9A45C] to-transparent" />

          <p className="mt-6 max-w-lg text-sm leading-7 text-white/85 md:text-base">
            Sustain your growth journey and fulfill your aspirations.
            Discover your potential and master your beauty skills.
          </p>

          {/* Explore Courses */}
          <button
            onClick={onExploreCourses}
            className="group mt-8 inline-flex items-center gap-4 rounded-full border border-[#EFE8A8] bg-gradient-to-r from-[#C9A45C] to-[#EFE8A8] px-8 py-4 font-semibold text-[#121414] shadow-[0_8px_30px_rgba(201,164,92,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(201,164,92,0.45)]"
          >
            <GraduationCap size={25} />

            <span>Explore Courses</span>

            <ChevronRight
              size={20}
              className="transition-transform group-hover:translate-x-2"
            />
          </button>

          {/* Learning Progress Under Button */}
          <div className="mt-6 max-w-[350px] rounded-2xl border border-[#EFE8A8]/50 bg-[#121414]/65 p-5 shadow-xl backdrop-blur-xl">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#C9A45C]/50 bg-[#C9A45C]/20">
                <TrendingUp size={28} className="text-[#EFE8A8]" />
              </div>

              <div className="flex-1">

                <p className="text-xs text-white/75">
                  Your Learning Progress
                </p>

                <p className="mt-1 text-2xl font-bold text-[#EFE8A8]">
                  {Math.round(safeProgress)}%
                </p>

              </div>

            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">

              <div
                className="h-full rounded-full bg-gradient-to-r from-[#C9A45C] to-[#EFE8A8] transition-all duration-700"
                style={{ width: `${safeProgress}%` }}
              />

            </div>

          </div>

        </div>

      </div>

      {/* Previous / Next Slider Controls */}
      <button
        onClick={() => changeSlide(-1)}
        aria-label="Previous image"
        className="absolute right-[76px] top-1/2 z-20 hidden h-11 w-11 items-center justify-center rounded-full border border-[#EFE8A8]/60 bg-black/40 text-white backdrop-blur-md transition hover:bg-[#C9A45C] hover:text-black md:flex"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={() => changeSlide(1)}
        aria-label="Next image"
        className="absolute right-5 top-1/2 z-20 hidden h-11 w-11 items-center justify-center rounded-full border border-[#EFE8A8]/60 bg-black/40 text-white backdrop-blur-md transition hover:bg-[#C9A45C] hover:text-black md:flex"
      >
        <ChevronRight size={22} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 right-8 z-20 flex items-center gap-3">

        {slides.map((slide, index) => (
          <button
            key={slide.title}
            onClick={() => setActiveSlide(index)}
            aria-label={`Show ${slide.title}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              activeSlide === index
                ? "w-9 bg-[#EFE8A8]"
                : "w-2.5 bg-white/50 hover:bg-[#C9A45C]"
            }`}
          />
        ))}

      </div>

      {/* Current Slide Label */}
      <div className="absolute bottom-6 left-8 z-20 hidden text-xs font-semibold uppercase tracking-[0.2em] text-[#EFE8A8] md:block">
        {slides[activeSlide].title}
      </div>

    </section>
  );
}
