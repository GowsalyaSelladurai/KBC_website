
import Link from "next/link";
import { Course } from "@/data/mock";
import {
  ArrowUpRight,
  Clock3,
  PlayCircle,
  Sparkles,
  Video,
} from "lucide-react";

const courseImages: Record<
  number,
  { image: string; alt: string; category: string }
> = {
  1: {
    image: "/makeup.png",
    alt: "Creative professional bridal makeup artistry",
    category: "Makeup Artistry",
  },
  2: {
    image: "/hairstlye.png",
    alt: "Creative luxury hairstyle with decorative accessories",
    category: "Hair Design",
  },
  3: {
    image: "/nailart.png",
    alt: "Creative 3D nail art with crystals, pearls and gold details",
    category: "Luxury Nail Design",
  },
  4: {
    image: "/saree%20pleating.png",
    alt: "Elegant traditional silk saree draping",
    category: "Traditional Draping",
  },
};

export default function CourseCard({ c }: { c: Course }) {
  const artwork = courseImages[c.id] ?? {
    image: "/makeup.png",
    alt: c.name,
    category: "Beauty Training",
  };

  return (
    <article
      className="
        group relative flex h-full min-h-[450px] flex-col overflow-hidden
        rounded-[24px] border border-[#C9A45C]/70
        bg-gradient-to-b from-[#1C1A15] via-[#12110E] to-[#080807]
        text-[#FAF5ED]
        shadow-[0_8px_30px_rgba(0,0,0,0.45),0_0_12px_rgba(201,164,92,0.08)]
        transition-all duration-500 ease-out
        hover:-translate-y-2 hover:border-[#EFE8A8]
        hover:bg-gradient-to-br hover:from-[#FFF4CE] hover:via-[#E8D39A] hover:to-[#C9A45C]
        hover:text-[#17140D]
        hover:shadow-[0_0_18px_rgba(239,232,168,0.5),0_0_45px_rgba(201,164,92,0.4),0_22px_50px_rgba(0,0,0,0.35)]
        active:scale-[0.99]
        active:border-[#EFE8A8]
        active:from-[#FFF4CE] active:via-[#E8D39A] active:to-[#C9A45C]
        active:text-[#17140D]
        active:shadow-[0_0_25px_rgba(239,232,168,0.5)]
      "
    >
      {/* Animated gold border glow */}
      <div className="pointer-events-none absolute -inset-[2px] z-0 rounded-[26px] bg-gradient-to-br from-[#FFF4CE] via-[#C9A45C] to-[#8D682E] opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-60 group-active:opacity-60" />

      <div className="relative z-10 flex h-full flex-col">
        {/* Course image */}
        <div className="relative mx-3 mt-3 h-[230px] overflow-hidden rounded-[19px] border border-[#C9A45C]/50 bg-[#080807] transition-all duration-500 group-hover:border-[#8D682E] group-active:border-[#8D682E]">
          <img
            src={artwork.image}
            alt={artwork.alt}
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-110 group-active:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#080807] via-[#12110E]/25 to-[#171511]/10 transition-all duration-500 group-hover:from-[#080807]/85 group-active:from-[#080807]/85" />

          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#EFD68C]/15 blur-3xl transition-all duration-700 group-hover:bg-[#EFD68C]/35" />

          <div className="absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-[#B18A45]/20 blur-3xl transition-all duration-700 group-hover:scale-150" />

          <div className="pointer-events-none absolute inset-3 rounded-[14px] border border-[#EFD68C]/30 transition-all duration-500 group-hover:inset-2 group-hover:border-[#EFD68C]/80" />

          {/* Duration badge */}
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-[#C9A45C]/70 bg-[#080807]/90 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#EFE8A8] shadow-[0_0_15px_rgba(201,164,92,0.2)] backdrop-blur-md">
            <Clock3 className="h-3 w-3" />
            {c.days} Day{c.days > 1 ? "s" : ""} Access
          </div>

          {/* Course title */}
          <div className="absolute bottom-5 left-5 right-5">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#EFE8A8]">
              <Sparkles className="h-3.5 w-3.5" />
              {artwork.category}
            </div>

            <h3 className="text-2xl font-extrabold leading-tight text-white drop-shadow-lg">
              {c.name}
            </h3>

            <div className="mt-3 h-[2px] w-12 rounded-full bg-gradient-to-r from-[#EFE8A8] to-transparent transition-all duration-500 group-hover:w-28" />
          </div>

          <div className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        </div>

        {/* Course details */}
        <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
          {/* Signature label */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <span
              className="
                inline-flex items-center gap-1.5 rounded-full
                border border-[#C9A45C]/50 bg-[#C9A45C]/10
                px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em]
                text-[#EFE8A8]
                transition-all duration-500
                group-hover:border-[#8D682E]/60 group-hover:bg-[#8D682E]/10 group-hover:text-[#654719]
                group-active:border-[#8D682E]/60 group-active:bg-[#8D682E]/10 group-active:text-[#654719]
              "
            >
              <Sparkles className="h-3 w-3" />
              KBC Signature
            </span>

            <span className="text-[10px] font-medium text-[#C9A45C]/80 transition-colors duration-500 group-hover:text-[#654719] group-active:text-[#654719]">
              Professional Course
            </span>
          </div>

          {/* Description */}
          <p className="text-sm leading-6 text-[#FAF5ED]/65 transition-colors duration-500 group-hover:text-[#40351F] group-active:text-[#40351F]">
            Develop your skills with structured beauty training and
            professional video lessons.
          </p>

          {/* Course information */}
          <div className="mb-5 mt-4 grid grid-cols-2 gap-3">
            {/* Lessons */}
            <div
              className="
                rounded-xl border border-[#C9A45C]/40 bg-[#080807]
                p-3.5 transition-all duration-500
                group-hover:border-[#A17A35]/60 group-hover:bg-[#FFF9E9]
                group-hover:shadow-[0_4px_16px_rgba(100,70,20,0.12)]
                group-active:border-[#A17A35]/60 group-active:bg-[#FFF9E9]
              "
            >
              <div className="mb-2 flex items-center gap-1.5 text-[#EFE8A8] transition-colors duration-500 group-hover:text-[#8D682E] group-active:text-[#8D682E]">
                <Video className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Lessons
                </span>
              </div>

              <p className="text-sm font-bold text-[#FAF5ED] transition-colors duration-500 group-hover:text-[#211B10] group-active:text-[#211B10]">
                {c.videos.length} Videos
              </p>
            </div>

            {/* Access */}
            <div
              className="
                rounded-xl border border-[#C9A45C]/40 bg-[#080807]
                p-3.5 transition-all duration-500
                group-hover:border-[#A17A35]/60 group-hover:bg-[#FFF9E9]
                group-hover:shadow-[0_4px_16px_rgba(100,70,20,0.12)]
                group-active:border-[#A17A35]/60 group-active:bg-[#FFF9E9]
              "
            >
              <div className="mb-2 flex items-center gap-1.5 text-[#EFE8A8] transition-colors duration-500 group-hover:text-[#8D682E] group-active:text-[#8D682E]">
                <Clock3 className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Access
                </span>
              </div>

              <p className="text-sm font-bold text-[#FAF5ED] transition-colors duration-500 group-hover:text-[#211B10] group-active:text-[#211B10]">
                {c.days * 24} Hours
              </p>
            </div>
          </div>

          {/* Fee and button */}
          <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#C9A45C]/35 pt-4 transition-colors duration-500 group-hover:border-[#8D682E]/50 group-active:border-[#8D682E]/50">
            <div>
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#C9A45C] transition-colors duration-500 group-hover:text-[#76551F] group-active:text-[#76551F]">
                Course Fee
              </p>

              <p className="text-xl font-extrabold text-[#EFE8A8] transition-colors duration-500 group-hover:text-[#21190B] group-active:text-[#21190B]">
                ₹{c.price.toLocaleString("en-IN")}
              </p>
            </div>

            <Link
              href={`/courses/${c.id}`}
              className="
                group/button inline-flex items-center justify-center gap-2
                rounded-xl border border-[#EFE8A8]
                bg-gradient-to-r from-[#B18A45] via-[#EFE8A8] to-[#C9A45C]
                px-3.5 py-3 text-xs font-bold text-[#121414]
                shadow-[0_5px_18px_rgba(201,164,92,0.22)]
                transition-all duration-300
                hover:-translate-y-1 hover:from-[#17140D] hover:via-[#292116] hover:to-[#17140D]
                hover:text-[#FFF0B8] hover:shadow-[0_0_25px_rgba(100,70,20,0.3)]
                active:scale-95
              "
            >
              <PlayCircle className="h-4 w-4" />
              View Course
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/button:translate-x-1 group-hover/button:-translate-y-1" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
