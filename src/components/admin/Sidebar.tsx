"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  {
    href: "/admin/courses",
    label: "Courses",
    icon: "book",
    hasSubmenu: true,
    children: [
      { href: "/admin/courses", label: "All Courses" },
      { href: "/admin/courses/new", label: "Add Course" },
    ],
  },
  { href: "/admin/students", label: "Students", icon: "users" },
  { href: "/admin/live", label: "Analytics", icon: "chart" },
  { href: "/admin/live#instructors", label: "Instructors", icon: "spark" },
  { href: "/admin/addons", label: "Settings", icon: "settings" },
];

function NavIcon({ type }: { type: string }) {
  switch (type) {
    case "grid":
      return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "book":
      return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "users":
      return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      );
    case "chart":
      return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      );
    case "spark":
      return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      );
    case "settings":
      return (
        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Sidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isCoursesActive = pathname.startsWith("/admin/courses");

  return (
    <aside className="relative flex h-screen w-[236px] flex-col justify-between border-r border-[#D6AD65]/20 bg-gradient-to-b from-[#15120F] via-[#0d0b09] to-[#090807] text-[#BDB4A7]">
      <div className="relative flex flex-col overflow-y-auto px-4 pt-6">
        {/* Official KBC Salon Academy Logo */}
        <Link
          href="/admin"
          onClick={onNavigate}
          className="mb-7 flex flex-col items-center text-center transition hover:opacity-90"
        >
          <div className="mb-2 flex h-12 w-24 items-center justify-center">
            <img
              src="/KBC logo.png"
              alt="KBC Salon Academy"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="font-serif text-xl font-bold tracking-[0.22em] text-[#F1D69A]">
            KBC
          </span>
          <span className="text-[9px] font-semibold tracking-[0.3em] text-[#D6AD65]/80">
            SALON ACADEMY
          </span>
        </Link>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const baseHref = item.href.split("#")[0];
            const isActive =
              item.href.includes("#")
                ? false
                : baseHref === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(baseHref);

            return (
              <div key={item.label} className="space-y-1">
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#D6AD65] to-[#F1D69A] font-semibold text-[#090807] shadow-[0_6px_18px_rgba(214,173,101,0.22)]"
                      : "text-[#BDB4A7] hover:bg-[#1B1713] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-[#090807]" : "text-[#D6AD65]/80"}>
                      <NavIcon type={item.icon} />
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.hasSubmenu && (
                    <svg
                      className={`h-3.5 w-3.5 transition-transform ${
                        isCoursesActive ? "rotate-90" : ""
                      } ${isActive ? "text-[#090807]" : "text-[#BDB4A7]/70"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </Link>

                {item.hasSubmenu && isCoursesActive && (
                  <div className="ml-3 space-y-1 border-l border-[#D6AD65]/20 pl-3 pt-0.5">
                    {item.children?.map((sub) => {
                      const isSubActive =
                        sub.href === "/admin/courses"
                          ? pathname === "/admin/courses"
                          : pathname === sub.href;
                      return (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={onNavigate}
                          className={`block rounded-lg px-3 py-1.5 text-[11px] transition-all ${
                            isSubActive
                              ? "bg-[#211A12] font-medium text-[#F1D69A]"
                              : "text-[#BDB4A7]/80 hover:bg-[#1B1713] hover:text-white"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Luxury Brand Accent & Support */}
      <div className="relative space-y-2.5 p-4">
        <div className="relative overflow-hidden rounded-2xl border border-[#D6AD65]/25 bg-gradient-to-br from-[#211A12] via-[#15120F] to-[#090807] p-4">
          <p className="font-serif text-sm leading-snug text-[#F1D69A]">
            Learn.
            <br />
            Create. Inspire.
          </p>
          <div className="my-2.5 h-px w-12 bg-gradient-to-r from-[#D6AD65]/60 to-transparent" />
          <p className="text-[10px] text-[#BDB4A7]">Need Help?</p>
          <Link
            href="/admin/addons"
            onClick={onNavigate}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#D6AD65]/30 bg-[#1B1713] px-3 py-2 text-[11px] font-medium text-[#F1D69A] transition hover:border-[#D6AD65]/60 hover:bg-[#211A12]"
          >
            <span>Contact Support</span>
          </Link>
        </div>

        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#D6AD65]/15 bg-[#15120F] px-3 py-2 text-[11px] text-[#BDB4A7] transition hover:border-[#D6AD65]/35 hover:text-white"
        >
          <span>View Public Site</span>
        </Link>
      </div>
    </aside>
  );
}
