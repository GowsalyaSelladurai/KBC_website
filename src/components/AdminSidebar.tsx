
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

import { navigation } from "./Navbar";
import MagneticHover from "./admin/MagneticHover";

export default function AdminSidebar() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-5 z-50 rounded-lg border border-[#EFE8A8]/20 bg-[#121414] p-2 text-[#EFE8A8] transition-all duration-300 hover:border-[#FFE98A] hover:shadow-[0_0_18px_rgba(255,215,75,0.65)] lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={23} />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          kbc-admin-sidebar fixed inset-y-0 left-0 z-50
          flex flex-col overflow-hidden
          border-r border-[#EFE8A8]/15
          bg-[#121414] text-white
          transition-all duration-300
          ${collapsed ? "w-20" : "w-72"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="flex h-24 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <img
              src="/kavyas-logo.png"
              alt="Kavyas Beauty Centre Logo"
              className="h-14 w-14 shrink-0 rounded-full border border-[#EFE8A8]/60 object-cover shadow-[0_0_15px_rgba(239,232,168,0.2)]"
            />

            {!collapsed && (
              <div>
                <h1 className="whitespace-nowrap text-lg font-bold tracking-wide text-[#EFE8A8]">
                  KBC SALOON
                </h1>
                <p className="text-[10px] tracking-[3px] text-gray-400">
                  BEAUTY ACADEMY
                </p>
              </div>
            )}
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-2 text-gray-400 transition-all duration-300 hover:bg-[#EFE8A8]/10 hover:text-[#FFF0A6] hover:shadow-[0_0_14px_rgba(255,215,75,0.45)] lg:block"
            aria-label="Collapse sidebar"
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-gray-400 transition hover:text-[#FFF0A6] lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
          {navigation.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="mb-3 px-3 text-[10px] font-bold tracking-[2px] text-[#A9A58A]">
                  {group.title}
                </p>
              )}

              <div className="space-y-2">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  const active =
                    pathname === item.href ||
                    (item.href !== "/" &&
                      pathname.startsWith(item.href + "/"));

                  return (
                    <MagneticHover
                      key={item.href}
                      strength={3}
                    >
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        onClick={() => setMobileOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`
                          kbc-sidebar-menu
                          group relative isolate flex items-center gap-3
                          overflow-hidden rounded-xl border
                          px-3 py-3 text-sm
                          transition-all duration-300 ease-out

                          ${
                            active
                              ? `
                                border-[#FFE98A]/80
                                bg-gradient-to-r
                                from-[#59491F]/70
                                via-[#343426]
                                to-[#1b1e1c]
                                font-semibold text-[#FFF0A6]
                                shadow-[0_0_10px_rgba(255,225,105,0.55),0_0_24px_rgba(255,193,7,0.3),inset_0_0_15px_rgba(239,232,168,0.12)]
                              `
                              : `
                                border-transparent
                                text-[#F5F1E6]
                                hover:border-[#FFE98A]/80
                                hover:bg-gradient-to-r
                                hover:from-[#59491F]/50
                                hover:via-[#302B1C]
                                hover:to-[#1b1e1c]
                                hover:text-[#FFF0A6]
                                hover:shadow-[0_0_8px_rgba(255,225,105,0.9),0_0_20px_rgba(255,193,7,0.55),inset_0_0_12px_rgba(255,225,105,0.12)]
                                active:scale-[0.97]
                              `
                          }
                        `}
                      >
                        {/* Hover Gold Light Sweep */}
                        <span
                          className={`
                            pointer-events-none absolute inset-y-0
                            -left-full w-1/2 skew-x-[-20deg]
                            bg-gradient-to-r
                            from-transparent
                            via-[#FFF0A6]/25
                            to-transparent
                            transition-all duration-700
                            group-hover:left-[150%]
                          `}
                        />

                        {/* Active Gold Indicator */}
                        {active && (
                          <>
                            <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#FFF0A6] shadow-[0_0_8px_2px_rgba(255,235,140,0.95)]" />

                            <span className="pointer-events-none absolute -left-10 top-0 h-full w-16 rotate-12 bg-gradient-to-r from-transparent via-[#EFE8A8]/15 to-transparent animate-[kbcShimmer_3s_ease-in-out_infinite]" />

                            <span className="pointer-events-none absolute right-3 top-1/2 -z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-[#FFE98A]/20 blur-xl" />
                          </>
                        )}

                        {/* Icon */}
                        <span
                          className={`
                            relative z-10 flex shrink-0
                            items-center justify-center
                            transition-all duration-300
                            ${
                              active
                                ? `
                                  scale-110 text-[#FFF0A6]
                                  drop-shadow-[0_0_8px_rgba(255,235,140,0.95)]
                                `
                                : `
                                  text-[#D8D4C4]
                                  group-hover:scale-110
                                  group-hover:text-[#FFF0A6]
                                  group-hover:drop-shadow-[0_0_9px_rgba(255,235,140,1)]
                                `
                            }
                          `}
                        >
                          <Icon size={19} />
                        </span>

                        {/* Label */}
                        {!collapsed && (
                          <span
                            className={`
                              relative z-10 whitespace-nowrap
                              transition-all duration-300
                              ${
                                active
                                  ? `
                                    translate-x-0 text-[#FFF0A6]
                                    drop-shadow-[0_0_7px_rgba(255,235,140,0.6)]
                                  `
                                  : `
                                    group-hover:translate-x-1
                                    group-hover:text-[#FFF0A6]
                                  `
                              }
                            `}
                          >
                            {item.label}
                          </span>
                        )}

                        {/* Active Decoration */}
                        {active && !collapsed && (
                          <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-[#FFF0A6] shadow-[0_0_9px_3px_rgba(255,235,140,0.8)]" />
                        )}

                        {/* Hover Corner Glow */}
                        <span className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-[#FFD54A]/0 blur-2xl transition-all duration-500 group-hover:bg-[#FFD54A]/30" />
                      </Link>
                    </MagneticHover>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin Profile */}
        <div className="shrink-0 border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#FFF0A6]/70 bg-gradient-to-br from-[#FFF0A6] to-[#B69A43] font-bold text-[#121414] shadow-[0_0_15px_rgba(255,215,75,0.3)]">
              K
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  Kavya
                </p>
                <p className="text-xs text-gray-400">
                  Super Administrator
                </p>
              </div>
            )}

            <button
              title="Logout"
              aria-label="Logout"
              className="rounded-lg p-2 text-gray-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 hover:shadow-[0_0_12px_rgba(248,113,113,0.35)]"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Gold Shimmer Animation */}
      <style jsx global>{`
        @keyframes kbcShimmer {
          0% {
            transform: translateX(-30px) rotate(12deg);
            opacity: 0;
          }

          40% {
            opacity: 1;
          }

          70% {
            opacity: 0.7;
          }

          100% {
            transform: translateX(320px) rotate(12deg);
            opacity: 0;
          }
        }

        .kbc-sidebar-menu {
          -webkit-tap-highlight-color: transparent;
        }

        @media (hover: none) and (pointer: coarse) {
          .kbc-sidebar-menu:active {
            border-color: #fff0a6 !important;
            color: #fff0a6 !important;
            background: rgba(255, 215, 75, 0.2) !important;
            box-shadow:
              0 0 12px rgba(255, 235, 140, 1),
              0 0 25px rgba(255, 193, 7, 0.6),
              inset 0 0 15px rgba(255, 230, 120, 0.15);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .kbc-sidebar-menu,
          .kbc-sidebar-menu * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
