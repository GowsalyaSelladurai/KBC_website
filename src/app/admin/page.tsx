<<<<<<< HEAD

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import styles from "./dashboard.module.css";
import DashboardAnimations from "@/components/admin/DashboardAnimations";
import KBCIntro from "@/components/admin/KBCIntro";
import GoldenFireCard from "@/components/admin/GoldenFireCard";

type ModalType =
  | "Add student"
  | "Create course"
  | "Schedule live class"
  | "Add appointment"
  | null;

const appointments = [
  {
    time: "09:30 AM",
    title: "Bridal Makeup",
    customer: "Priya S. · Main studio",
    status: "Confirmed",
    statusType: "green",
  },
  {
    time: "11:00 AM",
    title: "Hair Styling",
    customer: "Anitha R. · Styling room",
    status: "In progress",
    statusType: "amber",
  },
  {
    time: "02:00 PM",
    title: "Facial & Skin Care",
    customer: "Divya K. · Skin studio",
    status: "Upcoming",
    statusType: "",
  },
  {
    time: "04:30 PM",
    title: "Nail Art",
    customer: "Meena P. · Nail bar",
    status: "Upcoming",
    statusType: "",
  },
];

const courses = [
  { name: "Professional Makeup", students: 32, progress: 80 },
  { name: "Hair Styling", students: 24, progress: 65 },
  { name: "Nail Art", students: 18, progress: 45 },
  { name: "Saree Pleating", students: 14, progress: 90 },
];

const chartData = {
  "Last 6 months": [148, 120, 132, 83, 62, 25],
  "This year": [155, 140, 120, 105, 82, 25],
};

