
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
        className="fixed left-4 top-5 z-50 rounded-lg bg-[#121414] p-2 text-[#EFE8A8] lg:hidden"
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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#121414] text-white transition-all duration-300
          ${collapsed ? "w-20" : "w-72"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand */}
        <div className="flex h-24 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <img
              src="/kavyas-logo.png"
              alt="Kavyas Beauty Centre Logo"
              className="h-14 w-14 shrink-0 rounded-full border border-[#EFE8A8]/60 object-cover shadow-[0_0_15px_rgba(239,232,168,0.15)]"
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

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-[#EFE8A8] lg:block"
            aria-label="Collapse sidebar"
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>

          <button
            onClick={() => setMobileOpen(false)}
            className="text-gray-400 lg:hidden"
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
                        className={`
                          group relative isolate flex items-center gap-3
                          overflow-hidden rounded-xl px-3 py-3 text-sm
                          transition-all duration-300 ease-out
                          ${
                            active
                              ? "border border-[#EFE8A8]/25 bg-gradient-to-r from-[#343426] via-[#25271f] to-[#1b1e1c] font-semibold text-[#EFE8A8] shadow-[0_0_18px_rgba(239,232,168,0.09),inset_0_0_15px_rgba(239,232,168,0.04)]"
                              : "border border-transparent text-[#F5F1E6] hover:border-[#EFE8A8]/10 hover:bg-[#222522] hover:text-[#EFE8A8]"
                          }
                        `}
                      >
                        {/* Animated Gold Indicator */}
                        {active && (
                          <>
                            <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#EFE8A8] shadow-[0_0_8px_2px_rgba(239,232,168,0.65)]" />

                            <span className="pointer-events-none absolute -left-10 top-0 h-full w-16 rotate-12 bg-gradient-to-r from-transparent via-[#EFE8A8]/10 to-transparent animate-[kbcShimmer_3s_ease-in-out_infinite]" />

                            <span className="pointer-events-none absolute right-3 top-1/2 -z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-[#EFE8A8]/10 blur-xl" />
                          </>
                        )}

                        {/* Icon */}
                        <span
                          className={`
                            relative z-10 flex shrink-0 items-center justify-center
                            transition-all duration-300
                            ${
                              active
                                ? "scale-110 text-[#EFE8A8] drop-shadow-[0_0_7px_rgba(239,232,168,0.55)]"
                                : "group-hover:scale-110 group-hover:text-[#EFE8A8]"
                            }
                          `}
                        >
                          <Icon size={19} />
                        </span>

                        {/* Label */}
                        {!collapsed && (
                          <span
                            className={`relative z-10 whitespace-nowrap transition-all duration-300 ${
                              active
                                ? "translate-x-0 text-[#EFE8A8]"
                                : "group-hover:translate-x-1"
                            }`}
                          >
                            {item.label}
                          </span>
                        )}

                        {/* Active Decoration */}
                        {active && !collapsed && (
                          <span className="absolute right-3 h-1.5 w-1.5 rounded-full bg-[#EFE8A8] shadow-[0_0_9px_2px_rgba(239,232,168,0.5)]" />
                        )}
                      </Link>
                    </MagneticHover>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin Profile */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFE8A8] font-bold text-[#121414]">
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
              className="text-gray-400 transition hover:text-red-400"
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
      `}</style>
    </>
  );
}
