"use client";

export default function AdminHeader({
  onMenuClick,
}: {
  onMenuClick?: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-[#D6AD65]/20 bg-[#090807]/90 px-4 backdrop-blur-md sm:px-6">
      <div className="flex flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D6AD65]/25 bg-[#15120F] text-[#F1D69A] transition hover:border-[#D6AD65]/50 md:hidden"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div className="relative w-full max-w-md">
          <svg
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#BDB4A7]/70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full rounded-full border border-[#D6AD65]/25 bg-[#15120F] py-2 pl-10 pr-4 text-xs text-white outline-none placeholder:text-[#BDB4A7]/60 transition focus:border-[#D6AD65]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#D6AD65]/25 bg-[#15120F] text-[#BDB4A7] transition hover:border-[#D6AD65]/60 hover:text-[#F1D69A]"
        >
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#D6AD65]" />
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2.5 rounded-full border border-[#D6AD65]/25 bg-[#15120F] py-1 pl-1.5 pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-[#D6AD65] to-[#F1D69A] text-xs font-bold text-[#090807]">
            A
          </div>
          <span className="hidden text-xs font-medium text-white sm:inline">Admin</span>
          <svg className="h-3.5 w-3.5 text-[#BDB4A7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </header>
  );
}
