"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  BookOpen,
  Radio,
  PlayCircle,
  Search,
  GraduationCap,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MoreHorizontal,
  Command,
} from "lucide-react";

type SidebarProps = {
  activeItem: string;
  onNavigate: (item: string) => void;
};

const menuGroups = [
  {
    title: "LEARNING SPACE",
    items: [
      {
        id: "dashboard",
        name: "Overview",
        icon: LayoutDashboard,
        count: 0,
      },
      {
        id: "courses",
        name: "My Courses",
        icon: BookOpen,
        count: 4,
      },
      {
        id: "live",
        name: "Live Classes",
        icon: Radio,
        count: 2,
      },
      {
        id: "rec",
        name: "Recordings",
        icon: PlayCircle,
        count: 0,
      },
    ],
  },
];

export default function Sidebar({
  activeItem,
  onNavigate,
}: SidebarProps) {
  const [expanded, setExpanded] = useState(true);
  const [search, setSearch] = useState("");

  // Ctrl + B: Collapse / Expand
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.ctrlKey &&
        event.key.toLowerCase() === "b"
      ) {
        event.preventDefault();
        setExpanded((previous) => !previous);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Filter navigation
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
        group/sidebar relative sticky top-4 z-40 m-3
        flex h-[calc(100vh-1.5rem)] shrink-0 flex-col
        overflow-visible rounded-[26px]
        border border-[#EFE8A8]/15
        bg-gradient-to-br from-[#292822]/95 via-[#121414]/95 to-[#171714]/95
        shadow-[0_20px_70px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.10)]
        backdrop-blur-3xl
        transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${expanded ? "w-[255px]" : "w-[76px]"}
      `}
    >
      {/* BACKGROUND LIGHTING */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[26px]">

        <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-[#C9A45C]/15 blur-[90px]" />

        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#EFE8A8]/10 blur-[100px]" />

        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#EFE8A8]/50 to-transparent" />

        <div className="absolute inset-0 rounded-[26px] ring-1 ring-inset ring-white/[0.04]" />

      </div>

      {/* BRAND HEADER */}
      <div className="relative flex h-[82px] shrink-0 items-center gap-3 border-b border-white/[0.07] px-4">

        <div className="relative h-11 w-11 shrink-0 rounded-xl border border-[#C9A45C]/60 bg-white/[0.07] p-1 shadow-[0_0_22px_rgba(201,164,92,0.18)] transition duration-500 hover:shadow-[0_0_30px_rgba(201,164,92,0.35)]">

          <Image
            src="/kavyas-logo.png"
            alt="Kavyas Beauty Centre"
            width={44}
            height={44}
            priority
            className="h-full w-full rounded-lg object-contain"
          />

        </div>

        <div
          className={`min-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ${
            expanded
              ? "w-40 translate-x-0 opacity-100"
              : "w-0 -translate-x-3 opacity-0"
          }`}
        >
          <h2 className="font-serif text-[15px] font-bold tracking-wide text-[#FAF5ED]">
            KAVYAS
          </h2>

          <p className="mt-1 text-[8px] font-semibold uppercase tracking-[2.5px] text-[#C9A45C]">
            Beauty Academy
          </p>
        </div>

        {/* COLLAPSE BUTTON */}
        <button
          type="button"
          onClick={() => setExpanded((previous) => !previous)}
          title={expanded ? "Collapse sidebar (Ctrl+B)" : "Expand sidebar (Ctrl+B)"}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          className={`
            absolute -right-3 top-1/2 z-50
            grid h-7 w-7 -translate-y-1/2 place-items-center
            rounded-full border border-[#C9A45C]/50
            bg-[#25241F] text-[#EFE8A8]
            shadow-[0_4px_15px_rgba(0,0,0,0.4)]
            transition-all duration-300
            hover:scale-110 hover:bg-[#C9A45C] hover:text-[#121414]
          `}
        >
          {expanded ? (
            <ChevronLeft size={15} />
          ) : (
            <ChevronRight size={15} />
          )}
        </button>

      </div>

      {/* SEARCH */}
      <div className="px-3 pb-5 pt-5">

        {expanded ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.09] bg-white/[0.055] px-3 py-2.5 transition-all duration-300 focus-within:border-[#C9A45C]/50 focus-within:bg-white/[0.09]">

            <Search size={15} className="shrink-0 text-[#C9A45C]" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search menu..."
              aria-label="Search navigation menu"
              className="w-full min-w-0 bg-transparent text-[11px] text-[#FAF5ED] outline-none placeholder:text-white/35"
            />

            <span className="flex shrink-0 items-center gap-1 rounded-md border border-white/10 px-1.5 py-1 text-[8px] text-white/35">
              <Command size={9} />
              B
            </span>

          </div>
        ) : (
          <button
            type="button"
            title="Expand sidebar to search"
            onClick={() => setExpanded(true)}
            className="mx-auto grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[#C9A45C] transition hover:border-[#C9A45C]/40 hover:bg-[#C9A45C]/10"
          >
            <Search size={16} />
          </button>
        )}

      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-6 overflow-x-hidden overflow-y-auto px-3 pb-5">

        {filteredGroups.map((group) => (
          <div key={group.title}>

            {expanded && (
              <div className="mb-3 flex items-center gap-2 px-2">
                <span className="h-px w-3 bg-[#C9A45C]/60" />

                <p className="whitespace-nowrap text-[9px] font-bold tracking-[2px] text-[#E8D8C5]/45">
                  {group.title}
                </p>
              </div>
            )}

            <div className="space-y-1.5">

              {group.items.map((item) => {
                const isActive = activeItem === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    title={!expanded ? item.name : undefined}
                    aria-current={isActive ? "page" : undefined}
                    className={`
                      group/item relative flex w-full items-center gap-3
                      overflow-visible rounded-xl border px-3 py-3
                      text-left transition-all duration-300
                      ${
                        isActive
                          ? "border-[#C9A45C]/30 bg-gradient-to-r from-[#C9A45C]/20 via-[#C9A45C]/10 to-transparent text-[#EFE8A8] shadow-[0_5px_20px_rgba(201,164,92,0.09)]"
                          : "border-transparent text-[#E8D8C5]/60 hover:translate-x-1 hover:border-white/[0.08] hover:bg-white/[0.055] hover:text-[#FAF5ED]"
                      }
                    `}
                  >

                    {/* ACTIVE GOLD INDICATOR */}
                    {isActive && (
                      <span className="absolute -left-[13px] top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-[#EFE8A8] shadow-[0_0_12px_rgba(201,164,92,0.8)]" />
                    )}

                    {/* ICON */}
                    <span
                      className={`
                        grid h-9 w-9 shrink-0 place-items-center rounded-xl
                        border transition-all duration-300
                        ${
                          isActive
                            ? "border-[#EFE8A8]/20 bg-[#EFE8A8]/15 text-[#EFE8A8] shadow-[0_0_15px_rgba(201,164,92,0.12)]"
                            : "border-white/[0.06] bg-white/[0.035] text-[#C9A45C]/80 group-hover/item:border-[#C9A45C]/25 group-hover/item:bg-[#C9A45C]/10 group-hover/item:text-[#EFE8A8]"
                        }
                      `}
                    >
                      <Icon size={17} strokeWidth={1.8} />
                    </span>

                    {/* LABEL */}
                    <span
                      className={`
                        min-w-0 flex-1 overflow-hidden whitespace-nowrap
                        text-[12px] font-medium
                        transition-all duration-300
                        ${
                          expanded
                            ? "translate-x-0 opacity-100"
                            : "w-0 -translate-x-2 opacity-0"
                        }
                      `}
                    >
                      {item.name}
                    </span>

                    {/* COUNT */}
                    {expanded && item.count > 0 && (
                      <span
                        className={`
                          rounded-md px-2 py-1 text-[9px] font-bold
                          ${
                            isActive
                              ? "bg-[#EFE8A8] text-[#121414]"
                              : "bg-white/[0.07] text-[#E8D8C5]/65"
                          }
                        `}
                      >
                        {item.count}
                      </span>
                    )}

                    {/* COLLAPSED TOOLTIP */}
                    {!expanded && (
                      <span className="pointer-events-none absolute left-[65px] z-50 translate-x-2 whitespace-nowrap rounded-lg border border-[#C9A45C]/25 bg-[#171714] px-3 py-2 text-[11px] text-[#FAF5ED] opacity-0 shadow-xl transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100">
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
          <p className="px-3 py-4 text-[11px] text-white/40">
            No menu items found.
          </p>
        )}

      </nav>

      {/* BOTTOM PROFILE AREA */}
      <div className="relative shrink-0 border-t border-white/[0.08] bg-white/[0.025] p-3">

        {/* SUPPORT */}
        <div
          className={`
            mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5
            text-[#E8D8C5]/55 transition-all duration-300
            hover:bg-white/[0.055] hover:text-[#EFE8A8]
            ${!expanded ? "justify-center" : ""}
          `}
          title={!expanded ? "Help & Support" : undefined}
        >
          <Headphones size={17} className="shrink-0 text-[#C9A45C]" />

          {expanded && (
            <span className="text-[11px] font-medium">
              Help & Support
            </span>
          )}
        </div>

        {/* PROFILE */}
        <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.09] bg-white/[0.045] p-2 transition-all duration-300 hover:border-[#C9A45C]/30 hover:bg-white/[0.075]">

          <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#C9A45C]/60 bg-gradient-to-br from-[#EFE8A8] to-[#C9A45C] text-xs font-bold text-[#121414] shadow-[0_0_15px_rgba(201,164,92,0.16)]">
            A

            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#171714] bg-emerald-400" />
          </div>

          {expanded && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-[#FAF5ED]">
                  Anjali
                </p>

                <p className="mt-0.5 truncate text-[9px] text-[#E8D8C5]/45">
                  Student Account
                </p>
              </div>

              <button
                type="button"
                title="Profile options"
                aria-label="Profile options"
                className="rounded-md p-1 text-[#E8D8C5]/45 transition hover:bg-white/10 hover:text-[#EFE8A8]"
              >
                <MoreHorizontal size={17} />
              </button>
            </>
          )}

        </div>

        {expanded && (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <Sparkles size={10} className="text-[#C9A45C]/70" />

            <p className="text-[8px] font-medium tracking-[1.5px] text-[#E8D8C5]/30">
              KBC BEAUTY ACADEMY
            </p>
          </div>
        )}

      </div>

    </aside>
  );
}