export default function AdminDashboard() {
  // INTRO STATES
  const [introState, setIntroState] = useState<
    "checking" | "show" | "hidden"
  >("checking");

  const introInitialized = useRef(false);

  // EXISTING DASHBOARD STATES
  const [modal, setModal] = useState<ModalType>(null);
  const [recordName, setRecordName] = useState("");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const [chartPeriod, setChartPeriod] = useState<
    "Last 6 months" | "This year"
  >("Last 6 months");

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // OWNER WELCOME STATES
  const [greeting, setGreeting] = useState("Welcome");
  const [currentDate, setCurrentDate] = useState("");

  // UPDATE GREETING ACCORDING TO LOCAL TIME
  useEffect(() => {
    const updateWelcome = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour >= 5 && hour < 12) {
        setGreeting("Good Morning");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good Afternoon");
      } else {
        setGreeting("Good Evening");
      }

      setCurrentDate(
        now.toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };

    updateWelcome();

    const timer = window.setInterval(updateWelcome, 60000);

    return () => window.clearInterval(timer);
  }, []);

  // CHECK INTRO BEFORE SHOWING DASHBOARD
  useEffect(() => {
    const introKey = "kbc_admin_intro_seen";

    if (!introInitialized.current) {
      introInitialized.current = true;

      const hasSeenIntro = sessionStorage.getItem(introKey);

      if (!hasSeenIntro) {
        sessionStorage.setItem(introKey, "true");
        setIntroState("show");
      } else {
        setIntroState("hidden");
      }
    }

    // Replay intro after browser refresh.
    const handleBeforeUnload = () => {
      sessionStorage.removeItem(introKey);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // CLOSE INTRO
  const closeIntro = useCallback(() => {
    setIntroState("hidden");
  }, []);

  // OPEN MODAL
  const openModal = (type: Exclude<ModalType, null>) => {
    setModal(type);
    setRecordName("");
    setDetails("");
    setAmount("");
    setSavedMessage("");
  };

  // SAVE RECORD
  const saveRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!recordName.trim()) {
      setSavedMessage("Please enter a name or title.");
      return;
    }

    const key = `kbc_demo_${modal?.toLowerCase().replaceAll(" ", "_")}`;

    const existing = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    existing.push({
      id: Date.now(),
      name: recordName.trim(),
      details: details.trim(),
      amount: amount.trim(),
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem(key, JSON.stringify(existing));

    setSavedMessage(
      `${modal} saved successfully on this browser.`
    );
  };

  // REVENUE CHART
  const chartPoints = chartData[chartPeriod];

  const chartPath = chartPoints
    .map(
      (y, index) =>
        `${index === 0 ? "M" : "L"} ${35 + index * 110} ${y}`
    )
    .join(" ");

  const chartArea = `${chartPath} L 585 178 L 35 178 Z`;

  // PREVENT DASHBOARD FLASH WHILE CHECKING INTRO
  if (introState === "checking") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999999,
          background:
            "radial-gradient(circle at center, #29251b 0%, #121414 55%, #080909 100%)",
        }}
      />
    );
  }

  // SHOW INTRO BEFORE MOUNTING DASHBOARD
  if (introState === "show") {
    return <KBCIntro onComplete={closeIntro} />;
  }

  // MAIN ADMIN DASHBOARD
  return (
    <div className={styles.dashboard}>
      {/* CINEMATIC OWNER WELCOME BANNER */}
      <div className="kbc-owner-welcome">
        <div className="kbc-welcome-ambient" />
        <div className="kbc-welcome-spotlight" />
        <div className="kbc-welcome-grid" />

        {/* GOLD PARTICLES */}
        <div className="kbc-owner-particles" aria-hidden="true">
          {Array.from({ length: 35 }).map((_, index) => (
            <span
              key={index}
              className="kbc-owner-particle"
              style={{
                left: `${(index * 37) % 100}%`,
                top: `${(index * 23) % 100}%`,
                animationDelay: `${index * -0.35}s`,
                animationDuration: `${3 + (index % 5)}s`,
              }}
            />
          ))}
        </div>

        <div className="kbc-owner-sweep" />

        {/* MAIN CONTENT */}
        <div className="kbc-owner-content">
          <div className="kbc-owner-eyebrow">
            <span className="kbc-eyebrow-line" />
            <span>✦ KBC SALON ACADEMY ✦</span>
            <span className="kbc-eyebrow-line" />
          </div>

          <div className="kbc-owner-heading-wrapper">
            <h1 className="kbc-owner-heading">
              <span className="kbc-owner-greeting">
                {greeting}
              </span>

              <span className="kbc-owner-name">
                Kavya!
              </span>
            </h1>

            <div className="kbc-owner-underline" />
          </div>

          <p className="kbc-owner-description">
            Your vision. Your academy. Your success.
          </p>

          <div className="kbc-owner-date">
            <span>✧</span>
            {currentDate}
          </div>

          <div className="kbc-owner-tagline">
            <span>THE ART OF BEAUTY</span>
            <i />
            <span>THE POWER OF EXCELLENCE</span>
          </div>
        </div>

        {/* ANIMATED ORIGINAL KBC LOGO */}
        <div className="kbc-owner-emblem" aria-hidden="true">
          <div className="kbc-emblem-orbit kbc-orbit-one" />
          <div className="kbc-emblem-orbit kbc-orbit-two" />
          <div className="kbc-emblem-orbit kbc-orbit-three" />

          <div className="kbc-emblem-inner">
            <img
              src="/kavyas-logo.png"
              alt=""
              className="kbc-owner-logo"
            />
          </div>

          <span className="kbc-emblem-particle particle-one" />
          <span className="kbc-emblem-particle particle-two" />
          <span className="kbc-emblem-particle particle-three" />
          <span className="kbc-emblem-particle particle-four" />
        </div>

        {/* BUSINESS LABEL */}
        <div className="kbc-owner-business">
          <span className="kbc-business-dot" />
          OWNER DASHBOARD
        </div>

        <div className="kbc-owner-bottom-line" />
      </div>

      {/* SIX ANIMATED DASHBOARD FEATURES */}
      {/* UPDATED: 12px spacing below the welcome banner */}
      <div className="mt-3">
        <DashboardAnimations />
      </div>

      {/* STATISTICS CARDS */}
      <section className={`${styles.grid} ${styles.stats}`}>
        <GoldenFireCard
          className={styles.card}
          effect="champagne-border"
          intensity="medium"
        >
          <div className={styles.statHead}>
            Total Revenue <span>◈</span>
          </div>
          <div className={styles.statValue}>₹1,85,400</div>
          <div className={styles.trend}>
            ↗ 14.5% <small>vs last month</small>
          </div>
        </GoldenFireCard>

        <GoldenFireCard
          className={styles.card}
          effect="breathing-glow"
          intensity="medium"
        >
          <div className={styles.statHead}>
            Today's Income <span>₹</span>
          </div>
          <div className={styles.statValue}>₹12,500</div>
          <div className={styles.sub}>
            Across academy & salon
          </div>
        </GoldenFireCard>

        <GoldenFireCard
          className={styles.card}
          effect="corner-glow"
          intensity="medium"
        >
          <div className={styles.statHead}>
            Active Students <span>♙</span>
          </div>
          <div className={styles.statValue}>128</div>
          <div className={styles.trend}>
            +12 <small>this month</small>
          </div>
        </GoldenFireCard>

        <GoldenFireCard
          className={styles.card}
          effect="ambient-halo"
          intensity="medium"
        >
          <div className={styles.statHead}>
            Appointments <span>▦</span>
          </div>
          <div className={styles.statValue}>18</div>
          <div className={styles.sub}>
            Today's bookings
          </div>
        </GoldenFireCard>
      </section>

      {/* REVENUE AND APPOINTMENTS */}
      <section className={`${styles.grid} ${styles.twoColumns}`}>
        {/* REVENUE OVERVIEW */}
        <GoldenFireCard
          className={styles.card}
          effect="spotlight"
          intensity="strong"
        >
          <div className={styles.cardTitle}>
            <h2>Revenue overview</h2>

            <select
              className={styles.select}
              value={chartPeriod}
              onChange={(event) =>
                setChartPeriod(
                  event.target.value as typeof chartPeriod
                )
              }
              aria-label="Revenue chart period"
            >
              <option>Last 6 months</option>
              <option>This year</option>
            </select>
          </div>

          <div className={styles.chartTotal}>
            ₹1,85,400 <span>↗ 14.5%</span>
          </div>

          <svg
            className={styles.chart}
            viewBox="0 0 620 205"
            preserveAspectRatio="none"
            role="img"
            aria-label="Revenue trend chart"
          >
            <defs>
              <linearGradient
                id="kbcRevenueArea"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#EFE8A8"
                  stopOpacity=".24"
                />
                <stop
                  offset="100%"
                  stopColor="#EFE8A8"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            <g className={styles.chartGrid}>
              <path d="M35 25H610 M35 70H610 M35 115H610 M35 160H610" />
            </g>

            <path
              d={chartArea}
              fill="url(#kbcRevenueArea)"
            />

            <path
              d={chartPath}
              className={styles.chartLine}
            />

            {chartPoints.map((y, index) => (
              <circle
                key={index}
                cx={35 + index * 110}
                cy={y}
                r="4"
                className={styles.chartDot}
              />
            ))}
          </svg>

          <div className={styles.chartLabels}>
            {["JUN", "JUL", "AUG", "SEP", "OCT", "NOV"].map(
              (month) => (
                <span key={month}>{month}</span>
              )
            )}
          </div>

          <div className={styles.legend}>
            <i /> Total collected revenue · Demo figures
          </div>
        </GoldenFireCard>

        {/* APPOINTMENTS */}
        <GoldenFireCard
          className={styles.card}
          effect="liquid-glass"
          intensity="medium"
        >
          <div className={styles.cardTitle}>
            <h2>Today's appointments</h2>

            <button
              className={styles.secondaryButton}
              onClick={() =>
                window.location.assign("/admin/appointments")
              }
            >
              View all ↗
            </button>
          </div>

          <div className={styles.schedule}>
            {appointments.map((appointment) => (
              <div
                className={styles.event}
                key={appointment.time}
              >
                <span className={styles.time}>
                  {appointment.time}
                </span>

                <div>
                  <strong>{appointment.title}</strong>
                  <small>{appointment.customer}</small>
                </div>

                <span
                  className={`${styles.status} ${
                    appointment.statusType
                      ? styles[appointment.statusType]
                      : ""
                  }`}
                >
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        </GoldenFireCard>
      </section>

      {/* LOWER DASHBOARD CONTENT */}
      <section className={`${styles.grid} ${styles.lowerGrid}`}>
        {/* COURSE PERFORMANCE */}
        <GoldenFireCard
          className={styles.card}
          effect="light-sweep"
          intensity="medium"
        >
          <div className={styles.cardTitle}>
            <h2>Course performance</h2>
            <span className={styles.sub}>
              Active learners
            </span>
          </div>

          {courses.map((course) => (
            <div
              className={styles.course}
              key={course.name}
            >
              <div className={styles.courseHead}>
                <b>{course.name}</b>
                <span>{course.students} students</span>
              </div>

              <div className={styles.progressTrack}>
                <i
                  style={{
                    width: `${course.progress}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </GoldenFireCard>

        {/* ACADEMY SNAPSHOT */}
        <GoldenFireCard
          className={styles.card}
          effect="gold-particles"
          intensity="medium"
        >
          <div className={styles.cardTitle}>
            <h2>Academy snapshot</h2>
          </div>

          {[
            ["Total courses", "12"],
            ["Video lessons", "86"],
            ["Live classes this month", "4"],
            ["Pending enrollments", "7"],
          ].map(([label, value]) => (
            <div
              className={styles.snapshotRow}
              key={label}
            >
              <span>{label}</span>
              <b>{value}</b>
            </div>
          ))}
        </GoldenFireCard>

        {/* QUICK ACTIONS */}
        <GoldenFireCard
          className={styles.card}
          effect="magnetic-tilt"
          intensity="strong"
        >
          <div className={styles.cardTitle}>
            <h2>Quick actions</h2>
          </div>

          <div className={styles.quickActions}>
            <button onClick={() => openModal("Add student")}>
              ＋ Add student
            </button>

            <button onClick={() => openModal("Create course")}>
              ＋ Create course
            </button>

            <button
              onClick={() => openModal("Schedule live class")}
            >
              ＋ Schedule live
            </button>

            <button
              onClick={() => openModal("Add appointment")}
            >
              ＋ Appointment
            </button>
          </div>

          <p className={styles.notice}>
            A refined workspace for academy operations and salon growth.
          </p>
        </GoldenFireCard>
      </section>

      {/* BOTTOM NOTE */}
      <div className={styles.bottomNote}>
        KBC SALOON ACADEMY <span>·</span> Dashboard overview
      </div>

      {/* NOTIFICATION BUTTON */}
      <button
        className={styles.notificationButton}
        onClick={() =>
          setNotificationsOpen((value) => !value)
        }
        aria-label="Toggle notifications"
      >
        ♧
        <span />
      </button>

      {/* NOTIFICATION PANEL */}
      {notificationsOpen && (
        <GoldenFireCard
          className={styles.notificationPanel}
          effect="golden-orbit"
          intensity="medium"
        >
          <strong>Notifications</strong>
          <p>You have 7 pending enrollments.</p>
          <p>Today's appointments: 18 bookings.</p>

          <button
            onClick={() => setNotificationsOpen(false)}
          >
            Close
          </button>
        </GoldenFireCard>
      )}

      {/* ADD / CREATE MODAL */}
      {modal && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModal(null);
            }
          }}
        >
          <form
            className={styles.modal}
            onSubmit={saveRecord}
          >
            <h2>{modal}</h2>

            <label className={styles.field}>
              <span>Name / Title</span>
              <input
                autoFocus
                value={recordName}
                onChange={(event) =>
                  setRecordName(event.target.value)
                }
                placeholder="Enter name or title"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Details</span>
              <input
                value={details}
                onChange={(event) =>
                  setDetails(event.target.value)
                }
                placeholder="Enter relevant details"
              />
            </label>

            <label className={styles.field}>
              <span>Duration / Amount (if applicable)</span>
              <input
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="e.g. 7 days or ₹5,000"
              />
            </label>

            {savedMessage && (
              <p className={styles.formMessage}>
                {savedMessage}
              </p>
            )}

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setModal(null)}
              >
                Close
              </button>

              <button
                type="submit"
                className={styles.primaryButton}
              >
                Save
              </button>
            </div>

            <p className={styles.notice}>
              Demo mode: records are saved in this browser only.
            </p>
          </form>
        </div>
      )}

      {/* CINEMATIC WELCOME ANIMATION CSS */}
      <style jsx>{`
        .kbc-owner-welcome {
          position: relative;
          isolation: isolate;
          min-height: 240px;
          display: flex;
          align-items: center;
          overflow: hidden;
          padding: 28px 36px;
          margin-bottom: 0;
          border-radius: 20px;
          border: 1px solid rgba(239,232,168,.24);
          background:
            radial-gradient(
              ellipse at 78% 50%,
              rgba(239,232,168,.12),
              transparent 35%
            ),
            linear-gradient(
              115deg,
              #252720 0%,
              #1b1e1c 48%,
              #101312 100%
            );
          box-shadow:
            inset 0 0 55px rgba(239,232,168,.025),
            0 15px 45px rgba(0,0,0,.22);
          animation: kbcBannerEntrance 1.1s cubic-bezier(.16,1,.3,1) both;
        }

        .kbc-welcome-ambient {
          position: absolute;
          z-index: 0;
          width: 420px;
          height: 420px;
          right: 7%;
          top: -190px;
          border-radius: 50%;
          background: rgba(239,232,168,.16);
          filter: blur(100px);
          animation: kbcAmbientMove 8s ease-in-out infinite alternate;
          pointer-events: none;
        }

        .kbc-welcome-spotlight {
          position: absolute;
          z-index: 1;
          top: -80%;
          right: 15%;
          width: 180px;
          height: 260%;
          transform: rotate(28deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(239,232,168,.045),
            rgba(255,250,210,.13),
            transparent
          );
          filter: blur(22px);
          animation: kbcSpotlightMove 9s ease-in-out infinite;
          pointer-events: none;
        }

        .kbc-welcome-grid {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: .13;
          background-image:
            linear-gradient(rgba(239,232,168,.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(239,232,168,.08) 1px, transparent 1px);
          background-size: 55px 55px;
          mask-image: radial-gradient(
            ellipse at 75% 50%,
            black,
            transparent 72%
          );
          pointer-events: none;
        }

        .kbc-owner-particles {
          position: absolute;
          inset: 0;
          z-index: 2;
          overflow: hidden;
          pointer-events: none;
        }

        .kbc-owner-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #EFE8A8;
          box-shadow:
            0 0 7px 2px rgba(239,232,168,.5),
            0 0 18px rgba(239,232,168,.3);
          animation: kbcParticleRise 5s ease-in-out infinite;
        }

        .kbc-owner-sweep {
          position: absolute;
          z-index: 3;
          top: -60%;
          left: -50%;
          width: 20%;
          height: 220%;
          transform: rotate(22deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(239,232,168,.08),
            rgba(255,255,220,.23),
            transparent
          );
          filter: blur(12px);
          animation: kbcGoldSweep 8s ease-in-out 1s infinite;
          pointer-events: none;
        }

        .kbc-owner-content {
          position: relative;
          z-index: 5;
          width: 70%;
        }

        .kbc-owner-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #EFE8A8;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .32em;
          animation: kbcRevealUp .9s ease-out .2s both;
        }

        .kbc-eyebrow-line {
          display: block;
          width: 28px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #EFE8A8);
        }

        .kbc-owner-heading-wrapper {
          margin-top: 16px;
        }

        .kbc-owner-heading {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 3px;
          margin: 0;
          font-size: clamp(32px, 4.1vw, 48px);
          font-weight: 600;
          line-height: 1.08;
          letter-spacing: -.045em;
          animation: kbcRevealUp 1s cubic-bezier(.16,1,.3,1) .4s both;
        }

        .kbc-owner-greeting {
          color: #F5F3E8;
        }

        .kbc-owner-name {
          display: inline-block;
          color: #EFE8A8;
          text-shadow:
            0 0 12px rgba(239,232,168,.25),
            0 0 35px rgba(239,232,168,.22);
          animation: kbcNameGlow 3s ease-in-out 1.5s infinite alternate;
        }

        .kbc-owner-underline {
          margin-top: 11px;
          width: 95px;
          height: 2px;
          background: linear-gradient(
            90deg,
            #EFE8A8,
            rgba(239,232,168,.1)
          );
          box-shadow: 0 0 12px rgba(239,232,168,.4);
          transform-origin: left;
          animation: kbcLineReveal 1.1s ease-out .9s both;
        }

        .kbc-owner-description {
          margin-top: 12px;
          color: #C5C1AE;
          font-size: 13px;
          letter-spacing: .035em;
          animation: kbcRevealUp .9s ease-out .75s both;
        }

        .kbc-owner-date {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 14px;
          color: #D1CBAF;
          font-size: 11px;
          letter-spacing: .06em;
          animation: kbcRevealUp .9s ease-out .95s both;
        }

        .kbc-owner-date span {
          color: #EFE8A8;
          font-size: 16px;
        }

        .kbc-owner-tagline {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 15px;
          color: rgba(239,232,168,.72);
          font-size: 8px;
          font-weight: 600;
          letter-spacing: .17em;
          animation: kbcRevealUp 1s ease-out 1.1s both;
        }

        .kbc-owner-tagline i {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #EFE8A8;
          box-shadow: 0 0 8px #EFE8A8;
        }

        /* ORIGINAL LOGO EMBLEM */

        .kbc-owner-emblem {
          position: absolute;
          z-index: 4;
          top: 50%;
          right: 12%;
          width: 170px;
          height: 170px;
          display: grid;
          place-items: center;
          transform: translateY(-50%);
          animation: kbcEmblemEntrance 1.5s cubic-bezier(.16,1,.3,1) .3s both;
        }

        .kbc-emblem-orbit {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1px solid rgba(239,232,168,.25);
        }

        .kbc-orbit-one {
          animation: kbcOrbitRotate 16s linear infinite;
        }

        .kbc-orbit-two {
          inset: 12px;
          border-style: dashed;
          border-color: rgba(239,232,168,.5);
          animation: kbcOrbitReverse 22s linear infinite;
        }

        .kbc-orbit-three {
          inset: 23px;
          border-width: 2px;
          border-color: rgba(239,232,168,.12);
          box-shadow: 0 0 25px rgba(239,232,168,.08);
          animation: kbcOrbitRotate 12s linear infinite;
        }

        .kbc-emblem-inner {
          position: relative;
          width: 112px;
          height: 112px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          background: radial-gradient(
            circle at 35% 25%,
            #46432d,
            #22251e 65%,
            #121414
          );
          border: 1px solid rgba(239,232,168,.6);
          box-shadow:
            0 0 20px rgba(239,232,168,.16),
            0 0 55px rgba(239,232,168,.12),
            inset 0 0 25px rgba(239,232,168,.1);
          animation: kbcEmblemPulse 3s ease-in-out infinite alternate;
        }

        .kbc-owner-logo {
          display: block;
          width: 82px;
          height: 82px;
          max-width: 85%;
          max-height: 85%;
          object-fit: contain;
          object-position: center;
          filter: drop-shadow(0 0 9px rgba(239,232,168,.3));
          animation: kbcLogoFloat 4s ease-in-out infinite alternate;
        }

        .kbc-emblem-particle {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #FFF3BD;
          box-shadow: 0 0 12px 3px rgba(239,232,168,.8);
        }

        .particle-one {
          top: 5%;
          left: 48%;
        }

        .particle-two {
          right: 5%;
          top: 48%;
        }

        .particle-three {
          bottom: 5%;
          left: 48%;
        }

        .particle-four {
          left: 5%;
          top: 48%;
        }

        /* OWNER LABEL */

        .kbc-owner-business {
          position: absolute;
          z-index: 6;
          top: 20px;
          right: 22px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 8px 12px;
          border-radius: 30px;
          border: 1px solid rgba(239,232,168,.23);
          background: rgba(239,232,168,.045);
          backdrop-filter: blur(12px);
          color: #EFE8A8;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .14em;
        }

        .kbc-business-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #C6D99C;
          box-shadow: 0 0 10px #C6D99C;
          animation: kbcDotPulse 1.8s ease-in-out infinite;
        }

        .kbc-owner-bottom-line {
          position: absolute;
          z-index: 7;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            #EFE8A8,
            transparent
          );
          box-shadow: 0 0 15px rgba(239,232,168,.5);
        }

        /* ANIMATIONS */

        @keyframes kbcBannerEntrance {
          from {
            opacity: 0;
            transform: translateY(25px) scale(.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes kbcRevealUp {
          from {
            opacity: 0;
            transform: translateY(24px);
            filter: blur(7px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes kbcLineReveal {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        @keyframes kbcNameGlow {
          from {
            text-shadow: 0 0 8px rgba(239,232,168,.2);
          }
          to {
            text-shadow:
              0 0 18px rgba(239,232,168,.8),
              0 0 45px rgba(239,232,168,.3);
          }
        }

        @keyframes kbcAmbientMove {
          from { transform: translate(0,0) scale(.85); }
          to { transform: translate(-55px,35px) scale(1.2); }
        }

        @keyframes kbcSpotlightMove {
          0%, 30% {
            right: 15%;
            opacity: 0;
          }
          55% { opacity: 1; }
          100% {
            right: 75%;
            opacity: 0;
          }
        }

        @keyframes kbcParticleRise {
          0% {
            opacity: 0;
            transform: translateY(25px) scale(.5);
          }
          40% { opacity: .9; }
          100% {
            opacity: 0;
            transform: translateY(-45px) scale(1.4);
          }
        }

        @keyframes kbcGoldSweep {
          0%, 25% {
            left: -50%;
            opacity: 0;
          }
          45% { opacity: 1; }
          80% {
            left: 140%;
            opacity: .8;
          }
          100% {
            left: 140%;
            opacity: 0;
          }
        }

        @keyframes kbcOrbitRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes kbcOrbitReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes kbcEmblemPulse {
          from {
            box-shadow:
              0 0 15px rgba(239,232,168,.12),
              inset 0 0 15px rgba(239,232,168,.05);
          }
          to {
            box-shadow:
              0 0 35px rgba(239,232,168,.28),
              0 0 65px rgba(239,232,168,.12),
              inset 0 0 25px rgba(239,232,168,.13);
          }
        }

        @keyframes kbcEmblemEntrance {
          from {
            opacity: 0;
            transform: translate(40px, -50%) scale(.65);
          }
          to {
            opacity: 1;
            transform: translate(0, -50%) scale(1);
          }
        }

        @keyframes kbcLogoFloat {
          from {
            transform: scale(.96);
          }
          to {
            transform: scale(1.04);
          }
        }

        @keyframes kbcDotPulse {
          0%, 100% { opacity: .6; }
          50% {
            opacity: 1;
            box-shadow: 0 0 15px #C6D99C;
          }
        }

        /* RESPONSIVE DESIGN */

        @media (max-width: 768px) {
          .kbc-owner-welcome {
            min-height: 310px;
            padding: 25px 22px;
            align-items: flex-start;
            margin-bottom: 0;
          }

          .kbc-owner-content {
            width: 100%;
          }

          .kbc-owner-heading-wrapper {
            margin-top: 17px;
          }

          .kbc-owner-heading {
            font-size: clamp(30px, 8vw, 42px);
          }

          .kbc-owner-description {
            font-size: 12px;
          }

          .kbc-owner-emblem {
            width: 112px;
            height: 112px;
            right: 17px;
            top: auto;
            bottom: 10px;
            transform: none;
            opacity: .65;
          }

          .kbc-emblem-inner {
            width: 74px;
            height: 74px;
          }

          .kbc-owner-logo {
            width: 54px;
            height: 54px;
          }

          .kbc-owner-business {
            position: relative;
            top: auto;
            right: auto;
            margin-top: 15px;
            display: inline-flex;
          }

          .kbc-owner-tagline {
            font-size: 8px;
            gap: 8px;
            flex-wrap: wrap;
          }
        }

        @media (max-width: 420px) {
          .kbc-owner-welcome {
            min-height: 325px;
            padding: 23px 18px;
          }

          .kbc-owner-emblem {
            opacity: .35;
            right: 8px;
          }

          .kbc-owner-tagline {
            max-width: 230px;
            line-height: 1.8;
          }

          .kbc-owner-business {
            font-size: 8px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .kbc-owner-welcome,
          .kbc-owner-welcome * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
=======
import { courses, students, liveClasses, getCourse } from "@/data/mock";
export default function Dashboard() {
  const kpi = [[students.length + 42, "Students"], [courses.length, "Courses"], ["₹1.2L", "Revenue"], [liveClasses.length, "Upcoming live"]];
  return (<div><h1 className="mb-5 text-3xl font-bold">Dashboard</h1>
    <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">{kpi.map(([v, l]) => <div key={l} className="card"><b className="font-serif text-3xl text-gold">{v}</b><p className="text-sm text-mute">{l}</p></div>)}</div>
    <div className="card mb-5"><h3 className="mb-3">Enrolments this week</h3><div className="flex h-36 items-end gap-3">{[40, 65, 30, 80, 55, 90, 60].map((h, i) => (
      <div key={i} className="flex flex-1 flex-col items-center gap-1"><div className="w-full rounded-t-md bg-gradient-to-b from-gold to-[#8c8750]" style={{ height: `${h}%` }} /><span className="text-xs text-mute">{"MTWTFSS"[i]}</span></div>))}</div></div>
    <div className="card"><h3 className="mb-2">Recent enrolments</h3>{students.map((s) => <div key={s.id} className="flex items-center justify-between border-t border-line py-2.5 text-sm"><div><b>{s.name}</b><p className="text-mute">{s.courses.map((i) => getCourse(i)?.name).join(", ")}</p></div><span className="tag">Active</span></div>)}</div></div>);
>>>>>>> 990cd97b5033c8e58152cb1b7f95494a00ff20ae
}
