"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Award,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Edit3,
  Gift,
  GraduationCap,
  IndianRupee,
  LogIn,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  User,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type MemberStatus = "Active" | "Inactive";
type AttendanceStatus = "Present" | "Absent" | "Late" | "Leave";
type MemberType = "Staff" | "Instructor";
type LeaveStatus = "Pending" | "Approved" | "Rejected";
type RoleVisualCategory = "Instructor" | "Salon Staff" | "Receptionist";

type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  type: MemberType;
  salary: number;
  joiningDate: string;
  dateOfBirth: string;
  status: MemberStatus;
  attendance: AttendanceStatus;
  avatar: string;
  experience: number;
  skills: string[];
};

type Appointment = {
  id: string;
  customer: string;
  phone: string;
  service: string;
  staff: string;
  date: string;
  time: string;
  amount: number;
  status: string;
  notes?: string;
  durationMinutes?: number;
};

type LeaveRequest = {
  id: string;
  memberId: string;
  fromDate: string;
  toDate: string;
  leaveType: string;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
};

type AttendanceRecord = {
  memberId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  onBreak: boolean;
};

type Tab =
  | "Overview"
  | "Attendance"
  | "Availability"
  | "Performance"
  | "Reminders"
  | "Leave"
  | "Smart Assignment";

type MemberComputedMetrics = {
  totalAppointments: number;
  completedAppointments: number;
  revenueGenerated: number;
  attendanceSummary: string;
  ratingSummary: string;
  activeDaysCount: number;
};

