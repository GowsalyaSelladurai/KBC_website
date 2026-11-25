
"use client";

import { useEffect, useState } from "react";

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
        overflow-visible rounded-[28px]
        border border-[#E8DDCE]/[0.10]
        bg-[#292522]/90
        shadow-[0_20px_80px_rgba(0,0,0,0.45)]
        backdrop-blur-2xl
        transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${expanded ? "w-[270px]" : "w-[82px]"}
      `}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#B89970]/[0.10] blur-[80px]" />
        <div className="absolute -bottom-20 -right-16 h-48 w-48 rounded-full bg-[#D6B77A]/[0.08] blur-[80px]" />
      </div>

      {/* Brand section */}
      <div className="relative flex h-[90px] shrink-0 items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#B89970]/40 bg-[#B89970]/15 shadow-[0_0_25px_rgba(184,153,112,0.15)]">
            <span className="text-xl font-bold text-[#D6B77A]">A</span>
          </div>

          <div
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
              expanded
                ? "w-36 translate-x-0 opacity-100"
                : "w-0 -translate-x-3 opacity-0"
            }`}
          >
            <h2 className="text-lg font-bold tracking-wide text-[#F5F0E8]">
              Academy
            </h2>
            <p className="mt-0.5 text-[9px] font-medium tracking-[3px] text-[#B89970]/80">
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
            rounded-full border border-[#B89970]/40
            bg-[#292522] text-xs text-[#D6B77A]
            shadow-lg transition-all duration-300
            hover:scale-110 hover:bg-[#B89970] hover:text-[#292522]
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
          <div className="flex items-center gap-3 rounded-2xl border border-[#E8DDCE]/[0.10] bg-[#F5F0E8]/[0.04] px-3 py-3 transition-all duration-300 focus-within:border-[#B89970]/50 focus-within:bg-[#F5F0E8]/[0.07]">
            <span className="text-sm text-[#E8DDCE]/50">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search menu..."
              className="w-full bg-transparent text-xs text-[#F5F0E8] outline-none placeholder:text-[#E8DDCE]/40"
            />
            <span className="whitespace-nowrap rounded-md border border-[#E8DDCE]/15 px-1.5 py-1 text-[9px] text-[#E8DDCE]/40">
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
              <p className="mb-4 px-3 text-[9px] font-bold tracking-[2.5px] text-[#E8DDCE]/45">
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
                          ? "border-[#B89970]/30 bg-[#B89970]/[0.16] text-[#D6B77A] shadow-[0_0_25px_rgba(184,153,112,0.10)]"
                          : "border-transparent text-[#E8DDCE]/65 hover:translate-x-1 hover:border-[#E8DDCE]/[0.10] hover:bg-[#F5F0E8]/[0.06] hover:text-[#F5F0E8]"
                      }
                    `}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute -left-[13px] top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-[#D6B77A] shadow-[0_0_12px_#B89970]" />
                    )}

                    {/* Icon */}
                    <span
                      className={`
                        grid h-8 w-8 shrink-0 place-items-center
                        rounded-xl text-xl
                        transition-all duration-300
                        ${
                          isActive
                            ? "bg-[#B89970]/20 text-[#D6B77A]"
                            : "bg-[#F5F0E8]/[0.04] text-[#E8DDCE]/60 group-hover/item:bg-[#B89970]/15 group-hover/item:text-[#D6B77A]"
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
                              ? "bg-[#D6B77A] text-[#292522]"
                              : "bg-[#F5F0E8]/[0.08] text-[#E8DDCE]/60 group-hover/item:text-[#F5F0E8]"
                          }
                        `}
                      >
                        {item.count}
                      </span>
                    )}

                    {/* Collapsed tooltip */}
                    {!expanded && (
                      <span className="pointer-events-none absolute left-[68px] z-50 translate-x-2 whitespace-nowrap rounded-xl border border-[#B89970]/20 bg-[#292522] px-3 py-2 text-xs text-[#F5F0E8] opacity-0 shadow-xl transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100">
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
          <p className="px-3 py-4 text-xs text-[#E8DDCE]/50">
            No menu items found.
          </p>
        )}
      </nav>

      {/* Bottom section */}
      <div className="relative shrink-0 border-t border-[#E8DDCE]/[0.10] p-3">
        {/* Help */}
        <button
          className="
            mb-3 flex w-full items-center gap-3 rounded-xl
            px-3 py-3 text-[#E8DDCE]/60 transition-all duration-300
            hover:bg-[#F5F0E8]/[0.06] hover:text-[#D6B77A]
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
        <div className="flex items-center gap-3 rounded-2xl border border-[#E8DDCE]/[0.10] bg-[#F5F0E8]/[0.05] p-2.5 transition-all duration-300 hover:border-[#B89970]/30 hover:bg-[#F5F0E8]/[0.08]">
          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#B89970]/50 bg-gradient-to-br from-[#D6B77A] to-[#B89970] text-sm font-bold text-[#292522] shadow-[0_0_15px_rgba(184,153,112,0.15)]">
            A
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#292522] bg-green-400" />
          </div>

          {expanded && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#F5F0E8]">
                Anjali
              </p>
              <p className="mt-1 text-[10px] text-[#E8DDCE]/55">
                Student Account
              </p>
            </div>
          )}

          {expanded && (
            <button
              title="Profile options"
              className="text-[#E8DDCE]/50 transition hover:text-[#D6B77A]"
            >
              ···
            </button>
          )}
        </div>

        {expanded && (
          <p className="mt-4 text-center text-[9px] tracking-wider text-[#E8DDCE]/30">
            POWERED BY ACADEMY
          </p>
        )}
      </div>
    </aside>
  );
}
