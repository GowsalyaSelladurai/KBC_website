"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  BookOpen,
  Radio,
  LogIn,
  GraduationCap,
  Menu,
  X,
  ArrowRight,
  LogOut,
  Sparkles,
} from "lucide-react";

const pub = [
  { href: "/", label: "Home", icon: Home },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/live", label: "Live Classes", icon: Radio },
  { href: "/login", label: "Student Login", icon: LogIn },
];

const stu = [
  { href: "/student", label: "My Learning", icon: GraduationCap },
  { href: "/live", label: "Live Classes", icon: Radio },
];

export default function Navbar() {
  const p = usePathname();
  const [open, setOpen] = useState(false);

  const inStu =
    p.startsWith("/student") || p.startsWith("/watch");

  const links = inStu ? stu : pub;

  const isActive = (href: string) => {
    if (href === "/") return p === "/";
    return p === href || p.startsWith(href + "/");
  };

  return (
    <nav className="sticky top-0 z-50 px-3 pt-3 md:px-6">

      <div className="mx-auto w-full max-w-[1600px] px-6">

        {/* PREMIUM FLOATING GLASS NAVBAR */}
        <div className="relative rounded-[22px] border border-white/70 bg-[#FAF5ED]/80 shadow-[0_12px_40px_rgba(18,20,20,0.12)] backdrop-blur-2xl">

          {/* GOLD LIGHT EFFECT */}
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A45C]/80 to-transparent" />

          <div className="flex h-[78px] items-center justify-between px-4 md:px-7">

            {/* BRAND LOGO */}
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="group flex shrink-0 items-center gap-3"
            >
              <motion.div
                whileHover={{ scale: 1.06, rotate: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative h-12 w-12 overflow-hidden rounded-xl border border-[#C9A45C] bg-[#121414] p-1 shadow-[0_5px_15px_rgba(201,164,92,0.2)]"
              >
                <Image
                  src="/kavyas-logo.png"
                  alt="Kavyas Beauty Centre"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </motion.div>

              <div className="leading-tight">
                <h1 className="font-serif text-lg font-bold tracking-wide text-[#121414] md:text-xl">
                  KAVYAS
                </h1>

                <p className="mt-1 text-[9px] font-semibold tracking-[0.24em] text-[#9A7947]">
                  BEAUTY CENTRE
                </p>
              </div>
            </Link>

            {/* DESKTOP ANIMATED NAVIGATION */}
            <div className="hidden items-center gap-1 rounded-full border border-[#C9A45C]/25 bg-white/50 p-1.5 shadow-[inset_0_2px_8px_rgba(18,20,20,0.04)] md:flex">

              {links.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-colors duration-300 ${
                      active
                        ? "text-[#121414]"
                        : "text-[#766F64] hover:text-[#121414]"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="kbc-navbar-indicator"
                        className="absolute inset-0 rounded-full border border-[#C9A45C]/50 bg-gradient-to-br from-[#F5E9B4] to-[#EFE8A8] shadow-[0_3px_12px_rgba(201,164,92,0.22)]"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 28,
                        }}
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-2">
                      <motion.span
                        whileHover={{ y: -2, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon
                          size={16}
                          className={active ? "text-[#80602E]" : ""}
                        />
                      </motion.span>

                      {item.label}
                    </span>
                  </Link>
                );
              })}

            </div>

            {/* RIGHT ACTION */}
            <div className="hidden md:block">

              {inStu ? (
                <Link
                  href="/"
                  className="group flex items-center gap-2 rounded-full border border-[#C9A45C]/50 bg-white/50 px-5 py-3 text-sm font-semibold text-[#121414] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#121414] hover:text-[#EFE8A8]"
                >
                  <LogOut size={16} />
                  Log out
                </Link>
              ) : (
                <Link
                  href="/courses"
                  className="group flex items-center gap-2 rounded-full bg-[#121414] px-5 py-3 text-sm font-semibold text-[#EFE8A8] shadow-[0_5px_16px_rgba(18,20,20,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#80602E] hover:shadow-lg"
                >
                  <Sparkles size={15} />
                  Enroll Now
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              )}

            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="grid h-11 w-11 place-items-center rounded-xl border border-[#C9A45C]/40 bg-white/70 text-[#121414] shadow-sm transition-all hover:bg-[#EFE8A8] md:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? "close" : "menu"}
                  initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
                  transition={{ duration: 0.18 }}
                >
                  {open ? <X size={22} /> : <Menu size={22} />}
                </motion.span>
              </AnimatePresence>
            </button>

          </div>

          {/* MOBILE GLASS MENU */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden md:hidden"
              >
                <div className="border-t border-[#C9A45C]/25 px-4 pb-5 pt-3">

                  <div className="flex flex-col gap-2">

                    {links.map((item, index) => {
                      const active = isActive(item.href);
                      const Icon = item.icon;

                      return (
                        <motion.div
                          key={item.href}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.06 }}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                              active
                                ? "border-[#C9A45C]/50 bg-[#EFE8A8] text-[#121414]"
                                : "border-transparent text-[#766F64] hover:border-[#C9A45C]/30 hover:bg-white/70"
                            }`}
                          >
                            <Icon size={18} />
                            {item.label}
                          </Link>
                        </motion.div>
                      );
                    })}

                  </div>

                  <div className="mt-4">
                    {inStu ? (
                      <Link
                        href="/"
                        onClick={() => setOpen(false)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#C9A45C]/50 py-3 text-sm font-semibold text-[#121414]"
                      >
                        <LogOut size={17} />
                        Log out
                      </Link>
                    ) : (
                      <Link
                        href="/courses"
                        onClick={() => setOpen(false)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#121414] py-3 text-sm font-semibold text-[#EFE8A8]"
                      >
                        Enroll Now
                        <ArrowRight size={17} />
                      </Link>
                    )}
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </nav>
  );
}