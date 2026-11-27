import Link from "next/link";
import Image from "next/image";

import {
  ArrowUpRight,
  Camera,
  Mail,
  Sparkles,
  GraduationCap,
  Heart,
  PlayCircle,
  Users,
} from "lucide-react";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Our Courses", href: "/courses" },
  { label: "Live Classes", href: "/live" },
];

const studentLinks = [
  { label: "Student Login", href: "/login" },
  { label: "My Learning", href: "/student" },
];

const socialLinks = [
  { icon: Camera, label: "Instagram" },
  { icon: Users, label: "Facebook" },
  { icon: PlayCircle, label: "YouTube" },
  { icon: Mail, label: "Email" },
];

export default function Footer() {
  return (
    <footer className="relative isolate mt-6 overflow-hidden bg-[#121414] text-white">

      {/* LIQUID GOLD BACKGROUND */}
<div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

  {/* Gold liquid */}
  <div className="liquid-flow liquid-flow-one footer-liquid absolute -left-40 top-0 h-52 w-96 rounded-full bg-[#C9A45C]/20 blur-[90px]" />

  {/* Champagne liquid */}
  <div className="liquid-flow liquid-flow-two footer-liquid absolute -right-40 top-0 h-52 w-96 rounded-full bg-[#EFE8A8]/10 blur-[90px]" />

  {/* Beige liquid */}
  <div className="liquid-flow liquid-flow-three footer-liquid absolute bottom-[-100px] left-1/3 h-48 w-80 rounded-full bg-[#E8D8C5]/10 blur-[90px]" />

</div>

      {/* TOP LINE */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A45C] to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-6 md:px-10 md:py-8">

        {/* COMPACT FOOTER CONTENT */}
        <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.8fr]">

          {/* BRAND */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">

              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#C9A45C]/70 bg-[#121414] p-0.5">
                <Image
                  src="/kavyas-logo.png"
                  alt="Kavyas Beauty Centre"
                  fill
                  sizes="40px"
                  className="object-contain"
                />
              </div>

              <div>
                <h2 className="font-serif text-lg font-bold tracking-wide text-[#EFE8A8]">
                  KAVYAS
                </h2>
                <p className="text-[8px] font-semibold uppercase tracking-[0.23em] text-[#C9A45C]">
                  Beauty Centre Academy
                </p>
              </div>

            </Link>

            <h3 className="mt-3 font-serif text-xl font-semibold text-white">
              Create.
              <span className="ml-2 bg-gradient-to-r from-[#EFE8A8] via-[#C9A45C] to-[#E8D8C5] bg-clip-text text-transparent">
                Learn. Shine.
              </span>
            </h3>

            <p className="mt-2 max-w-sm text-[11px] leading-5 text-white/55">
              Discover your creativity, develop your beauty skills
              and take the next step towards your professional future.
            </p>

            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#EFE8A8]">
              <Sparkles size={12} className="text-[#C9A45C]" />
              Your Beauty Learning Journey
            </div>
          </div>

          {/* EXPLORE */}
          <div>
            <h4 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#EFE8A8]">
              <GraduationCap size={14} className="text-[#C9A45C]" />
              Explore
            </h4>

            <ul className="space-y-2.5">
              {exploreLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex w-fit items-center gap-1.5 text-[11px] text-white/60 transition-all duration-300 hover:translate-x-1 hover:text-[#EFE8A8]"
                  >
                    {item.label}
                    <ArrowUpRight
                      size={11}
                      className="opacity-0 transition group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* STUDENT PORTAL */}
          <div>
            <h4 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#EFE8A8]">
              <Sparkles size={13} className="text-[#C9A45C]" />
              Student Portal
            </h4>

            <ul className="space-y-2.5">
              {studentLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex w-fit items-center gap-1.5 text-[11px] text-white/60 transition-all duration-300 hover:translate-x-1 hover:text-[#EFE8A8]"
                  >
                    {item.label}
                    <ArrowUpRight
                      size={11}
                      className="opacity-0 transition group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/courses"
              className="group mt-4 inline-flex items-center gap-1.5 border-b border-[#C9A45C]/60 pb-1 text-[10px] font-semibold text-[#EFE8A8] transition hover:border-[#EFE8A8] hover:text-white"
            >
              Explore Courses
              <ArrowUpRight size={12} />
            </Link>
          </div>

        </div>

        {/* BOTTOM DIVIDER */}
        <div className="my-5 h-px bg-gradient-to-r from-transparent via-[#C9A45C]/40 to-transparent" />

        {/* BOTTOM ROW */}
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">

          <p className="text-[9px] text-white/45">
            © {new Date().getFullYear()} Kavyas Beauty Centre. All Rights Reserved.
          </p>

          {/* SOCIAL ICONS */}
          <div className="flex items-center gap-2">
            {socialLinks.map(({ icon: Icon, label }) => (
              <span
                key={label}
                title={label}
                aria-label={label}
                className="grid h-7 w-7 cursor-default place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/60 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#C9A45C] hover:text-[#EFE8A8]"
              >
                <Icon size={12} />
              </span>
            ))}
          </div>

          <p className="flex items-center gap-1 text-[9px] text-white/45">
            Made with
            <Heart size={10} className="fill-[#C9A45C] text-[#C9A45C]" />
            for beauty learners
          </p>

        </div>
      </div>

      {/* BOTTOM GOLD LINE */}
      <div className="h-[2px] bg-gradient-to-r from-[#121414] via-[#C9A45C] to-[#121414]" />

    </footer>
  );
}