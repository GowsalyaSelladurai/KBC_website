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
  { href: "/admin/live", label: "Analytics", icon: "chart" },
  { href: "/admin/addons", label: "Settings", icon: "settings" },
];

function NavIcon({ type }: { type: string }) {
  switch (type) {
    case "grid":
      return (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "book":
      return (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "chart":
      return (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      );
    case "settings":
      return (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const isCoursesActive = pathname.startsWith("/admin/courses");

  return (
    <aside className="flex h-screen w-[230px] flex-col justify-between border-r border-[#26211b] bg-[#0c0c0b] text-[#8e8981]">
      {/* Top Section */}
      <div className="flex flex-col overflow-y-auto px-4 pt-6">
        {/* Logo */}
        <Link href="/admin" className="mb-6 flex flex-col items-center text-center">
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-[#e5be75]/20 to-transparent p-1.5 border border-[#e5be75]/30 shadow-[0_0_15px_rgba(229,190,117,0.15)]">
            <svg viewBox="0 0 40 40" className="h-full w-full text-[#d8b16d]" fill="currentColor">
              <path d="M20 4c-5 0-9 4-9 9 0 3 1.5 6 3 8-2 1-5 4-5 8 0 4 5 7 11 7s11-3 11-7c0-4-3-7-5-8 1.5-2 3-5 3-8 0-5-4-9-9-9zm0 4a5 5 0 015 5c0 2-1 4-2 5a7 7 0 01-6 0c-1-1-2-3-2-5a5 5 0 015-5z" />
            </svg>
          </div>
          <span className="font-serif text-xl font-bold tracking-widest text-[#f0d499]">
            KBC
          </span>
          <span className="text-[9px] font-semibold tracking-[0.28em] text-[#9a8565]">
            SALON ACADEMY
          </span>
        </Link>

        {/* Navigation items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

            return (
              <div key={item.label} className="space-y-1">
                <Link
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#c9a66a]/20 to-[#c9a66a]/5 text-[#f4e5c5] border border-[#c9a66a]/30 shadow-sm"
                      : "text-[#8a857b] hover:bg-[#161513] hover:text-[#e8dfd1]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? "text-[#d8b16d]" : "text-[#7a756b]"}>
                      <NavIcon type={item.icon} />
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.hasSubmenu && (
                    <svg
                      className={`h-3.5 w-3.5 text-[#8a857b] transition-transform ${
                        isCoursesActive ? "rotate-90 text-[#d8b16d]" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </Link>

                {/* Submenu for Courses */}
                {item.hasSubmenu && isCoursesActive && (
                  <div className="ml-5 space-y-1 border-l border-[#2e2720] pl-3 py-1">
                    {item.children?.map((sub) => {
                      const isSubActive =
                        sub.href === "/admin/courses"
                          ? pathname === "/admin/courses"
                          : pathname === sub.href;
                      return (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className={`block rounded-lg px-2.5 py-1.5 text-[11px] transition-all ${
                            isSubActive
                              ? "bg-[#c9a66a]/15 text-[#e5be75] font-semibold"
                              : "text-[#7a756c] hover:text-[#d8b16d]"
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

          {/* Logout */}
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#7a756b] transition-all hover:bg-[#161513] hover:text-[#d8b16d]"
          >
            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span>Logout</span>
          </Link>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-3 space-y-3">
        {/* Gold Luxury Card */}
        <div className="relative overflow-hidden rounded-2xl border border-[#7a592e]/40 bg-gradient-to-br from-[#1c1813] via-[#14120f] to-[#0c0b0a] p-3.5 shadow-md">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[#d8b16d]/10 blur-xl pointer-events-none" />
          <p className="text-[11px] font-serif font-medium tracking-wide text-[#e5be75]">
            Learn · Practice · Excel
          </p>
          <p className="mt-0.5 text-[9px] text-[#8e8577]">
            KBC Salon Academy
          </p>
          <div className="mt-2.5 flex items-center justify-center gap-1.5 opacity-80">
            <span className="text-sm">💄</span>
            <span className="text-sm">✨</span>
            <span className="text-sm">🎨</span>
          </div>
        </div>

        {/* Admin profile pill */}
        <div className="flex items-center justify-between rounded-xl border border-[#26211b] bg-[#121110] p-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#d5a45a] to-[#f4e5c5] text-xs font-bold text-[#1a140d] ring-1 ring-[#d8b16d]/40">
              👩‍🦰
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-[#e8dfd1]">Admin</p>
              <p className="truncate text-[10px] text-[#7a7469]">admin@kbcsacademy.com</p>
            </div>
          </div>
          <svg className="h-4 w-4 shrink-0 text-[#686156]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
