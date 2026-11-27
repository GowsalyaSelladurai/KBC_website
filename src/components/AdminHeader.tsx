
"use client";

import { useState } from "react";
import {
  Bell,
  Search,
  UserCircle,
  ChevronDown,
  Menu,
  Settings,
  LogOut,
} from "lucide-react";

export default function AdminHeader() {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#393d36] bg-[#171a18] text-[#f5f3e8]">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Left Section */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-serif text-xl font-semibold tracking-wide text-[#EFE8A8]">
              KBC SALOON ACADEMY
            </h1>
            <p className="mt-1 text-xs text-[#aaa995]">
              Admin Control Panel
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-5">

          {/* Search */}
          <div className="hidden items-center gap-2 rounded-lg border border-[#393d36] bg-[#222522] px-3 py-2 md:flex">
            <Search size={17} className="text-[#aaa995]" />
            <input
              type="text"
              placeholder="Search..."
              className="w-36 bg-transparent text-sm text-[#f5f3e8] outline-none placeholder:text-[#aaa995] lg:w-48"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[#393d36] bg-[#222522] text-[#EFE8A8] transition hover:bg-[#30352e]"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#b9d69b]" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-72 rounded-xl border border-[#393d36] bg-[#1b1e1c] p-4 shadow-xl">
                <h3 className="mb-3 font-semibold text-[#EFE8A8]">
                  Notifications
                </h3>
                <p className="text-sm text-[#aaa995]">
                  You are all caught up!
                </p>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-[#393d36] bg-[#222522] px-3 py-2 transition hover:bg-[#30352e]"
            >
              <UserCircle size={25} className="text-[#EFE8A8]" />

              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-[#f5f3e8]">
                  Admin
                </p>
                <p className="text-xs text-[#aaa995]">
                  Administrator
                </p>
              </div>

              <ChevronDown size={15} className="text-[#aaa995]" />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-14 w-52 overflow-hidden rounded-xl border border-[#393d36] bg-[#1b1e1c] shadow-xl">
                <div className="border-b border-[#393d36] p-3">
                  <p className="text-sm font-semibold text-[#EFE8A8]">
                    Admin Account
                  </p>
                  <p className="text-xs text-[#aaa995]">
                    KBC Saloon Academy
                  </p>
                </div>

                <button
                  onClick={() => {
                    window.location.href = "/admin/settings";
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#f5f3e8] hover:bg-[#30352e]"
                >
                  <Settings size={16} className="text-[#EFE8A8]" />
                  Settings
                </button>

                <button
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#e6a39a] hover:bg-[#30352e]"
                >
                  <LogOut size={16} />
                  Back to Website
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