const STAFF_KEY = "kbc_staff_members_v1";
const APPOINTMENTS_KEY = "kbc_appointments_v1";
const LEAVE_KEY = "kbc_staff_leave_v1";
const CLOCK_KEY = "kbc_staff_clock_v1";
const OVERVIEW_PAGE_SIZE = 6;

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const formatDate = (value: string) => {
  if (!value) return "—";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value: string | null) => {
  if (!value) return "—";

  const [hour, minute] = value.split(":").map(Number);

  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const addMinutes = (time: string, duration: number) => {
  const total = timeToMinutes(time) + duration;

  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60
  ).padStart(2, "0")}`;
};

const defaultDuration = (service: string) => {
  const value = (service || "").toLowerCase();

  if (value.includes("bridal")) return 120;
  if (value.includes("hair spa")) return 60;
  if (value.includes("colour") || value.includes("color")) return 120;
  if (value.includes("facial")) return 60;
  if (value.includes("makeup")) return 90;

  return 45;
};

const getRoleVisualCategory = (member: Member): RoleVisualCategory => {
  if (member.type === "Instructor") return "Instructor";

  const roleText = `${member.role || ""} ${member.department || ""}`.toLowerCase();
  if (
    roleText.includes("reception") ||
    roleText.includes("front desk") ||
    roleText.includes("administration")
  ) {
    return "Receptionist";
  }

  return "Salon Staff";
};

const getMemberInitials = (member: Member): string => {
  if (member.avatar && member.avatar.trim()) {
    return member.avatar.trim().slice(0, 2).toUpperCase();
  }
  const parts = (member.name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return parts || "KB";
};

/* =========================================================
   FLOATING CARD STYLES
========================================================= */

const FLOATING_CARD_STYLES = `
  .kbc-floating-card {
    position: relative;
    border-radius: 20px;
    background: linear-gradient(155deg, rgba(31, 35, 33, 0.96) 0%, rgba(20, 23, 22, 0.99) 100%);
    box-shadow:
      inset 0 1px 0 0 rgba(226, 232, 240, 0.22),
      inset 0 -1px 0 0 rgba(10, 12, 11, 0.9),
      0 14px 32px -12px rgba(0, 0, 0, 0.72);
    transition:
      transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 260ms cubic-bezier(0.22, 1, 0.36, 1);
    transform-style: preserve-3d;
    will-change: transform;
  }

  .kbc-floating-card::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 20px;
    padding: 1px;
    background: linear-gradient(
      135deg,
      rgba(226, 232, 240, 0.34) 0%,
      rgba(148, 163, 184, 0.14) 40%,
      rgba(71, 85, 105, 0.20) 70%,
      rgba(203, 213, 225, 0.28) 100%
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  @media (hover: hover) and (pointer: fine) {
    .kbc-floating-card-tilt:hover {
      box-shadow:
        inset 0 1px 0 0 rgba(241, 245, 249, 0.36),
        inset 0 -1px 0 0 rgba(10, 12, 11, 0.95),
        0 24px 44px -14px rgba(0, 0, 0, 0.86);
    }
  }

  .kbc-card-instructor::before {
    background: linear-gradient(
      135deg,
      rgba(239, 232, 168, 0.48) 0%,
      rgba(203, 213, 225, 0.22) 45%,
      rgba(217, 179, 92, 0.34) 100%
    );
  }

  .kbc-card-salon::before {
    background: linear-gradient(
      135deg,
      rgba(226, 232, 240, 0.40) 0%,
      rgba(184, 169, 122, 0.24) 50%,
      rgba(203, 213, 225, 0.32) 100%
    );
  }

  .kbc-card-receptionist::before {
    background: linear-gradient(
      135deg,
      rgba(148, 163, 184, 0.38) 0%,
      rgba(100, 116, 139, 0.18) 55%,
      rgba(203, 213, 225, 0.26) 100%
    );
  }

  .kbc-identity-block-instructor {
    background:
      radial-gradient(circle at 24% 18%, rgba(239, 232, 168, 0.30), transparent 62%),
      linear-gradient(145deg, #564d2b 0%, #2d2919 58%, #181711 100%);
    box-shadow:
      inset 0 1px 1px rgba(250, 244, 198, 0.40),
      inset 0 -2px 5px rgba(0, 0, 0, 0.68),
      0 10px 20px -4px rgba(0, 0, 0, 0.55);
  }

  .kbc-identity-block-salon {
    background:
      radial-gradient(circle at 24% 18%, rgba(226, 232, 240, 0.24), transparent 62%),
      linear-gradient(145deg, #3c403a 0%, #232723 58%, #141715 100%);
    box-shadow:
      inset 0 1px 1px rgba(241, 245, 249, 0.34),
      inset 0 -2px 5px rgba(0, 0, 0, 0.68),
      0 10px 20px -4px rgba(0, 0, 0, 0.55);
  }

  .kbc-identity-block-receptionist {
    background:
      radial-gradient(circle at 24% 18%, rgba(186, 200, 218, 0.24), transparent 62%),
      linear-gradient(145deg, #323942 0%, #1e2329 58%, #121518 100%);
    box-shadow:
      inset 0 1px 1px rgba(226, 232, 240, 0.32),
      inset 0 -2px 5px rgba(0, 0, 0, 0.68),
      0 10px 20px -4px rgba(0, 0, 0, 0.55);
  }
`;

/* =========================================================
   DEFAULT DATA
========================================================= */

const initialMembers: Member[] = [
  {
    id: "KBC001",
    name: "Priya Sharma",
    email: "priya@kbcacademy.com",
    phone: "9876543210",
    role: "Senior Hair Stylist",
    department: "Hair Styling",
    type: "Staff",
    salary: 25000,
    joiningDate: "2023-06-12",
    dateOfBirth: "1997-12-08",
    status: "Active",
    attendance: "Present",
    avatar: "PS",
    experience: 5,
    skills: ["Hair Styling", "Hair Cut", "Hair Colour", "Hair Spa"],
  },
  {
    id: "KBC002",
    name: "Anjali Kumar",
    email: "anjali@kbcacademy.com",
    phone: "9876543211",
    role: "Makeup Artist",
    department: "Makeup",
    type: "Staff",
    salary: 22000,
    joiningDate: "2024-02-18",
    dateOfBirth: "1999-04-14",
    status: "Active",
    attendance: "Present",
    avatar: "AK",
    experience: 3,
    skills: ["Makeup", "Bridal Makeup", "Party Makeup", "Saree Draping"],
  },
  {
    id: "KBC003",
    name: "Meena Raj",
    email: "meena@kbcacademy.com",
    phone: "9876543212",
    role: "Beauty Instructor",
    department: "Beauty",
    type: "Instructor",
    salary: 35000,
    joiningDate: "2022-08-05",
    dateOfBirth: "1992-11-30",
    status: "Active",
    attendance: "Present",
    avatar: "MR",
    experience: 8,
    skills: ["Beauty", "Skin Care", "Facial", "Beauty Training"],
  },
  {
    id: "KBC004",
    name: "Divya Lakshmi",
    email: "divya@kbcacademy.com",
    phone: "9876543213",
    role: "Hair Trainer",
    department: "Hair Styling",
    type: "Instructor",
    salary: 32000,
    joiningDate: "2023-01-10",
    dateOfBirth: "1995-06-22",
    status: "Active",
    attendance: "Late",
    avatar: "DL",
    experience: 6,
    skills: ["Hair Styling", "Hair Cut", "Hair Colour", "Hair Training"],
  },
  {
    id: "KBC005",
    name: "Kavitha S",
    email: "kavitha@kbcacademy.com",
    phone: "9876543214",
    role: "Receptionist",
    department: "Administration",
    type: "Staff",
    salary: 18000,
    joiningDate: "2024-05-20",
    dateOfBirth: "2000-03-12",
    status: "Active",
    attendance: "Present",
    avatar: "KS",
    experience: 2,
    skills: ["Administration", "Reception", "Customer Service"],
  },
  {
    id: "KBC006",
    name: "Nandhini R",
    email: "nandhini@kbcacademy.com",
    phone: "9876543215",
    role: "Skincare Specialist",
    department: "Skincare",
    type: "Staff",
    salary: 24000,
    joiningDate: "2023-10-02",
    dateOfBirth: "1998-09-17",
    status: "Active",
    attendance: "Absent",
    avatar: "NR",
    experience: 4,
    skills: ["Skincare", "Facial", "Skin Treatment", "Cleanup"],
  },
];

const emptyMember: Member = {
  id: "",
  name: "",
  email: "",
  phone: "",
  role: "",
  department: "Hair Styling",
  type: "Staff",
  salary: 0,
  joiningDate: today(),
  dateOfBirth: "",
  status: "Active",
  attendance: "Absent",
  avatar: "",
  experience: 0,
  skills: [],
};

/* =========================================================
   DATA NORMALIZATION
   Handles older localStorage records without newer fields.
========================================================= */

function normalizeMember(raw: Partial<Member>, index: number): Member {
  const name = String(raw.name || "Team Member");

  const skills = Array.isArray(raw.skills)
    ? raw.skills.filter(
        (skill): skill is string => typeof skill === "string"
      )
    : [];

  return {
    id: String(raw.id || `KBC${String(index + 1).padStart(3, "0")}`),
    name,
    email: String(raw.email || ""),
    phone: String(raw.phone || ""),
    role: String(raw.role || "Team Member"),
    department: String(raw.department || "Other"),
    type: raw.type === "Instructor" ? "Instructor" : "Staff",
    salary: Number(raw.salary || 0),
    joiningDate: String(raw.joiningDate || today()),
    dateOfBirth: String(raw.dateOfBirth || ""),
    status: raw.status === "Inactive" ? "Inactive" : "Active",
    attendance: ["Present", "Absent", "Late", "Leave"].includes(
      String(raw.attendance)
    )
      ? (raw.attendance as AttendanceStatus)
      : "Absent",
    avatar:
      String(raw.avatar || "") ||
      name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    experience: Number(raw.experience || 0),
    skills,
  };
}

function normalizeAppointment(raw: any): Appointment {
  return {
    id: String(raw?.id || makeId()),
    customer: String(raw?.customer || ""),
    phone: String(raw?.phone || ""),
    service: String(raw?.service || ""),
    staff: String(raw?.staff || ""),
    date: String(raw?.date || ""),
    time: String(raw?.time || "09:00"),
    amount: Number(raw?.amount || 0),
    status: String(raw?.status || "Confirmed"),
    notes: String(raw?.notes || ""),
    durationMinutes: Number(raw?.durationMinutes || 0) || undefined,
  };
}

/* =========================================================
   REUSABLE FLOATING STAFF IDENTITY CARD
========================================================= */

interface FloatingStaffProfileCardProps {
  member: Member;
  metrics: MemberComputedMetrics;
  canHoverTilt: boolean;
  statusBadge: (value: string) => React.ReactNode;
  onViewProfile: (member: Member) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (member: Member) => void;
  onChangeAttendance: (memberId: string, attendance: AttendanceStatus) => void;
}

function FloatingStaffProfileCard({
  member,
  metrics,
  canHoverTilt,
  statusBadge,
  onViewProfile,
  onEditMember,
  onDeleteMember,
  onChangeAttendance,
}: FloatingStaffProfileCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const category = getRoleVisualCategory(member);
  const initials = getMemberInitials(member);
  const skills = Array.isArray(member.skills) ? member.skills.filter(Boolean) : [];

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!canHoverTilt || event.pointerType !== "mouse" || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
    const rotateY = offsetX * 7;
    const rotateX = -offsetY * 7;

    cardRef.current.style.transform = `perspective(1100px) rotateX(${rotateX.toFixed(
      2
    )}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
  };

  const handlePointerLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform =
      "perspective(1100px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  };

  const roleTheme =
    category === "Instructor"
      ? {
          cardModifier: "kbc-card-instructor",
          identityModifier: "kbc-identity-block-instructor text-[#EFE8A8]",
          pillClass:
            "border-[#EFE8A8]/35 bg-[#EFE8A8]/10 text-[#EFE8A8]",
          accentText: "text-[#EFE8A8]",
          icon: <GraduationCap size={12} />,
          label: "Instructor",
        }
      : category === "Receptionist"
      ? {
          cardModifier: "kbc-card-receptionist",
          identityModifier: "kbc-identity-block-receptionist text-slate-100",
          pillClass:
            "border-slate-300/25 bg-slate-400/10 text-slate-200",
          accentText: "text-slate-200",
          icon: <UserCheck size={12} />,
          label: "Receptionist",
        }
      : {
          cardModifier: "kbc-card-salon",
          identityModifier: "kbc-identity-block-salon text-[#F1E9B1]",
          pillClass:
            "border-[#A9A58A]/35 bg-[#A9A58A]/10 text-[#E6DFB5]",
          accentText: "text-[#E6DFB5]",
          icon: <Sparkles size={12} />,
          label: "Salon Staff",
        };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`kbc-floating-card ${roleTheme.cardModifier} ${
        canHoverTilt ? "kbc-floating-card-tilt" : ""
      } flex flex-col justify-between p-5`}
    >
      <div>
        {/* Floating Identity Header */}
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => onViewProfile(member)}
            title={`Open ${member.name}'s profile`}
            className={`${roleTheme.identityModifier} flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 text-xl font-bold tracking-wider transition hover:scale-[1.03]`}
          >
            {initials}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${roleTheme.pillClass}`}
              >
                {roleTheme.icon}
                {roleTheme.label}
              </span>

              <div className="flex items-center gap-1.5">
                <span className="rounded-md border border-white/10 bg-[#141716] px-2 py-0.5 font-mono text-[10px] text-[#969B90]">
                  {member.id}
                </span>
                {statusBadge(member.status)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onViewProfile(member)}
              className="mt-2 block w-full truncate text-left text-base font-semibold text-[#F5F1E6] transition hover:text-[#EFE8A8]"
            >
              {member.name}
            </button>

            <p className="truncate text-xs text-[#A6AA9D]">
              {member.role} · {member.department}
            </p>
          </div>
        </div>

        {/* Role-Specific Highlight Section */}
        {category === "Instructor" && (
          <div className="mt-4 rounded-xl border border-[#EFE8A8]/15 bg-[#151816]/90 p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 font-medium text-[#EFE8A8]">
                <BookOpen size={13} />
                Expertise & Training Focus
              </span>
              <span className="text-[#A9A58A]">
                {member.experience} yrs exp
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skills.length > 0 ? (
                skills.slice(0, 4).map((skill) => (
                  <span
                    key={`${member.id}-${skill}`}
                    className="rounded-md border border-[#EFE8A8]/20 bg-[#EFE8A8]/[0.07] px-2 py-0.5 text-[10px] text-[#F1EBD0]"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-[#858B7F]">
                  No specializations listed
                </span>
              )}
            </div>
          </div>
        )}

        {category === "Salon Staff" && (
          <div className="mt-4 rounded-xl border border-white/10 bg-[#151816]/90 p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 font-medium text-[#E6DFB5]">
                <Sparkles size={13} />
                Service Specialties
              </span>
              <span className="text-[#969B90]">
                {member.experience} yrs exp
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skills.length > 0 ? (
                skills.slice(0, 4).map((skill) => (
                  <span
                    key={`${member.id}-${skill}`}
                    className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-[#D7D6C8]"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-[#858B7F]">
                  No services listed
                </span>
              )}
            </div>
          </div>
        )}

        {category === "Receptionist" && (
          <div className="mt-4 rounded-xl border border-slate-300/15 bg-[#15181B]/90 p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 font-medium text-slate-200">
                <MessageSquare size={13} />
                Front-Desk Operations
              </span>
              <span className="text-slate-400">
                {member.experience} yrs exp
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skills.length > 0 ? (
                skills.slice(0, 4).map((skill) => (
                  <span
                    key={`${member.id}-${skill}`}
                    className="rounded-md border border-slate-300/15 bg-slate-400/[0.08] px-2 py-0.5 text-[10px] text-slate-200"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-400">
                  Administration & Client Desk
                </span>
              )}
            </div>
          </div>
        )}

        {/* Integrated Compact Performance Metrics */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-white/[0.07] bg-[#141716] px-2.5 py-2">
            <div className="flex items-center justify-between text-[10px] text-[#8D9387]">
              <span>Total Appts</span>
              <CalendarCheck size={12} className={roleTheme.accentText} />
            </div>
            <p className="mt-1 text-sm font-semibold tabular-nums text-[#F5F1E6]">
              {metrics.totalAppointments}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#141716] px-2.5 py-2">
            <div className="flex items-center justify-between text-[10px] text-[#8D9387]">
              <span>Completed</span>
              <CheckCircle2 size={12} className="text-emerald-300" />
            </div>
            <p className="mt-1 text-sm font-semibold tabular-nums text-[#F5F1E6]">
              {metrics.completedAppointments}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#141716] px-2.5 py-2">
            <div className="flex items-center justify-between text-[10px] text-[#8D9387]">
              <span>Rating</span>
              <Star size={12} className={roleTheme.accentText} />
            </div>
            <p className="mt-1 text-sm font-semibold tabular-nums text-[#F5F1E6]">
              {metrics.ratingSummary}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#141716] px-2.5 py-2">
            <div className="flex items-center justify-between text-[10px] text-[#8D9387]">
              <span>Revenue</span>
              <IndianRupee size={12} className={roleTheme.accentText} />
            </div>
            <p className="mt-1 truncate text-sm font-semibold tabular-nums text-[#F5F1E6]">
              {money(metrics.revenueGenerated)}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#141716] px-2.5 py-2">
            <div className="flex items-center justify-between text-[10px] text-[#8D9387]">
              <span>Attendance</span>
              <Activity size={12} className="text-emerald-300" />
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-[#F5F1E6]">
              {metrics.attendanceSummary}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#141716] px-2.5 py-2">
            <div className="flex items-center justify-between text-[10px] text-[#8D9387]">
              <span>Salary</span>
              <BriefcaseBusiness size={12} className="text-[#A9A58A]" />
            </div>
            <p className="mt-1 truncate text-sm font-semibold tabular-nums text-[#E5E1D2]">
              {money(member.salary)}
            </p>
          </div>
        </div>
      </div>

      {/* Card Footer: Inline Attendance Control & Actions */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.08] pt-3.5">
        <select
          aria-label={`Attendance status for ${member.name}`}
          value={member.attendance}
          onChange={(event) =>
            onChangeAttendance(
              member.id,
              event.target.value as AttendanceStatus
            )
          }
          className="rounded-lg border border-[#3B4039] bg-[#151916] px-2.5 py-1.5 text-xs text-[#E8E5D8] outline-none transition focus:border-[#A9A58A]"
        >
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
          <option value="Leave">Leave</option>
        </select>

        <div className="flex items-center gap-1">
          <button
            type="button"
            title="View profile"
            onClick={() => onViewProfile(member)}
            className="rounded-lg p-2 text-[#A9A58A] transition hover:bg-[#363A2F] hover:text-[#EFE8A8]"
          >
            <User size={16} />
          </button>

          <button
            type="button"
            title="Edit member"
            onClick={() => onEditMember(member)}
            className="rounded-lg p-2 text-[#A9A58A] transition hover:bg-[#363A2F] hover:text-[#EFE8A8]"
          >
            <Edit3 size={16} />
          </button>

          <button
            type="button"
            title="Delete member"
            onClick={() => onDeleteMember(member)}
            className="rounded-lg p-2 text-rose-300 transition hover:bg-rose-500/10"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function StaffPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [clockRecords, setClockRecords] = useState<AttendanceRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [canHoverTilt, setCanHoverTilt] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [overviewPage, setOverviewPage] = useState(1);

  const [memberModal, setMemberModal] = useState(false);
  const [profileMember, setProfileMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberForm, setMemberForm] = useState<Member>(emptyMember);
  const [skillInput, setSkillInput] = useState("");

  const [selectedDate, setSelectedDate] = useState(today());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const [leaveModal, setLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    memberId: "",
    fromDate: today(),
    toDate: today(),
    leaveType: "Casual Leave",
    reason: "",
  });

  const [assignForm, setAssignForm] = useState({
    service: "Hair Styling",
    date: today(),
    time: "10:00",
    duration: 60,
    customer: "",
    phone: "",
    amount: 0,
  });

  const [assignmentResult, setAssignmentResult] = useState<string | null>(
    null
  );

  /* =======================================================
     DESKTOP HOVER CAPABILITY CHECK
  ======================================================= */

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHoverTilt(query.matches);
    update();

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", update);
      return () => query.removeEventListener("change", update);
    }
    query.addListener(update);
    return () => query.removeListener(update);
  }, []);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    try {
      const savedMembers = localStorage.getItem(STAFF_KEY);
      const savedAppointments = localStorage.getItem(APPOINTMENTS_KEY);
      const savedLeaves = localStorage.getItem(LEAVE_KEY);
      const savedClock = localStorage.getItem(CLOCK_KEY);

      const parsedMembers = savedMembers
        ? JSON.parse(savedMembers)
        : initialMembers;

      setMembers(
        Array.isArray(parsedMembers)
          ? parsedMembers.map((member: Partial<Member>, index: number) =>
              normalizeMember(member, index)
            )
          : initialMembers
      );

      const parsedAppointments = savedAppointments
        ? JSON.parse(savedAppointments)
        : [];

      setAppointments(
        Array.isArray(parsedAppointments)
          ? parsedAppointments.map(normalizeAppointment)
          : []
      );

      const parsedLeaves = savedLeaves ? JSON.parse(savedLeaves) : [];
      setLeaveRequests(Array.isArray(parsedLeaves) ? parsedLeaves : []);

      const parsedClock = savedClock ? JSON.parse(savedClock) : [];
      setClockRecords(Array.isArray(parsedClock) ? parsedClock : []);
    } catch (error) {
      console.error("Unable to load staff data:", error);
      setMembers(initialMembers);
      setAppointments([]);
      setLeaveRequests([]);
      setClockRecords([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  /* =======================================================
     SAVE DATA
  ======================================================= */

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STAFF_KEY, JSON.stringify(members));
  }, [members, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(LEAVE_KEY, JSON.stringify(leaveRequests));
  }, [leaveRequests, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(CLOCK_KEY, JSON.stringify(clockRecords));
  }, [clockRecords, loaded]);

  const refreshAppointments = useCallback(() => {
    try {
      const saved = localStorage.getItem(APPOINTMENTS_KEY);
      const parsed = saved ? JSON.parse(saved) : [];

      setAppointments(
        Array.isArray(parsed) ? parsed.map(normalizeAppointment) : []
      );
    } catch {
      setAppointments([]);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    refreshAppointments();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === APPOINTMENTS_KEY) refreshAppointments();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshAppointments);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshAppointments);
    };
  }, [loaded, refreshAppointments]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const activeMembers = members.filter(
    (member) => member.status === "Active"
  );

  const pendingLeaves = leaveRequests.filter(
    (request) => request.status === "Pending"
  );

  const departments = Array.from(
    new Set(members.map((member) => member.department).filter(Boolean))
  );

  const presentCount = members.filter(
    (member) =>
      member.attendance === "Present" || member.attendance === "Late"
  ).length;

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const searchable = [
        member.name,
        member.email,
        member.phone,
        member.role,
        member.department,
        member.id,
        ...(Array.isArray(member.skills) ? member.skills : []),
      ]
        .join(" ")
        .toLowerCase();

      return (
        searchable.includes(search.toLowerCase()) &&
        (typeFilter === "All" || member.type === typeFilter) &&
        (statusFilter === "All" || member.status === statusFilter) &&
        (departmentFilter === "All" ||
          member.department === departmentFilter)
      );
    });
  }, [members, search, typeFilter, statusFilter, departmentFilter]);

  useEffect(() => {
    setOverviewPage(1);
  }, [search, typeFilter, statusFilter, departmentFilter]);

  const totalOverviewPages = Math.max(
    1,
    Math.ceil(filteredMembers.length / OVERVIEW_PAGE_SIZE)
  );
  const currentOverviewPage = Math.min(overviewPage, totalOverviewPages);

  const paginatedOverviewMembers = useMemo(() => {
    const start = (currentOverviewPage - 1) * OVERVIEW_PAGE_SIZE;
    return filteredMembers.slice(start, start + OVERVIEW_PAGE_SIZE);
  }, [filteredMembers, currentOverviewPage]);

  const memberMetricsMap = useMemo(() => {
    const map = new Map<string, MemberComputedMetrics>();

    for (const member of members) {
      const memberAppointments = appointments.filter(
        (appointment) =>
          appointment.staff.toLowerCase() === member.name.toLowerCase() &&
          appointment.status.toLowerCase() !== "cancelled"
      );

      const completed = memberAppointments.filter(
        (appointment) => appointment.status.toLowerCase() === "completed"
      );

      const memberClocks = clockRecords.filter(
        (record) => record.memberId === member.id && Boolean(record.checkIn)
      );

      const attendanceSummary =
        memberClocks.length > 0
          ? `${memberClocks.length}d · ${member.attendance}`
          : member.attendance;

      map.set(member.id, {
        totalAppointments: memberAppointments.length,
        completedAppointments: completed.length,
        revenueGenerated: completed.reduce(
          (sum, appointment) => sum + Number(appointment.amount || 0),
          0
        ),
        attendanceSummary,
        ratingSummary: "N/A",
        activeDaysCount: memberClocks.length,
      });
    }

    return map;
  }, [members, appointments, clockRecords]);

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status.toLowerCase() === "completed"
  );

  const performance = useMemo(() => {
    return members
      .map((member) => {
        const completed = completedAppointments.filter(
          (appointment) =>
            appointment.staff.toLowerCase() === member.name.toLowerCase()
        );

        return {
          ...member,
          completedCount: completed.length,
          revenue: completed.reduce(
            (sum, appointment) => sum + Number(appointment.amount || 0),
            0
          ),
        };
      })
      .sort((a, b) => {
        if (b.completedCount !== a.completedCount) {
          return b.completedCount - a.completedCount;
        }

        return b.revenue - a.revenue;
      });
  }, [members, completedAppointments]);

  const upcomingReminders = useMemo(() => {
    const items: {
      member: Member;
      type: "Birthday" | "Work Anniversary";
      date: string;
      days: number;
    }[] = [];

    members.forEach((member) => {
      const dates = [
        { value: member.dateOfBirth, type: "Birthday" as const },
        { value: member.joiningDate, type: "Work Anniversary" as const },
      ];

      dates.forEach(({ value, type }) => {
        if (!value) return;

        const [, month, day] = value.split("-").map(Number);
        if (!month || !day) return;

        const now = new Date();
        const next = new Date(now.getFullYear(), month - 1, day);
        const start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        if (next < start) next.setFullYear(next.getFullYear() + 1);

        const days = Math.round(
          (next.getTime() - start.getTime()) / 86400000
        );

        if (days <= 30) {
          items.push({
            member,
            type,
            date: `${next.getFullYear()}-${String(month).padStart(
              2,
              "0"
            )}-${String(day).padStart(2, "0")}`,
            days,
          });
        }
      });
    });

    return items.sort((a, b) => a.days - b.days);
  }, [members]);

  /* =======================================================
     ATTENDANCE
  ======================================================= */

  const getClockRecord = (memberId: string) =>
    clockRecords.find(
      (record) =>
        record.memberId === memberId && record.date === today()
    );

  const updateClock = (
    member: Member,
    action: "in" | "out" | "break" | "resume"
  ) => {
    const current = getClockRecord(member.id);
    const now = new Date();

    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const next: AttendanceRecord = current
      ? { ...current }
      : {
          memberId: member.id,
          date: today(),
          checkIn: null,
          checkOut: null,
          onBreak: false,
        };

    if (action === "in") {
      next.checkIn = time;
      next.checkOut = null;
      next.onBreak = false;

      setMembers((prev) =>
        prev.map((item) =>
          item.id === member.id
            ? { ...item, attendance: "Present" }
            : item
        )
      );
    }

    if (action === "out") {
      next.checkOut = time;
      next.onBreak = false;
    }

    if (action === "break") next.onBreak = true;
    if (action === "resume") next.onBreak = false;

    setClockRecords((prev) => [
      ...prev.filter(
        (record) =>
          !(record.memberId === member.id && record.date === today())
      ),
      next,
    ]);
  };

  const changeAttendance = (
    memberId: string,
    attendance: AttendanceStatus
  ) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, attendance } : member
      )
    );
  };

  /* =======================================================
     STAFF CRUD
  ======================================================= */

  const openAddMember = () => {
    setEditingMember(null);

    setMemberForm({
      ...emptyMember,
      id: `KBC${String(members.length + 1).padStart(3, "0")}`,
      skills: [],
    });

    setSkillInput("");
    setMemberModal(true);
  };

  const openEditMember = (member: Member) => {
    setEditingMember(member);

    setMemberForm({
      ...normalizeMember(member, 0),
      skills: Array.isArray(member.skills) ? [...member.skills] : [],
    });

    setSkillInput("");
    setProfileMember(null);
    setMemberModal(true);
  };

  const saveMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleaned = normalizeMember(
      {
        ...memberForm,
        name: memberForm.name.trim(),
        email: memberForm.email.trim(),
        phone: memberForm.phone.trim(),
        avatar: memberForm.name
          .split(" ")
          .filter(Boolean)
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        skills: Array.isArray(memberForm.skills)
          ? memberForm.skills
          : [],
      },
      members.length
    );

    if (!cleaned.name || !cleaned.role) return;

    if (editingMember) {
      setMembers((prev) =>
        prev.map((member) =>
          member.id === editingMember.id
            ? { ...cleaned, id: editingMember.id }
            : member
        )
      );
    } else {
      setMembers((prev) => [
        ...prev,
        { ...cleaned, id: cleaned.id || makeId() },
      ]);
    }

    setMemberModal(false);
    setProfileMember(null);
  };

  const deleteMember = (member: Member) => {
    if (!window.confirm(`Delete ${member.name} from the staff list?`)) {
      return;
    }

    setMembers((prev) =>
      prev.filter((item) => item.id !== member.id)
    );

    setLeaveRequests((prev) =>
      prev.filter((item) => item.memberId !== member.id)
    );

    if (profileMember?.id === member.id) {
      setProfileMember(null);
    }
  };

  const toggleMemberStatus = (member: Member) => {
    setMembers((prev) =>
      prev.map((item) =>
        item.id === member.id
          ? {
              ...item,
              status:
                item.status === "Active" ? "Inactive" : "Active",
            }
          : item
      )
    );

    setProfileMember(null);
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill) return;

    const existingSkills = Array.isArray(memberForm.skills)
      ? memberForm.skills
      : [];

    if (
      !existingSkills.some(
        (item) => item.toLowerCase() === skill.toLowerCase()
      )
    ) {
      setMemberForm((prev) => ({
        ...prev,
        skills: [...(Array.isArray(prev.skills) ? prev.skills : []), skill],
      }));
    }

    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setMemberForm((prev) => ({
      ...prev,
      skills: (Array.isArray(prev.skills) ? prev.skills : []).filter(
        (item) => item !== skill
      ),
    }));
  };

  const exportCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Role",
      "Department",
      "Type",
      "Salary",
      "Joining Date",
      "Date of Birth",
      "Status",
      "Attendance",
      "Skills",
    ];

    const rows = members.map((member) => [
      member.id,
      member.name,
      member.email,
      member.phone,
      member.role,
      member.department,
      member.type,
      member.salary,
      member.joiningDate,
      member.dateOfBirth,
      member.status,
      member.attendance,
      (Array.isArray(member.skills) ? member.skills : []).join("; "),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `kbc-staff-${today()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  /* =======================================================
     AVAILABILITY ENGINE
  ======================================================= */

  const getMemberAvailability = (
    member: Member,
    date: string,
    startTime: string,
    duration: number,
    ignoreAppointmentId?: string
  ) => {
    if (member.status !== "Active") {
      return { available: false, reason: "Inactive staff member" };
    }

    // Monday through Sunday: every day is a working day.
    const start = timeToMinutes(startTime);
    const end = start + duration;

    if (start < 9 * 60 || end > 18 * 60) {
      return {
        available: false,
        reason: "Outside working hours (09:00–18:00)",
      };
    }

    const approvedLeave = leaveRequests.find(
      (leave) =>
        leave.memberId === member.id &&
        leave.status === "Approved" &&
        date >= leave.fromDate &&
        date <= leave.toDate
    );

    if (approvedLeave) {
      return {
        available: false,
        reason: `On approved ${approvedLeave.leaveType.toLowerCase()}`,
      };
    }

    if (date === today()) {
      const clock = getClockRecord(member.id);

      if (
        member.attendance === "Absent" ||
        member.attendance === "Leave"
      ) {
        return { available: false, reason: member.attendance };
      }

      if (clock?.checkOut) {
        return { available: false, reason: "Already checked out" };
      }

      if (clock?.onBreak) {
        return { available: false, reason: "Currently on break" };
      }
    }

    const conflict = appointments.find((appointment) => {
      if (
        appointment.id === ignoreAppointmentId ||
        appointment.date !== date ||
        appointment.staff.toLowerCase() !== member.name.toLowerCase() ||
        appointment.status.toLowerCase() === "cancelled"
      ) {
        return false;
      }

      const appointmentStart = timeToMinutes(appointment.time);
      const appointmentEnd =
        appointmentStart +
        Number(
          appointment.durationMinutes ||
            defaultDuration(appointment.service)
        );

      return start < appointmentEnd && end > appointmentStart;
    });

    if (conflict) {
      return {
        available: false,
        reason: `Booked for ${conflict.service} at ${formatTime(
          conflict.time
        )}`,
      };
    }

    return { available: true, reason: "Available" };
  };

  /* =======================================================
     SERVICE / SKILL MATCHING
     Safely supports old members without skills.
  ======================================================= */

  const isServiceMatch = (member: Member, service: string) => {
    const value = (service || "").toLowerCase();

    const skills = Array.isArray(member.skills) ? member.skills : [];

    const terms = [
      ...skills,
      member.department || "",
      member.role || "",
    ].map((item) => String(item).toLowerCase());

    const aliases: Record<string, string[]> = {
      hair: ["hair", "styling", "cut", "colour", "color", "spa"],
      makeup: ["makeup", "bridal", "party"],
      skin: ["skin", "facial", "beauty", "cleanup"],
      beauty: ["beauty", "skin", "facial"],
      administration: ["administration", "reception", "customer service"],
    };

    const requestedTerms = Object.entries(aliases)
      .filter(([key]) => value.includes(key))
      .flatMap(([, items]) => items);

    return terms.some(
      (term) =>
        term.includes(value) ||
        value.includes(term) ||
        requestedTerms.some(
          (requested) =>
            term.includes(requested) && value.includes(requested)
        )
    );
  };

  const recommendedStaff = useMemo(() => {
    return members
      .map((member) => {
        const availability = getMemberAvailability(
          member,
          assignForm.date,
          assignForm.time,
          assignForm.duration
        );

        const skillMatch = isServiceMatch(
          member,
          assignForm.service
        );

        const completedCount = completedAppointments.filter(
          (appointment) =>
            appointment.staff.toLowerCase() === member.name.toLowerCase()
        ).length;

        return {
          member,
          ...availability,
          skillMatch,
          completedCount,
        };
      })
      .filter((item) => item.available && item.skillMatch)
      .sort((a, b) => b.completedCount - a.completedCount);
  }, [
    members,
    appointments,
    leaveRequests,
    clockRecords,
    assignForm,
    completedAppointments,
  ]);

  /* =======================================================
     LEAVE REQUESTS
  ======================================================= */

  const submitLeave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!leaveForm.memberId || leaveForm.toDate < leaveForm.fromDate) {
      return;
    }

    const request: LeaveRequest = {
      ...leaveForm,
      id: makeId(),
      status: "Pending",
      requestedAt: today(),
    };

    setLeaveRequests((prev) => [request, ...prev]);
    setLeaveModal(false);

    setLeaveForm({
      memberId: "",
      fromDate: today(),
      toDate: today(),
      leaveType: "Casual Leave",
      reason: "",
    });
  };

  const updateLeaveStatus = (
    requestId: string,
    status: "Approved" | "Rejected"
  ) => {
    setLeaveRequests((prev) =>
      prev.map((request) =>
        request.id === requestId ? { ...request, status } : request
      )
    );
  };

  /* =======================================================
     SMART ASSIGNMENT
  ======================================================= */

  const assignAppointment = (member: Member) => {
    const availability = getMemberAvailability(
      member,
      assignForm.date,
      assignForm.time,
      assignForm.duration
    );

    if (!availability.available) {
      setAssignmentResult(availability.reason);
      return;
    }

    const newAppointment: Appointment = {
      id: makeId(),
      customer: assignForm.customer.trim() || "New Customer",
      phone: assignForm.phone.trim(),
      service: assignForm.service,
      staff: member.name,
      date: assignForm.date,
      time: assignForm.time,
      amount: Number(assignForm.amount || 0),
      status: "Confirmed",
      notes: "Created from Staff Smart Assignment",
      durationMinutes: Number(assignForm.duration),
    };

    const updated = [...appointments, newAppointment];

    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
    setAppointments(updated);

    setAssignmentResult(
      `Appointment successfully assigned to ${member.name}.`
    );
  };

  /* =======================================================
     CALENDAR
  ======================================================= */

  const calendarDays = useMemo(() => {
    const firstDay = new Date(
      calendarYear,
      calendarMonth,
      1
    ).getDay();

    const totalDays = new Date(
      calendarYear,
      calendarMonth + 1,
      0
    ).getDate();

    return [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: totalDays }, (_, index) => index + 1),
    ];
  }, [calendarMonth, calendarYear]);

  const changeMonth = (direction: number) => {
    const next = new Date(
      calendarYear,
      calendarMonth + direction,
      1
    );

    setCalendarMonth(next.getMonth());
    setCalendarYear(next.getFullYear());
  };

  const dateForDay = (day: number) =>
    `${calendarYear}-${String(calendarMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

  const staffOnLeave = (date: string) =>
    leaveRequests.filter(
      (request) =>
        request.status === "Approved" &&
        date >= request.fromDate &&
        date <= request.toDate
    );

  const appointmentsOnDate = appointments.filter(
    (appointment) => appointment.date === selectedDate
  );

  /* =======================================================
     UI HELPERS
  ======================================================= */

  const card =
    "rounded-2xl border border-[#343832] bg-[#1B1F1D] shadow-[0_8px_30px_rgba(0,0,0,0.12)]";

  const input =
    "w-full rounded-xl border border-[#3A403A] bg-[#141816] px-4 py-3 text-sm text-[#F5F1E6] outline-none transition placeholder:text-[#777B70] focus:border-[#A9A58A]";

  const label = "mb-2 block text-xs font-medium text-[#B8B7A8]";

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#EFE8A8] px-4 py-2.5 text-sm font-semibold text-[#171915] transition hover:bg-[#F8F0B9] disabled:cursor-not-allowed disabled:opacity-50";

  const secondaryButton =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-[#454A40] bg-[#222722] px-4 py-2.5 text-sm font-medium text-[#E9E5D6] transition hover:border-[#A9A58A] hover:bg-[#2A302A]";

  const statusClass = (value: string) => {
    const normalized = value.toLowerCase();

    if (
      ["active", "present", "approved", "available", "completed", "working"].includes(
        normalized
      )
    ) {
      return "border border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
    }

    if (
      ["pending", "late", "leave", "on break"].includes(normalized)
    ) {
      return "border border-amber-500/20 bg-amber-500/10 text-amber-300";
    }

    if (
      ["inactive", "absent", "rejected", "cancelled", "checked out"].includes(
        normalized
      )
    ) {
      return "border border-rose-500/20 bg-rose-500/10 text-rose-300";
    }

    return "border border-[#555A50] bg-[#33382F] text-[#D7D6C8]";
  };

  const badge = (value: string) => (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${statusClass(
        value
      )}`}
    >
      {value}
    </span>
  );

  const avatar = (member: Member, size = "h-10 w-10") => (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded-xl border border-[#77724D]/40 bg-gradient-to-br from-[#55513B] to-[#292D27] text-sm font-semibold text-[#F1E9B1]`}
    >
      {member.avatar ||
        member.name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)}
    </div>
  );

  const statCard = (
    title: string,
    value: string | number,
    description: string,
    icon: React.ReactNode,
    accent = "text-[#EFE8A8]"
  ) => (
    <div className={`${card} p-5 transition hover:-translate-y-0.5 hover:border-[#716D50]`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#A6AA9D]">{title}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-[#F5F1E6]">
            {value}
          </h3>
          <p className="mt-2 text-xs text-[#858B7F]">{description}</p>
        </div>
        <div className={`rounded-xl bg-[#34372B] p-3 ${accent}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const sectionTitle = (title: string, description: string) => (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-[#F3F0E5]">{title}</h2>
      <p className="mt-1 text-sm text-[#92978B]">{description}</p>
    </div>
  );

  const tabs: { name: Tab; icon: React.ReactNode }[] = [
    { name: "Overview", icon: <Users size={16} /> },
    { name: "Attendance", icon: <Activity size={16} /> },
    { name: "Availability", icon: <CalendarCheck size={16} /> },
    { name: "Performance", icon: <Award size={16} /> },
    { name: "Reminders", icon: <Gift size={16} /> },
    { name: "Leave", icon: <BriefcaseBusiness size={16} /> },
    { name: "Smart Assignment", icon: <Sparkles size={16} /> },
  ];

  if (!loaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#121414] text-[#EFE8A8]">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#EFE8A8] border-t-transparent" />
          Loading staff workspace...
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#121414] px-4 py-6 text-[#F5F1E6] sm:px-6 lg:px-8">
      <style>{FLOATING_CARD_STYLES}</style>

      <div className="mx-auto max-w-[1600px] space-y-7">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-[#A9A58A]">
              <span className="h-px w-7 bg-[#A9A58A]" />
              KBC Salon Academy
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-[#F5F1E6] sm:text-4xl">
              Staff & Instructors
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#969B90]">
              Manage your team, attendance, schedules, performance and staff
              assignments in one workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={exportCSV} className={secondaryButton}>
              <Download size={16} />
              Export CSV
            </button>

            <button onClick={openAddMember} className={primaryButton}>
              <Plus size={17} />
              Add Team Member
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCard(
            "Total Team Members",
            members.length,
            `${activeMembers.length} active members`,
            <Users size={21} />
          )}

          {statCard(
            "Present Today",
            presentCount,
            `${members.length - presentCount} not marked present`,
            <UserCheck size={21} />,
            "text-emerald-300"
          )}

          {statCard(
            "Instructors",
            members.filter((m) => m.type === "Instructor").length,
            "Training and education team",
            <GraduationCap size={21} />
          )}

          {statCard(
            "Monthly Payroll",
            money(members.reduce((sum, m) => sum + m.salary, 0)),
            "Based on listed monthly salaries",
            <IndianRupee size={21} />
          )}
        </div>

        {/* QUICK ALERTS */}

        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-[#756E42]/40 bg-[#29291F] p-4">
            <div className="rounded-lg bg-[#EFE8A8]/10 p-2 text-[#EFE8A8]">
              <Bell size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#F1EBD0]">
                Leave requests
              </p>
              <p className="text-xs text-[#A8A58D]">
                {pendingLeaves.length} awaiting your decision
              </p>
            </div>

            {pendingLeaves.length > 0 && (
              <span className="rounded-full bg-[#EFE8A8] px-2 py-1 text-xs font-bold text-[#1A1C16]">
                {pendingLeaves.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#343832] bg-[#1B1F1D] p-4">
            <div className="rounded-lg bg-[#A9A58A]/10 p-2 text-[#C5C0A0]">
              <Gift size={18} />
            </div>

            <div>
              <p className="text-sm font-medium text-[#F1EBD0]">
                Upcoming celebrations
              </p>
              <p className="text-xs text-[#A8A58D]">
                {upcomingReminders.length} in the next 30 days
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#343832] bg-[#1B1F1D] p-4">
            <div className="rounded-lg bg-emerald-400/10 p-2 text-emerald-300">
              <Clock size={18} />
            </div>

            <div>
              <p className="text-sm font-medium text-[#F1EBD0]">
                Working schedule
              </p>
              <p className="text-xs text-[#A8A58D]">
                Monday–Sunday · 09:00–18:00
              </p>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}

        <div className="overflow-x-auto border-b border-[#343832]">
          <div className="flex min-w-max gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm transition ${
                  activeTab === tab.name
                    ? "border-[#EFE8A8] text-[#EFE8A8]"
                    : "border-transparent text-[#92978B] hover:text-[#F5F1E6]"
                }`}
              >
                {tab.icon}
                {tab.name}

                {tab.name === "Leave" && pendingLeaves.length > 0 && (
                  <span className="rounded-full bg-[#EFE8A8] px-1.5 py-0.5 text-[10px] font-bold text-[#171915]">
                    {pendingLeaves.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* =================================================
            OVERVIEW — FLOATING IDENTITY CARDS
        ================================================= */}

        {activeTab === "Overview" && (
          <div className={`${card} p-5`}>
            <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-semibold">Team Directory</h2>
                <p className="mt-1 text-sm text-[#92978B]">
                  Manage staff profiles, roles, salaries and skills.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={exportCSV} className={secondaryButton}>
                  <Download size={15} />
                  Export
                </button>

                <button onClick={openAddMember} className={primaryButton}>
                  <Plus size={16} />
                  Add Member
                </button>
              </div>
            </div>

            <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858B7F]"
                />

                <input
                  className={`${input} pl-10`}
                  placeholder="Search name, role, email..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                className={input}
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="All">All team types</option>
                <option value="Staff">Staff</option>
                <option value="Instructor">Instructor</option>
              </select>

              <select
                className={input}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <select
                className={input}
                value={departmentFilter}
                onChange={(event) =>
                  setDepartmentFilter(event.target.value)
                }
              >
                <option value="All">All departments</option>

                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            {paginatedOverviewMembers.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {paginatedOverviewMembers.map((member) => {
                  const metrics = memberMetricsMap.get(member.id) || {
                    totalAppointments: 0,
                    completedAppointments: 0,
                    revenueGenerated: 0,
                    attendanceSummary: member.attendance,
                    ratingSummary: "N/A",
                    activeDaysCount: 0,
                  };

                  return (
                    <FloatingStaffProfileCard
                      key={member.id}
                      member={member}
                      metrics={metrics}
                      canHoverTilt={canHoverTilt}
                      statusBadge={badge}
                      onViewProfile={setProfileMember}
                      onEditMember={openEditMember}
                      onDeleteMember={deleteMember}
                      onChangeAttendance={changeAttendance}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-14 text-center">
                <Users
                  size={30}
                  className="mx-auto mb-3 text-[#777D70]"
                />

                <p className="text-sm text-[#D0D0C4]">
                  No team members found
                </p>

                <p className="mt-1 text-xs text-[#858B7F]">
                  Try changing your filters or add a new member.
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#343832] pt-4 text-xs text-[#858B7F]">
              <span>
                Showing {paginatedOverviewMembers.length} of{" "}
                {filteredMembers.length} filtered ({members.length} total) ·
                Data saved in this browser
              </span>

              {filteredMembers.length > OVERVIEW_PAGE_SIZE && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentOverviewPage <= 1}
                    onClick={() =>
                      setOverviewPage((prev) => Math.max(1, prev - 1))
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-[#454A40] bg-[#151916] px-2.5 py-1.5 text-xs text-[#E9E5D6] transition hover:border-[#A9A58A] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                    Prev
                  </button>

                  <span className="px-1.5 text-[#D0D0C4]">
                    Page {currentOverviewPage} of {totalOverviewPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentOverviewPage >= totalOverviewPages}
                    onClick={() =>
                      setOverviewPage((prev) =>
                        Math.min(totalOverviewPages, prev + 1)
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-[#454A40] bg-[#151916] px-2.5 py-1.5 text-xs text-[#E9E5D6] transition hover:border-[#A9A58A] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================
            ATTENDANCE
        ================================================= */}

        {activeTab === "Attendance" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {statCard(
                "Present",
                members.filter((m) => m.attendance === "Present").length,
                "Marked present today",
                <CheckCircle2 size={20} />,
                "text-emerald-300"
              )}

              {statCard(
                "Late",
                members.filter((m) => m.attendance === "Late").length,
                "Late arrivals",
                <Clock size={20} />,
                "text-amber-300"
              )}

              {statCard(
                "Absent / Leave",
                members.filter(
                  (m) =>
                    m.attendance === "Absent" ||
                    m.attendance === "Leave"
                ).length,
                "Not currently marked present",
                <XCircle size={20} />,
                "text-rose-300"
              )}
            </div>

            <div className={`${card} p-5`}>
              {sectionTitle(
                "Live Attendance",
                "Use clock-in, break and clock-out to track today's staff activity."
              )}

              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#343832] bg-[#151916] p-3 text-xs text-[#A9A58A]">
                <Activity size={16} />
                Browser-based attendance tracker · {formatDate(today())}

                <span className="ml-auto text-[#777D70]">
                  {clockRecords.filter((record) => record.date === today()).length}{" "}
                  clock records
                </span>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                {activeMembers.map((member) => {
                  const clock = getClockRecord(member.id);
                  const isWorking = !!clock?.checkIn && !clock?.checkOut;
                  const isBreak = !!clock?.onBreak;

                  return (
                    <div
                      key={member.id}
                      className="rounded-xl border border-[#343832] bg-[#151916] p-4"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                          {avatar(member)}

                          <div>
                            <p className="text-sm font-semibold text-[#F1F0E7]">
                              {member.name}
                            </p>

                            <p className="mt-1 text-xs text-[#858B7F]">
                              {member.role}
                            </p>

                            <div className="mt-2">
                              {badge(
                                isBreak
                                  ? "On Break"
                                  : clock?.checkOut
                                  ? "Checked Out"
                                  : isWorking
                                  ? "Working"
                                  : member.attendance
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {!isWorking && (
                            <button
                              onClick={() => updateClock(member, "in")}
                              className={primaryButton}
                            >
                              <LogIn size={15} />
                              Clock In
                            </button>
                          )}

                          {isWorking && !isBreak && (
                            <button
                              onClick={() => updateClock(member, "break")}
                              className={secondaryButton}
                            >
                              <Clock size={15} />
                              Break
                            </button>
                          )}

                          {isBreak && (
                            <button
                              onClick={() => updateClock(member, "resume")}
                              className={secondaryButton}
                            >
                              <Activity size={15} />
                              Resume
                            </button>
                          )}

                          {isWorking && (
                            <button
                              onClick={() => updateClock(member, "out")}
                              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/20"
                            >
                              <LogOut size={15} />
                              Clock Out
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#30362F] pt-3">
                        <div>
                          <p className="text-[11px] text-[#858B7F]">
                            Check-in
                          </p>
                          <p className="mt-1 text-sm text-[#E4E0D3]">
                            {formatTime(clock?.checkIn || null)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-[#858B7F]">
                            Check-out
                          </p>
                          <p className="mt-1 text-sm text-[#E4E0D3]">
                            {formatTime(clock?.checkOut || null)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeMembers.length === 0 && (
                <p className="py-8 text-center text-sm text-[#858B7F]">
                  No active team members.
                </p>
              )}
            </div>
          </div>
        )}

        {/* =================================================
            AVAILABILITY
        ================================================= */}

        {activeTab === "Availability" && (
          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className={`${card} p-5`}>
              {sectionTitle(
                "Staff Availability Calendar",
                "Select a date to see approved leave and available staff."
              )}

              <div className="mb-5 flex items-center justify-between">
                <button
                  onClick={() => changeMonth(-1)}
                  className={secondaryButton}
                >
                  <ChevronLeft size={16} />
                </button>

                <h3 className="font-semibold text-[#EFE8A8]">
                  {new Date(
                    calendarYear,
                    calendarMonth
                  ).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>

                <button
                  onClick={() => changeMonth(1)}
                  className={secondaryButton}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="py-2 text-[11px] font-medium text-[#858B7F]"
                    >
                      {day}
                    </div>
                  )
                )}

                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} />;
                  }

                  const date = dateForDay(day);
                  const approved = staffOnLeave(date);

                  const hasAppointments = appointments.some(
                    (appointment) =>
                      appointment.date === date &&
                      appointment.status.toLowerCase() !== "cancelled"
                  );

                  const selected = date === selectedDate;
                  const isToday = date === today();

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`relative flex min-h-[66px] flex-col items-center justify-center rounded-xl border text-sm transition ${
                        selected
                          ? "border-[#EFE8A8] bg-[#EFE8A8] font-semibold text-[#1A1C16]"
                          : "border-transparent bg-[#151916] text-[#D8D8CC] hover:border-[#716D50]"
                      }`}
                    >
                      <span>{day}</span>

                      <span className="mt-1 flex gap-1">
                        {approved.length > 0 && (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              selected ? "bg-rose-700" : "bg-rose-400"
                            }`}
                          />
                        )}

                        {hasAppointments && (
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              selected ? "bg-[#41442E]" : "bg-[#EFE8A8]"
                            }`}
                          />
                        )}
                      </span>

                      {isToday && (
                        <span
                          className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full ${
                            selected ? "bg-[#25271D]" : "bg-emerald-400"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap gap-4 text-xs text-[#A6AA9D]">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Approved leave
                </span>

                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#EFE8A8]" />
                  Appointments
                </span>

                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Today
                </span>
              </div>
            </div>

            <div className={`${card} p-5`}>
              <div className="mb-5">
                <p className="text-xs uppercase tracking-wider text-[#A9A58A]">
                  Selected date
                </p>

                <h3 className="mt-2 text-xl font-semibold text-[#EFE8A8]">
                  {formatDate(selectedDate)}
                </h3>

                <p className="mt-1 text-xs text-[#858B7F]">
                  Working hours: 09:00–18:00 · All days
                </p>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#151916] p-3">
                  <p className="text-xs text-[#858B7F]">Available</p>

                  <p className="mt-1 text-2xl font-semibold text-emerald-300">
                    {
                      members.filter(
                        (member) =>
                          getMemberAvailability(
                            member,
                            selectedDate,
                            "10:00",
                            60
                          ).available
                      ).length
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-[#151916] p-3">
                  <p className="text-xs text-[#858B7F]">On leave</p>

                  <p className="mt-1 text-2xl font-semibold text-rose-300">
                    {staffOnLeave(selectedDate).length}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {members.map((member) => {
                  const result = getMemberAvailability(
                    member,
                    selectedDate,
                    "10:00",
                    60
                  );

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 border-b border-[#30362F] pb-3 last:border-0"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {avatar(member, "h-9 w-9")}

                        <div className="min-w-0">
                          <p className="truncate text-sm text-[#E8E5D8]">
                            {member.name}
                          </p>

                          <p className="truncate text-xs text-[#858B7F]">
                            {member.role}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 text-xs ${
                          result.available
                            ? "text-emerald-300"
                            : "text-rose-300"
                        }`}
                      >
                        {result.available ? "Available" : result.reason}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-xl border border-[#343832] bg-[#151916] p-3">
                <p className="text-xs font-medium text-[#EFE8A8]">
                  Appointments on this date
                </p>

                <p className="mt-1 text-sm text-[#A6AA9D]">
                  {appointmentsOnDate.length} appointment(s) scheduled
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            PERFORMANCE
        ================================================= */}

        {activeTab === "Performance" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {statCard(
                "Completed Appointments",
                completedAppointments.length,
                "From the appointment records",
                <CheckCircle2 size={20} />,
                "text-emerald-300"
              )}

              {statCard(
                "Recorded Service Revenue",
                money(
                  completedAppointments.reduce(
                    (sum, item) => sum + Number(item.amount || 0),
                    0
                  )
                ),
                "Completed appointments only",
                <IndianRupee size={20} />
              )}

              {statCard(
                "Team Members",
                members.length,
                "Staff and instructors",
                <Users size={20} />
              )}
            </div>

            <div className={`${card} p-5`}>
              {sectionTitle(
                "Performance Leaderboard",
                "Ranked by completed appointments, then recorded appointment revenue."
              )}

              <div className="mb-4 rounded-xl border border-[#756E42]/30 bg-[#29291F] p-3 text-xs text-[#B8B39A]">
                Performance figures are calculated from{" "}
                <span className="font-semibold text-[#EFE8A8]">
                  kbc_appointments_v1
                </span>
                . No artificial ratings or performance figures are added.
              </div>

              <div className="space-y-3">
                {performance.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex flex-col justify-between gap-4 rounded-xl border border-[#343832] bg-[#151916] p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${
                          index === 0
                            ? "bg-[#EFE8A8] text-[#1A1C16]"
                            : "bg-[#30362F] text-[#C7C5B6]"
                        }`}
                      >
                        {index + 1}
                      </div>

                      {avatar(member)}

                      <div>
                        <p className="text-sm font-semibold text-[#F1F0E7]">
                          {member.name}
                        </p>

                        <p className="mt-1 text-xs text-[#858B7F]">
                          {member.role} · {member.type}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                      <div>
                        <p className="text-[11px] text-[#858B7F]">
                          Completed
                        </p>

                        <p className="mt-1 text-lg font-semibold text-[#EFE8A8]">
                          {member.completedCount}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-[#858B7F]">
                          Revenue
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#E7E2D2]">
                          {money(member.revenue)}
                        </p>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[11px] text-[#858B7F]">
                          Experience
                        </p>

                        <p className="mt-1 text-sm text-[#D4D2C5]">
                          {member.experience} years
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {completedAppointments.length === 0 && (
                <div className="mt-5 rounded-xl border border-dashed border-[#454A40] p-6 text-center">
                  <Award
                    size={28}
                    className="mx-auto mb-2 text-[#A9A58A]"
                  />

                  <p className="text-sm font-medium text-[#D9D7CB]">
                    Waiting for completed appointment data
                  </p>

                  <p className="mt-1 text-xs text-[#858B7F]">
                    Complete appointments and assign them to staff members
                    to populate this leaderboard.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================
            REMINDERS
        ================================================= */}

        {activeTab === "Reminders" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {statCard(
                "Upcoming Birthdays",
                upcomingReminders.filter(
                  (item) => item.type === "Birthday"
                ).length,
                "Within the next 30 days",
                <Gift size={20} />
              )}

              {statCard(
                "Work Anniversaries",
                upcomingReminders.filter(
                  (item) => item.type === "Work Anniversary"
                ).length,
                "Within the next 30 days",
                <Award size={20} />
              )}
            </div>

            <div className={`${card} p-5`}>
              {sectionTitle(
                "Team Celebrations",
                "Upcoming birthdays and work anniversaries based on team profiles."
              )}

              {upcomingReminders.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {upcomingReminders.map((item, index) => (
                    <div
                      key={`${item.member.id}-${item.type}-${index}`}
                      className="flex items-center gap-4 rounded-xl border border-[#343832] bg-[#151916] p-4"
                    >
                      {avatar(item.member)}

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#F1F0E7]">
                          {item.member.name}
                        </p>

                        <p className="mt-1 text-xs text-[#A9A58A]">
                          {item.type}
                        </p>

                        <p className="mt-1 text-xs text-[#858B7F]">
                          {formatDate(item.date)}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-[#EFE8A8]">
                          {item.days === 0 ? "Today" : item.days}
                        </p>

                        <p className="text-[10px] text-[#858B7F]">
                          {item.days === 0 ? "" : "days left"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#454A40] p-10 text-center">
                  <Gift
                    size={30}
                    className="mx-auto mb-3 text-[#A9A58A]"
                  />

                  <p className="text-sm text-[#D9D7CB]">
                    No upcoming celebrations in the next 30 days
                  </p>

                  <p className="mt-1 text-xs text-[#858B7F]">
                    Add dates of birth and joining dates to staff profiles.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================
            LEAVE MANAGEMENT
        ================================================= */}

        {activeTab === "Leave" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {statCard(
                "Pending Requests",
                pendingLeaves.length,
                "Waiting for approval",
                <Clock size={20} />,
                "text-amber-300"
              )}

              {statCard(
                "Approved",
                leaveRequests.filter(
                  (item) => item.status === "Approved"
                ).length,
                "Approved leave requests",
                <CheckCircle2 size={20} />,
                "text-emerald-300"
              )}

              {statCard(
                "Rejected",
                leaveRequests.filter(
                  (item) => item.status === "Rejected"
                ).length,
                "Rejected leave requests",
                <XCircle size={20} />,
                "text-rose-300"
              )}
            </div>

            <div className={`${card} p-5`}>
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    Leave Management
                  </h2>

                  <p className="mt-1 text-sm text-[#92978B]">
                    Review leave requests and update staff availability.
                  </p>
                </div>

                <button
                  onClick={() => setLeaveModal(true)}
                  className={primaryButton}
                >
                  <Plus size={16} />
                  Add Leave Request
                </button>
              </div>

              {leaveRequests.length > 0 ? (
                <div className="space-y-3">
                  {leaveRequests.map((request) => {
                    const member = members.find(
                      (item) => item.id === request.memberId
                    );

                    return (
                      <div
                        key={request.id}
                        className="flex flex-col justify-between gap-4 rounded-xl border border-[#343832] bg-[#151916] p-4 xl:flex-row xl:items-center"
                      >
                        <div className="flex items-center gap-3">
                          {member ? (
                            avatar(member)
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#343832]">
                              <User size={18} />
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-semibold text-[#F1F0E7]">
                              {member?.name || "Unknown member"}
                            </p>

                            <p className="mt-1 text-xs text-[#A9A58A]">
                              {request.leaveType}
                            </p>

                            <p className="mt-1 text-xs text-[#858B7F]">
                              {formatDate(request.fromDate)} –{" "}
                              {formatDate(request.toDate)}
                            </p>

                            {request.reason && (
                              <p className="mt-2 text-xs text-[#A6AA9D]">
                                Reason: {request.reason}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {badge(request.status)}

                          {request.status === "Pending" && (
                            <>
                              <button
                                onClick={() =>
                                  updateLeaveStatus(
                                    request.id,
                                    "Approved"
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-500/20"
                              >
                                <Check size={14} />
                                Approve
                              </button>

                              <button
                                onClick={() =>
                                  updateLeaveStatus(
                                    request.id,
                                    "Rejected"
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/20"
                              >
                                <X size={14} />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#454A40] p-10 text-center">
                  <CalendarDays
                    size={30}
                    className="mx-auto mb-3 text-[#A9A58A]"
                  />

                  <p className="text-sm text-[#D9D7CB]">
                    No leave requests yet
                  </p>

                  <p className="mt-1 text-xs text-[#858B7F]">
                    New requests will appear here for approval.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================
            SMART ASSIGNMENT
        ================================================= */}

        {activeTab === "Smart Assignment" && (
          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className={`${card} p-5`}>
              {sectionTitle(
                "Smart Appointment Assignment",
                "Find an available team member based on service, date and time."
              )}

              <div className="space-y-4">
                <div>
                  <label className={label}>Service</label>

                  <select
                    className={input}
                    value={assignForm.service}
                    onChange={(event) => {
                      setAssignForm((prev) => ({
                        ...prev,
                        service: event.target.value,
                      }));
                      setAssignmentResult(null);
                    }}
                  >
                    <option>Hair Styling</option>
                    <option>Hair Cut</option>
                    <option>Hair Colour</option>
                    <option>Hair Spa</option>
                    <option>Makeup</option>
                    <option>Bridal Makeup</option>
                    <option>Party Makeup</option>
                    <option>Facial</option>
                    <option>Skincare</option>
                    <option>Beauty</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={label}>Appointment Date</label>

                    <input
                      type="date"
                      className={input}
                      value={assignForm.date}
                      onChange={(event) => {
                        setAssignForm((prev) => ({
                          ...prev,
                          date: event.target.value,
                        }));
                        setAssignmentResult(null);
                      }}
                    />
                  </div>

                  <div>
                    <label className={label}>Start Time</label>

                    <input
                      type="time"
                      className={input}
                      value={assignForm.time}
                      onChange={(event) => {
                        setAssignForm((prev) => ({
                          ...prev,
                          time: event.target.value,
                        }));
                        setAssignmentResult(null);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={label}>Duration</label>

                    <select
                      className={input}
                      value={assignForm.duration}
                      onChange={(event) => {
                        setAssignForm((prev) => ({
                          ...prev,
                          duration: Number(event.target.value),
                        }));
                        setAssignmentResult(null);
                      }}
                    >
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                      <option value={90}>90 minutes</option>
                      <option value={120}>120 minutes</option>
                      <option value={150}>150 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className={label}>Amount (₹)</label>

                    <input
                      type="number"
                      min="0"
                      className={input}
                      value={assignForm.amount}
                      onChange={(event) =>
                        setAssignForm((prev) => ({
                          ...prev,
                          amount: Number(event.target.value),
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className={label}>Customer Name</label>

                  <input
                    className={input}
                    placeholder="Enter customer name"
                    value={assignForm.customer}
                    onChange={(event) =>
                      setAssignForm((prev) => ({
                        ...prev,
                        customer: event.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className={label}>Customer Phone</label>

                  <input
                    className={input}
                    placeholder="Enter phone number"
                    value={assignForm.phone}
                    onChange={(event) =>
                      setAssignForm((prev) => ({
                        ...prev,
                        phone: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="rounded-xl border border-[#756E42]/30 bg-[#29291F] p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold text-[#EFE8A8]">
                    <Clock size={15} />
                    Schedule rules
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#B8B39A]">
                    Monday–Sunday · 09:00–18:00. The system checks approved
                    leave, today's attendance, existing appointment overlaps
                    and matching staff skills.
                  </p>
                </div>

                <button
                  onClick={() => setAssignmentResult(null)}
                  className={`${secondaryButton} w-full`}
                >
                  <Search size={16} />
                  Refresh Recommendations
                </button>

                {assignmentResult && (
                  <div className="rounded-xl border border-[#756E42]/30 bg-[#29291F] p-3 text-sm text-[#EFE8A8]">
                    {assignmentResult}
                  </div>
                )}
              </div>
            </div>

            <div className={`${card} p-5`}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">
                    Recommended Team Members
                  </h2>

                  <p className="mt-1 text-sm text-[#92978B]">
                    Available staff with matching skills.
                  </p>
                </div>

                <span className="rounded-full border border-[#716D50] bg-[#34372B] px-3 py-1 text-xs text-[#EFE8A8]">
                  {recommendedStaff.length} matches
                </span>
              </div>

              {recommendedStaff.length > 0 ? (
                <div className="space-y-3">
                  {recommendedStaff.map((item, index) => (
                    <div
                      key={item.member.id}
                      className="rounded-xl border border-[#343832] bg-[#151916] p-4"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                          {avatar(item.member)}

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-[#F1F0E7]">
                                {item.member.name}
                              </p>

                              {index === 0 && (
                                <span className="rounded-full bg-[#EFE8A8]/10 px-2 py-0.5 text-[10px] text-[#EFE8A8]">
                                  Best match
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-[#858B7F]">
                              {item.member.role}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => assignAppointment(item.member)}
                          className={primaryButton}
                        >
                          <UserCheck size={15} />
                          Assign
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(Array.isArray(item.member.skills)
                          ? item.member.skills
                          : []
                        ).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-[#454A40] bg-[#252A24] px-2.5 py-1 text-[10px] text-[#C3C3B5]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 border-t border-[#30362F] pt-3 text-xs text-[#92978B]">
                        <span>
                          <CheckCircle2
                            size={13}
                            className="mr-1 inline text-emerald-300"
                          />
                          Available
                        </span>

                        <span>
                          <Award
                            size={13}
                            className="mr-1 inline text-[#EFE8A8]"
                          />
                          {item.completedCount} completed appointments
                        </span>

                        <span>
                          <Clock
                            size={13}
                            className="mr-1 inline text-[#A9A58A]"
                          />
                          {formatTime(assignForm.time)} –{" "}
                          {formatTime(
                            addMinutes(
                              assignForm.time,
                              assignForm.duration
                            )
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#454A40] p-10 text-center">
                  <Sparkles
                    size={30}
                    className="mx-auto mb-3 text-[#A9A58A]"
                  />

                  <p className="text-sm font-medium text-[#D9D7CB]">
                    No matching staff available
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#858B7F]">
                    Try another time, date or service. Check staff skills,
                    attendance and approved leave.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================
            ADD / EDIT MEMBER MODAL
        ================================================= */}

        {memberModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#454A40] bg-[#1B1F1D] shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#343832] bg-[#1B1F1D] px-5 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#F5F1E6]">
                    {editingMember ? "Edit Team Member" : "Add Team Member"}
                  </h2>

                  <p className="mt-1 text-xs text-[#92978B]">
                    Enter the team member's profile and work details.
                  </p>
                </div>

                <button
                  onClick={() => setMemberModal(false)}
                  className="rounded-lg p-2 text-[#A6AA9D] hover:bg-[#343832]"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={saveMember} className="space-y-5 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={label}>Full Name *</label>

                    <input
                      required
                      className={input}
                      placeholder="Enter full name"
                      value={memberForm.name}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className={label}>Employee ID</label>

                    <input
                      className={`${input} opacity-70`}
                      value={memberForm.id}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className={label}>Email Address</label>

                    <input
                      type="email"
                      className={input}
                      placeholder="name@kbcacademy.com"
                      value={memberForm.email}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className={label}>Phone Number</label>

                    <input
                      className={input}
                      placeholder="Enter phone number"
                      value={memberForm.phone}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          phone: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className={label}>Job Role *</label>

                    <input
                      required
                      className={input}
                      placeholder="e.g. Senior Hair Stylist"
                      value={memberForm.role}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          role: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className={label}>Department</label>

                    <select
                      className={input}
                      value={memberForm.department}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          department: event.target.value,
                        }))
                      }
                    >
                      <option>Hair Styling</option>
                      <option>Makeup</option>
                      <option>Beauty</option>
                      <option>Skincare</option>
                      <option>Administration</option>
                      <option>Nail Art</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className={label}>Team Type</label>

                    <select
                      className={input}
                      value={memberForm.type}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          type: event.target.value as MemberType,
                        }))
                      }
                    >
                      <option>Staff</option>
                      <option>Instructor</option>
                    </select>
                  </div>

                  <div>
                    <label className={label}>Monthly Salary (₹)</label>

                    <input
                      type="number"
                      min="0"
                      className={input}
                      value={memberForm.salary}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          salary: Number(event.target.value),
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className={label}>Joining Date</label>

                    <input
                      type="date"
                      className={input}
                      value={memberForm.joiningDate}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          joiningDate: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className={label}>Date of Birth</label>

                    <input
                      type="date"
                      className={input}
                      value={memberForm.dateOfBirth}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          dateOfBirth: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className={label}>Experience (Years)</label>

                    <input
                      type="number"
                      min="0"
                      className={input}
                      value={memberForm.experience}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          experience: Number(event.target.value),
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className={label}>Employment Status</label>

                    <select
                      className={input}
                      value={memberForm.status}
                      onChange={(event) =>
                        setMemberForm((prev) => ({
                          ...prev,
                          status: event.target.value as MemberStatus,
                        }))
                      }
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-[#343832] pt-5">
                  <label className={label}>Skills & Services</label>

                  <p className="mb-3 text-xs text-[#858B7F]">
                    Skills are used by Smart Assignment to find a suitable
                    team member.
                  </p>

                  <div className="flex gap-2">
                    <input
                      className={input}
                      placeholder="Add a skill, e.g. Bridal Makeup"
                      value={skillInput}
                      onChange={(event) =>
                        setSkillInput(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addSkill();
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={addSkill}
                      className={secondaryButton}
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(Array.isArray(memberForm.skills)
                      ? memberForm.skills
                      : []
                    ).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-2 rounded-full border border-[#716D50] bg-[#34372B] px-3 py-1.5 text-xs text-[#EFE8A8]"
                      >
                        {skill}

                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-[#C7C2A4] hover:text-white"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}

                    {(!Array.isArray(memberForm.skills) ||
                      memberForm.skills.length === 0) && (
                      <span className="text-xs text-[#777D70]">
                        No skills added yet.
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#343832] pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setMemberModal(false)}
                    className={secondaryButton}
                  >
                    Cancel
                  </button>

                  <button type="submit" className={primaryButton}>
                    <Check size={16} />
                    {editingMember ? "Save Changes" : "Create Member"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =================================================
            PROFILE MODAL
        ================================================= */}

        {profileMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm">
            <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#454A40] bg-[#1B1F1D] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#343832] p-5">
                <h2 className="font-semibold">Team Member Profile</h2>

                <button
                  onClick={() => setProfileMember(null)}
                  className="rounded-lg p-2 text-[#A6AA9D] hover:bg-[#343832]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-4">
                  {avatar(profileMember, "h-16 w-16")}

                  <div>
                    <h3 className="text-xl font-semibold text-[#F5F1E6]">
                      {profileMember.name}
                    </h3>

                    <p className="mt-1 text-sm text-[#A9A58A]">
                      {profileMember.role}
                    </p>

                    <div className="mt-2 flex gap-2">
                      {badge(profileMember.type)}
                      {badge(profileMember.status)}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    ["Employee ID", profileMember.id],
                    ["Department", profileMember.department],
                    ["Email", profileMember.email || "—"],
                    ["Phone", profileMember.phone || "—"],
                    ["Salary", money(profileMember.salary)],
                    ["Experience", `${profileMember.experience} years`],
                    ["Joining Date", formatDate(profileMember.joiningDate)],
                    ["Date of Birth", formatDate(profileMember.dateOfBirth)],
                    ["Attendance", profileMember.attendance],
                  ].map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-xl bg-[#151916] p-3"
                    >
                      <p className="text-[11px] text-[#858B7F]">{key}</p>

                      <p className="mt-1 break-words text-sm text-[#E5E1D2]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs text-[#A9A58A]">Skills</p>

                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(profileMember.skills)
                      ? profileMember.skills
                      : []
                    ).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-[#454A40] bg-[#252A24] px-3 py-1.5 text-xs text-[#D4D2C5]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[#343832] pt-4">
                  <button
                    onClick={() => toggleMemberStatus(profileMember)}
                    className={secondaryButton}
                  >
                    {profileMember.status === "Active"
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                  <button
                    onClick={() => openEditMember(profileMember)}
                    className={primaryButton}
                  >
                    <Edit3 size={15} />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            LEAVE REQUEST MODAL
        ================================================= */}

        {leaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-[#454A40] bg-[#1B1F1D] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#343832] p-5">
                <div>
                  <h2 className="font-semibold">New Leave Request</h2>

                  <p className="mt-1 text-xs text-[#858B7F]">
                    Add a request for a team member.
                  </p>
                </div>

                <button
                  onClick={() => setLeaveModal(false)}
                  className="rounded-lg p-2 text-[#A6AA9D] hover:bg-[#343832]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={submitLeave} className="space-y-4 p-5">
                <div>
                  <label className={label}>Team Member *</label>

                  <select
                    required
                    className={input}
                    value={leaveForm.memberId}
                    onChange={(event) =>
                      setLeaveForm((prev) => ({
                        ...prev,
                        memberId: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select team member</option>

                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={label}>Leave Type</label>

                  <select
                    className={input}
                    value={leaveForm.leaveType}
                    onChange={(event) =>
                      setLeaveForm((prev) => ({
                        ...prev,
                        leaveType: event.target.value,
                      }))
                    }
                  >
                    <option>Casual Leave</option>
                    <option>Sick Leave</option>
                    <option>Annual Leave</option>
                    <option>Personal Leave</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={label}>From Date *</label>

                    <input
                      required
                      type="date"
                      className={input}
                      value={leaveForm.fromDate}
                      onChange={(event) =>
                        setLeaveForm((prev) => ({
                          ...prev,
                          fromDate: event.target.value,
                          toDate:
                            event.target.value > prev.toDate
                              ? event.target.value
                              : prev.toDate,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className={label}>To Date *</label>

                    <input
                      required
                      type="date"
                      min={leaveForm.fromDate}
                      className={input}
                      value={leaveForm.toDate}
                      onChange={(event) =>
                        setLeaveForm((prev) => ({
                          ...prev,
                          toDate: event.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className={label}>Reason</label>

                  <textarea
                    rows={3}
                    className={input}
                    placeholder="Enter reason for leave"
                    value={leaveForm.reason}
                    onChange={(event) =>
                      setLeaveForm((prev) => ({
                        ...prev,
                        reason: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex justify-end gap-2 border-t border-[#343832] pt-4">
                  <button
                    type="button"
                    onClick={() => setLeaveModal(false)}
                    className={secondaryButton}
                  >
                    Cancel
                  </button>

                  <button type="submit" className={primaryButton}>
                    <Plus size={15} />
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}