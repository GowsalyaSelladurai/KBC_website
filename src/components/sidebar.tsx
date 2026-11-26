
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type SidebarProps = {
  activeItem: string;
  onNavigate: (item: string) => void;
};

const menuGroups = [
  {
    title: "MAIN MENU",
    items: [
      { id: "dashboard", name: "Overview", icon: "⌂", count: 0 },
      { id: "courses", name: "My Courses", icon: "▤", count: 4 },
      { id: "live", name: "Live Classes", icon: "◉", count: 2 },
      { id: "rec", name: "Recordings", icon: "▷", count: 0 },
    ],
  },
];

export default function Sidebar({
  activeItem,
  onNavigate,
}: SidebarProps) {
  const [expanded, setExpanded] = useState(true);
  const [search, setSearch] = useState("");

  // Ctrl + B keyboard shortcut
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setExpanded((previous) => !previous);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Search menu items
  const filteredGroups = menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside
      className={`
        group/sidebar relative sticky top-4 m-4
        flex h-[calc(100vh-2rem)] shrink-0 flex-col
        overflow-hidden rounded-[30px]
        border border-white/[0.14]
        bg-gradient-to-br from-[#242522]/95 via-[#121414]/90 to-[#171612]/95
        shadow-[0_24px_80px_rgba(18,20,20,0.42),inset_0_1px_0_rgba(255,255,255,0.12)]
        backdrop-blur-[28px] supports-[backdrop-filter]:bg-[#121414]/75
        transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${expanded ? "w-[270px]" : "w-[82px]"}
      `}
    >
      {/* Glassmorphism lighting and inner glass edge */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[30px]">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#C9A45C]/[0.16] blur-[90px]" />
        <div className="absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-[#EFE8A8]/[0.10] blur-[95px]" />
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        <div className="absolute inset-0 rounded-[30px] ring-1 ring-inset ring-white/[0.06]" />
      </div>

      {/* Brand section */}
      <div className="relative flex h-[90px] shrink-0 items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-[#EFE8A8]/35 bg-white/[0.08] p-1.5 shadow-[0_8px_28px_rgba(201,164,92,0.18)] backdrop-blur-xl">
            <Image
              src="/logo.jpeg"
              alt="Kavyas Beauty Centre logo"
              width={48}
              height={48}
              priority
              className="h-full w-full object-contain"
            />
          </div>

          <div
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
              expanded
                ? "w-36 translate-x-0 opacity-100"
                : "w-0 -translate-x-3 opacity-0"
            }`}
          >
            <h2 className="text-[15px] font-bold tracking-wide text-[#FAF5ED]">
              Kavyas Beauty Centre
            </h2>
            <p className="mt-0.5 text-[9px] font-medium tracking-[3px] text-[#C9A45C]/80">
              STUDENT PORTAL
            </p>
          </div>
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setExpanded((previous) => !previous)}
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
          className={`
            absolute -right-3 top-9 z-20
            grid h-7 w-7 place-items-center
            rounded-full border border-white/20
            bg-[#242522]/80 text-xs text-[#EFE8A8] backdrop-blur-xl
            shadow-lg transition-all duration-300
            hover:scale-110 hover:bg-[#C9A45C] hover:text-[#121414]
            ${expanded ? "rotate-0" : "rotate-180"}
          `}
        >
          ‹
        </button>
      </div>

      {/* Search */}
      <div
        className={`relative px-4 pb-6 transition-all duration-300 ${
          expanded ? "opacity-100" : "px-3 opacity-0"
        }`}
      >
        {expanded ? (
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-white/[0.07] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl transition-all duration-300 focus-within:border-[#EFE8A8]/50 focus-within:bg-white/[0.11]">
            <span className="text-sm text-[#E8D8C5]/50">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search menu..."
              className="w-full bg-transparent text-xs text-[#FAF5ED] outline-none placeholder:text-[#E8D8C5]/40"
            />
            <span className="whitespace-nowrap rounded-md border border-[#E8D8C5]/15 px-1.5 py-1 text-[9px] text-[#E8D8C5]/40">
              ⌘ K
            </span>
          </div>
        ) : (
          <div className="h-0" />
        )}
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 space-y-7 overflow-y-auto overflow-x-hidden px-3 pb-5">
        {filteredGroups.map((group) => (
          <div key={group.title}>
            {expanded && (
              <p className="mb-4 px-3 text-[9px] font-bold tracking-[2.5px] text-[#E8D8C5]/45">
                {group.title}
              </p>
            )}

            <div className="space-y-2">
              {group.items.map((item) => {
                const isActive = activeItem === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    title={!expanded ? item.name : undefined}
                    className={`
                      group/item relative flex w-full items-center
                      gap-3 overflow-visible rounded-2xl
                      border px-3 py-3.5 text-left
                      transition-all duration-300 ease-out
                      ${
                        isActive
                          ? "border-[#EFE8A8]/35 bg-gradient-to-r from-[#C9A45C]/25 via-[#C9A45C]/[0.14] to-white/[0.06] text-[#EFE8A8] shadow-[0_10px_28px_rgba(201,164,92,0.12),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl"
                          : "border-white/[0.06] bg-white/[0.025] text-[#E8D8C5]/70 hover:translate-x-1 hover:border-white/[0.14] hover:bg-white/[0.08] hover:text-[#FAF5ED] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-lg"
                      }
                    `}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute -left-[13px] top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-[#EFE8A8] shadow-[0_0_12px_#C9A45C]" />
                    )}

                    {/* Icon */}
                    <span
                      className={`
                        grid h-8 w-8 shrink-0 place-items-center
                        rounded-xl border border-white/[0.06] text-xl
                        transition-all duration-300
                        ${
                          isActive
                            ? "border-[#EFE8A8]/20 bg-[#EFE8A8]/15 text-[#EFE8A8] shadow-[0_0_18px_rgba(201,164,92,0.12)]"
                            : "bg-white/[0.04] text-[#E8D8C5]/65 group-hover/item:border-[#C9A45C]/25 group-hover/item:bg-[#C9A45C]/15 group-hover/item:text-[#EFE8A8]"
                        }
                      `}
                    >
                      {item.icon}
                    </span>

                    {/* Label */}
                    <span
                      className={`
                        flex-1 overflow-hidden whitespace-nowrap
                        text-[13px] font-medium
                        transition-all duration-300
                        ${
                          expanded
                            ? "translate-x-0 opacity-100"
                            : "w-0 -translate-x-3 opacity-0"
                        }
                      `}
                    >
                      {item.name}
                    </span>

                    {/* Count */}
                    {expanded && item.count > 0 && (
                      <span
                        className={`
                          rounded-lg px-2 py-1 text-[10px] font-bold
                          transition-all duration-300
                          ${
                            isActive
                              ? "bg-[#EFE8A8] text-[#121414]"
                              : "bg-[#FAF5ED]/[0.08] text-[#E8D8C5]/60 group-hover/item:text-[#FAF5ED]"
                          }
                        `}
                      >
                        {item.count}
                      </span>
                    )}

                    {/* Collapsed tooltip */}
                    {!expanded && (
                      <span className="pointer-events-none absolute left-[68px] z-50 translate-x-2 whitespace-nowrap rounded-xl border border-[#C9A45C]/20 bg-[#121414] px-3 py-2 text-xs text-[#FAF5ED] opacity-0 shadow-xl transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100">
                        {item.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {filteredGroups.length === 0 && expanded && (
          <p className="px-3 py-4 text-xs text-[#E8D8C5]/50">
            No menu items found.
          </p>
        )}
      </nav>

      {/* Bottom section */}
      <div className="relative shrink-0 border-t border-white/[0.12] bg-white/[0.025] p-3 backdrop-blur-xl">
        {/* Help */}
        <button
          className="
            mb-3 flex w-full items-center gap-3 rounded-xl
            px-3 py-3 text-[#E8D8C5]/60 transition-all duration-300
            hover:bg-[#FAF5ED]/[0.06] hover:text-[#EFE8A8]
          "
          title={!expanded ? "Help & Support" : undefined}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center text-lg">
            ?
          </span>

          {expanded && (
            <span className="text-xs font-medium">
              Help & Support
            </span>
          )}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.12] bg-white/[0.07] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all duration-300 hover:border-[#C9A45C]/35 hover:bg-white/[0.11]">
          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#C9A45C]/50 bg-gradient-to-br from-[#EFE8A8] to-[#C9A45C] text-sm font-bold text-[#121414] shadow-[0_0_15px_rgba(201,164,92,0.15)]">
            A
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#121414] bg-green-400" />
          </div>

          {expanded && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#FAF5ED]">
                Anjali
              </p>
              <p className="mt-1 text-[10px] text-[#E8D8C5]/55">
                Student Account
              </p>
            </div>
          )}

          {expanded && (
            <button
              title="Profile options"
              className="text-[#E8D8C5]/50 transition hover:text-[#EFE8A8]"
            >
              ···
            </button>
          )}
        </div>

        {expanded && (
          <p className="mt-4 text-center text-[9px] tracking-wider text-[#E8D8C5]/30">
            POWERED BY ACADEMY
          </p>
        )}
      </div>
    </aside>
  );
}
