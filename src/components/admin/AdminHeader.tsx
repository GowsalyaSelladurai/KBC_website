"use client";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#24201b] bg-[#0c0c0b]/90 px-6 backdrop-blur-md">
      {/* Search Input Pill */}
      <div className="relative w-full max-w-md">
        <svg
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#736c62]"
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
          placeholder="Search courses, students..."
          className="w-full rounded-full border border-[#2b251e] bg-[#141311] py-2 pl-10 pr-4 text-xs text-[#e8dfd1] outline-none placeholder:text-[#666056] transition focus:border-[#d8b16d]/60 focus:ring-1 focus:ring-[#d8b16d]/30"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#26211b] bg-[#141311] text-[#91897e] transition hover:border-[#d8b16d]/40 hover:text-[#d8b16d]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
            3
          </span>
        </button>

        {/* Profile Pill */}
        <div className="flex items-center gap-2.5 rounded-full border border-[#26211b] bg-[#141311] py-1 pl-1 pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-[#d5a45a] to-[#f4e5c5] text-xs font-bold text-[#1c140c] shadow-sm">
            👩‍🦰
          </div>
          <span className="text-xs font-medium text-[#e8dfd1]">Admin</span>
          <svg className="h-3.5 w-3.5 text-[#736c62]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </header>
  );
}
