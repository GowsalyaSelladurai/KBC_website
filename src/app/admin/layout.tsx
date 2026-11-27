"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="kbc-luxury-bg flex min-h-screen overflow-x-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden w-[236px] shrink-0 md:block">
        <div className="fixed inset-y-0 left-0 z-30 w-[236px]">
          <Sidebar />
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="animate-kbc-backdrop fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative z-10 h-full">
            <Sidebar onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 px-4 pb-10 pt-5 sm:px-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
