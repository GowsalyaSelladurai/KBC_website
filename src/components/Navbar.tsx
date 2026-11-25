
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

export const navigation = [
  {
    title: "MAIN MENU",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Appointments", href: "/appointments", icon: CalendarDays },
      { label: "Students", href: "/students", icon: Users },
      { label: "Courses & Programs", href: "/courses", icon: GraduationCap },
      { label: "Video Library", href: "/videos", icon: Video },
      { label: "Live Classes", href: "/live-classes", icon: Radio },
      { label: "Enrollments", href: "/enrollments", icon: ClipboardList },
    ],
  },
  {
    title: "BUSINESS MANAGEMENT",
    items: [
      { label: "Revenue & Income", href: "/revenue", icon: Wallet },
      { label: "Expenses & Payments", href: "/expenses", icon: Receipt },
      { label: "Salon Services", href: "/services", icon: Scissors },
      { label: "Staff & Instructors", href: "/staff", icon: UserRoundCog },
      { label: "Inventory & Products", href: "/inventory", icon: Package },
      { label: "Reports & Analytics", href: "/reports", icon: ChartNoAxesCombined },
    ],
  },
  {
    title: "SYSTEM MANAGEMENT",
    items: [
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Security & Devices", href: "/security", icon: ShieldCheck },
      { label: "Certificates & Documents", href: "/documents", icon: Award },
      { label: "Enquiries & Leads", href: "/enquiries", icon: MessageSquareText },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];
