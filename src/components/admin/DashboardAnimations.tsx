
"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  IndianRupee,
  Users,
  X,
} from "lucide-react";

const GOLD = "#EFE8A8";

function CountUp({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frame = 0;
    const duration = 1400;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.round(value * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <>
      {prefix}
      {count.toLocaleString("en-IN")}
      {suffix}
    </>
  );
}

const appointments = [
  {
    time: "09:30 AM",
    name: "Priya Sharma",
    service: "Bridal Makeup",
    status: "Completed",
  },
  {
    time: "11:00 AM",
    name: "Ananya R",
    service: "Hair Styling",
    status: "In Progress",
  },
  {
    time: "01:30 PM",
    name: "Divya Kumar",
    service: "Beauty Course",
    status: "Upcoming",
  },
  {
    time: "03:00 PM",
    name: "Meera S",
    service: "Skin Treatment",
    status: "Upcoming",
  },
];

const notifications = [
  {
    title: "New student enrolled",
    detail: "A student joined the Advanced Makeup Course.",
    time: "5 minutes ago",
  },
  {
    title: "Payment received",
    detail: "A course payment of ₹5,000 was received.",
    time: "20 minutes ago",
  },
  {
    title: "New appointment",
    detail: "A new salon appointment has been booked.",
    time: "35 minutes ago",
  },
];

export default function DashboardAnimations() {
  const [showNotifications, setShowNotifications] = useState(false);

  const revenuePoints =
    "0,110 45,92 90,98 135,65 180,78 225,43 270,55 315,20";

  return (
    <div className="kbc-animations space-y-6">

      {/* =========================================
          CHAMPAGNE GOLD BORDER GLOW ONLY
          NO EXTERNAL BLURRED GLOW
      ========================================= */}

      <style jsx global>{`
        .kbc-gradient-gold-card {
          position: relative;
          isolation: isolate;
          border: 1px solid #393d36;
          border-radius: 16px;
          overflow: visible !important;

          transition:
            transform 0.4s ease,
            border-color 0.4s ease,
            box-shadow 0.4s ease;
        }

        /* ANIMATED GOLD BORDER ONLY */
        .kbc-gradient-gold-card::after {
          content: "";
          position: absolute;
          inset: -1px;
          padding: 1.5px;
          border-radius: inherit;
          pointer-events: none;
          z-index: 5;

          background: linear-gradient(
            120deg,
            #986b3d,
            #b89645,
            #d4af37,
            #efe8a8,
            #fff5cc,
            #efe8a8,
            #d4af37,
            #b89645,
            #986b3d
          );

          background-size: 200% 200%;
          background-position: 0% 50%;
          opacity: 0;

          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);

          -webkit-mask-composite: xor;
          mask-composite: exclude;

          transition: opacity 0.4s ease;
        }

        /* BORDER HOVER EFFECT */
        .kbc-gradient-gold-card:hover {
          transform: translateY(-4px);
          border-color: transparent;

          box-shadow:
            0 10px 25px rgba(0, 0, 0, 0.25),
            0 0 8px rgba(239, 232, 168, 0.08);
        }

        .kbc-gradient-gold-card:hover::after {
          opacity: 1;
          animation: kbcGoldBorderMove 4s linear infinite;
        }

        /* GOLD BORDER MOVEMENT */
        @keyframes kbcGoldBorderMove {
          0% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }

          100% {
            background-position: 0% 50%;
          }
        }

        /* TOUCH DEVICES */
        @media (hover: none) {
          .kbc-gradient-gold-card:active::after {
            opacity: 1;
            animation: kbcGoldBorderMove 4s linear infinite;
          }
        }

        /* TEXT CONTRAST */
        .kbc-gradient-gold-card h2 {
          color: #fff5cc;
          text-shadow: 0 0 10px rgba(239, 232, 168, 0.1);
        }

        .kbc-gradient-gold-card .kbc-highlight-value {
          color: #ffe7a0;
          text-shadow: 0 0 12px rgba(212, 175, 55, 0.15);
        }

        /* ACCESSIBILITY */
        @media (prefers-reduced-motion: reduce) {
          .kbc-gradient-gold-card,
          .kbc-gradient-gold-card::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* TOP STATISTICS */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={185400}
          prefix="₹"
          icon={<IndianRupee size={20} />}
          note="+12.8% from last month"
          delay="0s"
        />

        <StatCard
          title="Active Students"
          value={128}
          icon={<Users size={20} />}
          note="+8 new students this month"
          delay="0.1s"
        />

        <StatCard
          title="Appointments"
          value={18}
          icon={<CalendarDays size={20} />}
          note="Today's total bookings"
          delay="0.2s"
        />

        <StatCard
          title="Active Courses"
          value={12}
          icon={<GraduationCap size={20} />}
          note="86 videos available"
          delay="0.3s"
        />
      </section>

      {/* REVENUE + ACADEMY PULSE */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* REVENUE ANALYTICS */}
        <div className="kbc-panel kbc-gradient-gold-card kbc-enter xl:col-span-2">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[#D6D0BC]">
                Financial overview
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                Revenue Analytics
              </h2>
            </div>

            <span className="rounded-full border border-[#665f42] px-3 py-1.5 text-xs text-[#8FD6A5]">
              +12.8% growth
            </span>
          </div>

          <div className="mb-5">
            <p className="kbc-highlight-value text-3xl font-semibold">
              ₹<CountUp value={185400} />
            </p>
            <p className="mt-1 text-xs text-[#D6D0BC]">
              Total revenue this month
            </p>
          </div>

          <div className="relative h-48 w-full overflow-hidden">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
              {[1, 2, 3, 4].map((line) => (
                <div
                  key={line}
                  className="border-t border-dashed border-[#393d36]"
                />
              ))}
            </div>

            <svg
              viewBox="0 0 315 130"
              preserveAspectRatio="none"
              className="relative h-full w-full overflow-visible"
            >
              <defs>
                <linearGradient
                  id="kbcRevenueFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#EFE8A8"
                    stopOpacity="0.28"
                  />
                  <stop
                    offset="100%"
                    stopColor="#EFE8A8"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              <polygon
                points={`0,130 ${revenuePoints} 315,130`}
                fill="url(#kbcRevenueFill)"
              />

              <polyline
                points={revenuePoints}
                fill="none"
                stroke={GOLD}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="kbc-chart-line"
              />

              {[45, 90, 135, 180, 225, 270, 315].map((x, index) => {
                const y = [92, 98, 65, 78, 43, 55, 20][index];

                return (
                  <circle
                    key={x}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="#EFE8A8"
                    className="kbc-chart-point"
                  />
                );
              })}
            </svg>
          </div>

          <div className="mt-3 flex justify-between text-xs text-[#D6D0BC]">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </div>

        {/* ACADEMY PULSE */}
        <div
          className="kbc-panel kbc-gradient-gold-card kbc-enter"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="mb-5">
            <p className="text-sm text-[#D6D0BC]">
              Your academy at a glance
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              Academy Pulse
            </h2>
          </div>

          <div className="flex justify-center py-3">
            <div className="kbc-pulse-ring">
              <div className="kbc-pulse-inner">
                <Activity size={22} className="text-[#EFE8A8]" />
                <p className="kbc-highlight-value mt-2 text-3xl font-bold">
                  86%
                </p>
                <p className="text-xs text-[#D6D0BC]">
                  Performance
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <PulseRow
              label="Course completion"
              value="86%"
              width="86%"
            />
            <PulseRow
              label="Student engagement"
              value="92%"
              width="92%"
            />
            <PulseRow
              label="Class attendance"
              value="78%"
              width="78%"
            />
          </div>
        </div>
      </section>

      {/* APPOINTMENTS + NOTIFICATIONS */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* APPOINTMENT TIMELINE */}
        <div className="kbc-panel kbc-gradient-gold-card kbc-enter xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-[#D6D0BC]">
                Your daily schedule
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                Appointment Timeline
              </h2>
            </div>

            <CalendarDays className="text-[#EFE8A8]" />
          </div>

          <div className="space-y-5">
            {appointments.map((item, index) => (
              <div
                key={item.name}
                className="kbc-timeline-item"
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                <div className="w-20 shrink-0 pt-1 text-xs text-[#D6D0BC]">
                  {item.time}
                </div>

                <div className="relative mr-4 flex w-5 shrink-0 justify-center">
                  <span
                    className={`z-10 mt-1 h-3 w-3 rounded-full ${
                      item.status === "Completed"
                        ? "bg-[#8FD6A5]"
                        : item.status === "In Progress"
                          ? "bg-[#EFE8A8] kbc-live-dot"
                          : "bg-[#77796f]"
                    }`}
                  />

                  {index !== appointments.length - 1 && (
                    <span className="absolute top-4 h-14 border-l border-dashed border-[#55594f]" />
                  )}
                </div>

                <div className="min-w-0 flex-1 rounded-xl border border-[#393d36] bg-[#1b1e1c] p-3 transition duration-300 hover:border-[#EFE8A8]/60 hover:bg-[#272b27]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-[#FFF5CC]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-[#D6D0BC]">
                        {item.service}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] ${
                        item.status === "Completed"
                          ? "bg-[#8FD6A5]/10 text-[#8FD6A5]"
                          : item.status === "In Progress"
                            ? "bg-[#EFE8A8]/10 text-[#EFE8A8]"
                            : "bg-[#77796f]/15 text-[#c4c5ba]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NOTIFICATION CENTRE */}
        <div
          className="kbc-panel kbc-gradient-gold-card kbc-enter relative"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-[#D6D0BC]">
                Stay updated
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                Notifications
              </h2>
            </div>

            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Toggle notifications"
              className="relative rounded-xl border border-[#393d36] bg-[#1b1e1c] p-3 text-[#EFE8A8] transition hover:border-[#EFE8A8] hover:bg-[#34352a]"
            >
              {showNotifications ? <X size={20} /> : <Bell size={20} />}
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#e6a39a] kbc-live-dot" />
            </button>
          </div>

          <div className="mb-4 flex items-center gap-2 text-xs text-[#8FD6A5]">
            <span className="h-2 w-2 rounded-full bg-[#8FD6A5]" />
            {notifications.length} recent updates
          </div>

          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-[#393d36] bg-[#1b1e1c] p-3 transition hover:border-[#EFE8A8]/50"
              >
                <p className="text-sm font-medium text-[#FFF5CC]">
                  {item.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#D6D0BC]">
                  {item.detail}
                </p>
                <p className="mt-2 text-[10px] text-[#AFA995]">
                  {item.time}
                </p>
              </div>
            ))}
          </div>

          {showNotifications && (
            <div className="kbc-notification-popover absolute right-0 top-16 z-30 w-full rounded-2xl border border-[#665f42] bg-[#20231f] p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-[#FFF5CC]">
                  Notification Centre
                </p>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[#D6D0BC] hover:text-white"
                  aria-label="Close notifications"
                >
                  <X size={17} />
                </button>
              </div>

              {notifications.map((item) => (
                <div
                  key={item.title}
                  className="border-b border-[#393d36] py-3 last:border-0"
                >
                  <p className="text-sm text-[#FFF5CC]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-[#D6D0BC]">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* STATUS FOOTER */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#393d36] bg-[#1b1e1c] px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-[#D6D0BC]">
          <CheckCircle2 size={15} className="text-[#8FD6A5]" />
          Dashboard interface loaded
        </div>

        <div className="flex items-center gap-2 text-xs text-[#D6D0BC]">
          <Clock3 size={14} />
          KBC Academy Dashboard
        </div>
      </div>
    </div>
  );
}

/* =========================================
   STATISTICS CARD
========================================= */

function StatCard({
  title,
  value,
  prefix = "",
  icon,
  note,
  delay,
}: {
  title: string;
  value: number;
  prefix?: string;
  icon: React.ReactNode;
  note: string;
  delay: string;
}) {
  return (
    <div
      className="kbc-panel kbc-stat-card kbc-gradient-gold-card kbc-enter"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#D6D0BC]">{title}</p>

        <div className="rounded-xl border border-[#665f42] bg-[#34352a] p-2.5 text-[#EFE8A8]">
          {icon}
        </div>
      </div>

      <p className="kbc-highlight-value mt-5 text-2xl font-bold tracking-tight">
        <CountUp value={value} prefix={prefix} />
      </p>

      <p className="mt-2 text-xs text-[#8FD6A5]">
        {note}
      </p>
    </div>
  );
}

/* =========================================
   ACADEMY PULSE ROW
========================================= */

function PulseRow({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs">
        <span className="text-[#D6D0BC]">{label}</span>
        <span className="text-[#FFE7A0]">{value}</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[#393d36]">
        <div
          className="kbc-progress-fill h-full rounded-full"
          style={{ width }}
        />
      </div>
    </div>
  );
}
