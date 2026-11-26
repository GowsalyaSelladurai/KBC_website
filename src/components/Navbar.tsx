
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  CalendarDays,
  Users,
  GraduationCap,
  Video,
  Radio,
  ClipboardList,
  Wallet,
  Receipt,
  Scissors,
  UserRoundCog,
  Package,
  ChartNoAxesCombined,
  Bell,
  ShieldCheck,
  Award,
  MessageSquareText,
  Settings,
} from "lucide-react";

// ==========================================
// ADMIN SIDEBAR NAVIGATION DATA
// ==========================================

export const navigation = [
  {
    title: "MAIN MENU",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        label: "Appointments",
        href: "/admin/appointments",
        icon: CalendarDays,
      },
      {
        label: "Salon Services",
        href: "/admin/salon-services",
        icon: Scissors,
      },
      {
        label: "Students",
        href: "/students",
        icon: Users,
      },
      {
        label: "Courses & Programs",
        href: "/courses",
        icon: GraduationCap,
      },
      {
        label: "Video Library",
        href: "/videos",
        icon: Video,
      },
      {
        label: "Live Classes",
        href: "/live-classes",
        icon: Radio,
      },
      {
        label: "Enrollments",
        href: "/enrollments",
        icon: ClipboardList,
      },
    ],
  },

  // ==========================================
  // BUSINESS MANAGEMENT
  // ==========================================

  {
    title: "BUSINESS MANAGEMENT",
    items: [
      {
        label: "Revenue & Income",
        href: "/admin/revenue",
        icon: Wallet,
      },
      {
        label: "Expenses & Payments",
        href: "/admin/expenses-payments",
        icon: Receipt,
      },
      {
        label: "Staff & Instructors",
        href: "/admin/staff",
        icon: UserRoundCog,
      },
      {
        label: "Inventory & Products",
        href: "/admin/inventory",
        icon: Package,
      },
      {
        label: "Customers",
        href: "/admin/customers",
        icon: Users,
      },
      {
        label: "Reports & Analytics",
        href: "/admin/reports",
        icon: ChartNoAxesCombined,
      },
    ],
  },

  // ==========================================
  // SYSTEM MANAGEMENT
  // ==========================================

  {
    title: "SYSTEM MANAGEMENT",
    items: [
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
      },
      {
        label: "Security & Devices",
        href: "/admin/security",
        icon: ShieldCheck,
      },
      {
        label: "Certificates & Documents",
        href: "/admin/documents",
        icon: Award,
      },
      {
        label: "Enquiries & Leads",
        href: "/admin/enquiries",
        icon: MessageSquareText,
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

// ==========================================
// PUBLIC NAVIGATION
// ==========================================

const pub = [
  ["/", "Home"],
  ["/courses", "Courses"],
  ["/live", "Live Classes"],
  ["/login", "Student Login"],
];

// ==========================================
// STUDENT NAVIGATION
// ==========================================

const stu = [
  ["/student", "My Learning"],
  ["/live", "Live Classes"],
];

// ==========================================
// NAVBAR COMPONENT
// ==========================================

export default function Navbar() {
  const p = usePathname();
  const [o, setO] = useState(false);

  const inStu =
    p.startsWith("/student") || p.startsWith("/watch");

  return (
    <nav className="sticky top-0 z-30 border-b border-line bg-ink/90 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between">

        {/* BRAND LOGO */}

        <Link
          href="/"
          className="flex items-center gap-2 font-serif font-bold text-gold"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-gold">
            👑
          </span>

          KBC Saloon Academy
        </Link>

        {/* MOBILE MENU BUTTON */}

        <button
          aria-label="Menu"
          aria-expanded={o}
          className="rounded-lg border border-line px-3 py-1.5 md:hidden"
          onClick={() => setO(!o)}
        >
          ☰
        </button>

        {/* NAVIGATION LINKS */}

        <div
          className={`${
            o ? "flex" : "hidden"
          } absolute left-0 right-0 top-16 flex-col gap-1 border-b border-line bg-ink p-4 md:static md:flex md:flex-row md:items-center md:border-0 md:p-0`}
        >
          {(inStu ? stu : pub).map(([h, l]) => (
            <Link
              key={h}
              href={h}
              onClick={() => setO(false)}
              className={`rounded-lg px-3 py-2 text-sm ${
                p === h
                  ? "text-gold"
                  : "text-mute hover:text-gold"
              }`}
            >
              {l}
            </Link>
          ))}

          {/* STUDENT LOGOUT / ENROLLMENT */}

          {inStu ? (
            <Link href="/" className="btn-o btn-sm">
              Log out
            </Link>
          ) : (
            <Link href="/courses" className="btn btn-sm">
              Enroll Now
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
