
import Link from "next/link";
import CourseBrowser from "@/components/CourseBrowser";
import WelcomeBanner from "@/components/WelcomeBanner";
import BeautyTransformation from "@/components/BeautyTransformation";
import {
  Sparkles,
  GraduationCap,
  Award,
  Clock3,
  ShieldCheck,
  MonitorSmartphone,
  PlayCircle,
  LockKeyhole,
  Video,
  BookOpen,
  Gem,
  ArrowRight,
  CheckCircle2,
  Crown,
  Heart,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: BookOpen,
    title: "Discover Your Course",
    description:
      "Explore our professional beauty courses and choose the learning plan that matches your passion.",
  },
  {
    number: "02",
    icon: GraduationCap,
    title: "Enroll & Get Access",
    description:
      "Enroll online or through academy staff and receive your individual course credentials.",
  },
  {
    number: "03",
    icon: PlayCircle,
    title: "Learn & Practice",
    description:
      "Watch structured lessons, learn techniques and unlock your next video after completing the current one.",
  },
  {
    number: "04",
    icon: Award,
    title: "Complete Your Journey",
    description:
      "Complete your training within your course duration and develop your professional beauty skills.",
  },
];

const features = [
  {
    icon: LockKeyhole,
    title: "Secure Course Access",
    description:
      "Individual course credentials provide access to the courses assigned to each student.",
    number: "01",
  },
  {
    icon: Clock3,
    title: "Time-Based Learning",
    description:
      "Every course comes with its own learning duration, starting from the time of enrollment.",
    number: "02",
  },
  {
    icon: PlayCircle,
    title: "Sequential Video Lessons",
    description:
      "Learn step by step. Complete the current lesson to unlock the next lesson.",
    number: "03",
  },
  {
    icon: MonitorSmartphone,
    title: "Single Device Access",
    description:
      "Student accounts are restricted to one registered device for course playback.",
    number: "04",
  },
  {
    icon: ShieldCheck,
    title: "Protected Video Learning",
    description:
      "Secure streaming, download restrictions and dynamic student watermarking.",
    number: "05",
  },
  {
    icon: Video,
    title: "Interactive Live Classes",
    description:
      "Participate in scheduled live training sessions and access available recordings.",
    number: "06",
  },
];

const benefits = [
  {
    icon: Crown,
    title: "Professional Education",
    description: "Structured beauty and makeover learning experiences.",
  },
  {
    icon: Sparkles,
    title: "Creative Excellence",
    description: "Explore your creativity and discover new techniques.",
  },
  {
    icon: Heart,
    title: "Passion-Driven Learning",
    description: "Turn your interest in beauty into valuable skills.",
  },
  {
    icon: GraduationCap,
    title: "Guided Learning",
    description: "Learn through organized lessons and academy guidance.",
  },
];

const highlights = [
  "Professional beauty techniques",
  "Structured online courses",
  "Individual course access",
  "Live learning opportunities",
];

/* Shared black-to-gold card interaction */
const goldCard =
  "group relative isolate overflow-hidden rounded-[24px] border border-[#C9A45C]/60 bg-gradient-to-br from-[#242116] via-[#15140F] to-[#090908] p-7 text-[#FAF5ED] shadow-[0_12px_35px_rgba(0,0,0,0.25)] transition-all duration-500 ease-out hover:-translate-y-2 hover:border-[#EFE8A8] hover:bg-gradient-to-br hover:from-[#FFF4CE] hover:via-[#E8D39A] hover:to-[#C9A45C] hover:text-[#17140D] hover:shadow-[0_0_18px_rgba(239,232,168,0.55),0_0_45px_rgba(201,164,92,0.4)] active:border-[#EFE8A8] active:bg-gradient-to-br active:from-[#FFF4CE] active:via-[#E8D39A] active:to-[#C9A45C] active:text-[#17140D] active:shadow-[0_0_18px_rgba(239,232,168,0.55),0_0_45px_rgba(201,164,92,0.4)]";

const goldIcon =
  "grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[#C9A45C]/60 bg-[#EFE8A8]/10 text-[#EFE8A8] transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:border-[#8C692C] group-hover:bg-[#17140D]/10 group-hover:text-[#5D4218] group-hover:shadow-[0_0_22px_rgba(100,70,20,0.2)] group-active:border-[#8C692C] group-active:bg-[#17140D]/10 group-active:text-[#5D4218]";

const floatingCard =
  "group relative rounded-2xl border border-[#C9A45C] bg-gradient-to-br from-[#252116] to-[#090908] p-4 text-[#FAF5ED] shadow-[0_0_25px_rgba(201,164,92,0.25)] transition-all duration-500 hover:-translate-y-1 hover:border-[#8C692C] hover:bg-gradient-to-br hover:from-[#FFF4CE] hover:via-[#E8D39A] hover:to-[#C9A45C] hover:text-[#17140D] hover:shadow-[0_0_25px_rgba(239,232,168,0.5)] active:border-[#8C692C] active:bg-gradient-to-br active:from-[#FFF4CE] active:text-[#17140D]";

const lessonCard =
  "group flex items-center justify-between gap-3 rounded-xl border border-[#C9A45C]/50 bg-[#0C0B09] p-4 text-[#FAF5ED] transition-all duration-300 hover:border-[#8C692C] hover:bg-gradient-to-r hover:from-[#FFF4CE] hover:to-[#C9A45C] hover:text-[#17140D] hover:shadow-[0_0_18px_rgba(201,164,92,0.3)] active:border-[#8C692C] active:bg-gradient-to-r active:from-[#FFF4CE] active:to-[#C9A45C] active:text-[#17140D]";

const featureCard =
  "group flex gap-4 rounded-2xl border border-[#C9A45C]/50 bg-gradient-to-br from-[#242116] via-[#15140F] to-[#090908] p-4 text-[#FAF5ED] transition-all duration-500 hover:-translate-y-1 hover:border-[#8C692C] hover:bg-gradient-to-br hover:from-[#FFF4CE] hover:via-[#E8D39A] hover:to-[#C9A45C] hover:text-[#17140D] hover:shadow-[0_0_20px_rgba(201,164,92,0.3)] active:border-[#8C692C] active:bg-gradient-to-br active:from-[#FFF4CE] active:via-[#E8D39A] active:to-[#C9A45C] active:text-[#17140D]";

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#FAF5ED] text-[#121414]">
      {/* 01. HERO SECTION */}
      <WelcomeBanner />

      {/* 02. ABOUT THE ACADEMY */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#EFE8A8]/30 blur-[100px]" />

        <div className="wrap relative">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C9A45C]/40 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#9B793B]">
                <Sparkles size={15} />
                Welcome to KBC Academy
              </div>

              <h2 className="max-w-xl font-serif text-4xl leading-tight md:text-6xl">
                Where Beauty
                <br />
                Becomes an
                <span className="italic text-[#B18A45]"> Art Form.</span>
              </h2>

              <p className="mt-7 max-w-lg text-base leading-8 text-[#746D62]">
                Welcome to KBC Saloon Academy, Kavyas Beauty Centre.
                A place where creativity meets professional beauty
                education. Discover new techniques, develop your
                artistic abilities and take your passion to the next level.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/courses"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#121414] px-7 py-4 text-sm font-semibold text-[#EFE8A8] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-[#292820] hover:shadow-[0_0_25px_rgba(201,164,92,0.3)]"
                >
                  Discover Our Academy
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-[#625C52]"
                  >
                    <CheckCircle2 size={17} className="shrink-0 text-[#B18A45]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="group relative mx-auto w-full max-w-lg">
              <div className="absolute -inset-5 rotate-6 rounded-[45%] border border-[#C9A45C]/50 transition-all duration-500 group-hover:border-[#EFE8A8] group-hover:shadow-[0_0_30px_rgba(201,164,92,0.3)]" />

              <div className="relative overflow-hidden rounded-[32px] border-[7px] border-[#C9A45C] bg-[#090908] shadow-[0_20px_65px_rgba(0,0,0,0.35),0_0_25px_rgba(201,164,92,0.25)] transition-all duration-500 group-hover:border-[#EFE8A8] group-hover:shadow-[0_0_30px_rgba(239,232,168,0.4),0_20px_65px_rgba(0,0,0,0.35)]">
                <img
                  src="/kbc-salon-hero.png"
                  alt="KBC Saloon Academy beauty and makeup artistry"
                  className="h-[440px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#080807]/90 via-transparent to-transparent" />

                <div className="absolute bottom-7 left-7 right-7 text-white">
                  <span className="text-xs uppercase tracking-[0.3em] text-[#EFE8A8]">
                    Kavyas Beauty Centre
                  </span>
                  <h3 className="mt-2 font-serif text-3xl">
                    Discover Your Artistry
                  </h3>
                </div>
              </div>

              <div className={`absolute -left-8 top-16 hidden sm:block ${floatingCard}`}>
                <Sparkles
                  className="mb-2 text-[#EFE8A8] transition-colors group-hover:text-[#5D4218] group-active:text-[#5D4218]"
                  size={23}
                />
                <p className="text-sm font-bold">Beauty Meets Creativity</p>
                <p className="mt-1 text-xs text-[#C9B98F] transition-colors group-hover:text-[#59431D] group-active:text-[#59431D]">
                  Learn something beautiful
                </p>
              </div>

              <div className={`absolute -bottom-7 -right-5 ${floatingCard}`}>
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl border border-[#C9A45C]/60 bg-[#EFE8A8]/10 transition-all duration-300 group-hover:border-[#8C692C] group-hover:bg-[#17140D]/10 group-active:border-[#8C692C]">
                    <Gem className="text-[#EFE8A8] transition-colors group-hover:text-[#5D4218] group-active:text-[#5D4218]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Your Journey</p>
                    <p className="text-xs text-[#C9B98F] transition-colors group-hover:text-[#59431D] group-active:text-[#59431D]">
                      Starts with KBC
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03. POPULAR COURSES */}
      <section className="relative bg-white py-20 md:py-24">
        <div className="wrap">
          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#AD8946]">
                Learn Something Beautiful
              </span>

              <h2 className="mt-3 font-serif text-4xl md:text-5xl">
                Explore Our <span className="italic text-[#B18A45]">Courses.</span>
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-[#81786C]">
                From professional makeup to creative nail art,
                discover learning experiences designed to develop
                your beauty skills.
              </p>
            </div>

            <Link
              href="/courses"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#947235] transition hover:gap-4"
            >
              View All Courses <ArrowRight size={17} />
            </Link>
          </div>

          <CourseBrowser />
        </div>
      </section>

      {/* 04. BEAUTY TRANSFORMATION SHOWCASE - NEW SECTION */}
      <BeautyTransformation />

      {/* 05. LEARNING JOURNEY */}
      <section className="relative overflow-hidden bg-[#090908] py-20 text-[#FAF5ED] md:py-24">
        <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-[#C9A45C]/15 blur-[100px]" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#EFE8A8]/10 blur-[100px]" />

        <div className="wrap relative">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#EFE8A8]">
              Simple. Structured. Beautiful.
            </span>

            <h2 className="mt-4 font-serif text-4xl md:text-5xl">
              Your Learning <span className="italic text-[#EFE8A8]">Journey.</span>
            </h2>

            <p className="mt-5 leading-7 text-white/55">
              Getting started with KBC Academy is simple.
              Follow your own structured learning journey.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div key={step.number} className={goldCard}>
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#C9A45C]/10 blur-2xl transition duration-500 group-hover:bg-[#8C692C]/15 group-active:bg-[#8C692C]/15" />

                  <div className="relative mb-8 flex items-center justify-between">
                    <div className={goldIcon}>
                      <Icon size={26} />
                    </div>

                    <span className="font-serif text-4xl text-[#EFE8A8]/40 transition-colors group-hover:text-[#76551D]/50 group-active:text-[#76551D]/50">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="relative mb-3 text-lg font-semibold text-[#EFE8A8] transition-colors group-hover:text-[#17140D] group-active:text-[#17140D]">
                    {step.title}
                  </h3>

                  <p className="relative text-sm leading-7 text-white/65 transition-colors group-hover:text-[#40321C] group-active:text-[#40321C]">
                    {step.description}
                  </p>

                  <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#EFE8A8] shadow-[0_0_15px_#EFE8A8] transition-all duration-500 group-hover:w-full group-hover:bg-[#76551D] group-active:w-full group-active:bg-[#76551D]" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 06. ONLINE LEARNING EXPERIENCE */}
      <section className="relative py-20 md:py-28">
        <div className="wrap">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-4 rounded-[30px] bg-gradient-to-br from-[#EFE8A8]/50 to-[#C9A45C]/30 blur-2xl" />

              <div className="group relative overflow-hidden rounded-[28px] border border-[#C9A45C] bg-gradient-to-br from-[#242116] via-[#15140F] to-[#090908] p-5 text-[#FAF5ED] shadow-[0_20px_60px_rgba(0,0,0,0.3),0_0_25px_rgba(201,164,92,0.18)] transition-all duration-500 hover:-translate-y-1 hover:border-[#8C692C] hover:bg-gradient-to-br hover:from-[#FFF4CE] hover:via-[#E8D39A] hover:to-[#C9A45C] hover:text-[#17140D] hover:shadow-[0_0_25px_rgba(239,232,168,0.4),0_25px_65px_rgba(0,0,0,0.25)] active:border-[#8C692C] active:bg-gradient-to-br active:from-[#FFF4CE] active:via-[#E8D39A] active:to-[#C9A45C] active:text-[#17140D]">
                <div className="mb-5 flex items-center justify-between border-b border-[#C9A45C]/40 pb-4 transition-colors group-hover:border-[#8C692C]/50 group-active:border-[#8C692C]/50">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#EFE8A8] transition-colors group-hover:text-[#76551D] group-active:text-[#76551D]">
                      KBC Learning Studio
                    </p>
                    <h3 className="mt-1 font-serif text-xl text-white transition-colors group-hover:text-[#17140D] group-active:text-[#17140D]">
                      Your Learning Space
                    </h3>
                  </div>

                  <div className="grid h-11 w-11 place-items-center rounded-xl border border-[#C9A45C]/50 bg-[#EFE8A8]/10 transition-all group-hover:border-[#8C692C] group-hover:bg-[#17140D]/10 group-active:border-[#8C692C]">
                    <GraduationCap className="text-[#EFE8A8] transition-colors group-hover:text-[#5D4218] group-active:text-[#5D4218]" />
                  </div>
                </div>

                {/* STUDENT JOURNEY VIDEO */}
                <div className="relative overflow-hidden rounded-2xl border border-[#C9A45C]/60 bg-[#080807] shadow-[0_0_25px_rgba(201,164,92,0.2)] transition-all duration-500 hover:border-[#EFE8A8] hover:shadow-[0_0_30px_rgba(239,232,168,0.35)]">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    preload="metadata"
                    poster="/kbc-salon-hero.png"
                    aria-label="KBC student learning journey"
                    className="h-56 w-full bg-black object-cover"
                  >
                    <source
                      src="/videos/kbc-student-journey.mp4"
                      type="video/mp4"
                    />
                    Your browser does not support HTML video.
                  </video>

                  <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-[#EFE8A8]/60 bg-black/60 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#EFE8A8] backdrop-blur-md">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#EFE8A8]" />
                    Student Journey
                  </div>

                  <div className="pointer-events-none absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs uppercase tracking-widest text-[#EFE8A8]">
                      KBC Learning Studio
                    </p>
                    <p className="mt-1 font-serif text-xl">
                      From Passion to Profession
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    ["01", "Introduction to Beauty", "Available"],
                    ["02", "Professional Techniques", "Next Lesson"],
                    ["03", "Advanced Applications", "Locked"],
                  ].map(([number, title, status]) => (
                    <div key={number} className={lessonCard}>
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-lg text-[#EFE8A8] transition-colors group-hover:text-[#76551D] group-active:text-[#76551D]">
                          {number}
                        </span>
                        <p className="text-sm font-semibold text-[#FAF5ED] transition-colors group-hover:text-[#17140D] group-active:text-[#17140D]">
                          {title}
                        </p>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wide text-[#EFE8A8] transition-colors group-hover:text-[#76551D] group-active:text-[#76551D]">
                        {status}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-center text-[10px] text-[#C9B98F] transition-colors group-hover:text-[#59431D] group-active:text-[#59431D]">
                  Illustrative preview of the student learning experience
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#A7864B]">
                A Smarter Way To Learn
              </span>

              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                Your Classroom.
                <br />
                <span className="italic text-[#B18A45]">
                  Your Convenience.
                </span>
              </h2>

              <p className="mt-6 leading-8 text-[#786F63]">
                Experience a modern way of learning beauty skills.
                Access your enrolled courses through a dedicated
                learning space designed around your course duration
                and progress.
              </p>

              <div className="mt-9 space-y-4">
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div key={feature.number} className={featureCard}>
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#C9A45C] bg-gradient-to-br from-[#242116] to-[#090908] text-[#EFE8A8] transition-all duration-300 group-hover:border-[#8C692C] group-hover:bg-[#17140D]/10 group-hover:text-[#5D4218] group-hover:shadow-[0_0_20px_rgba(100,70,20,0.2)] group-active:border-[#8C692C] group-active:text-[#5D4218]">
                        <Icon size={22} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#EFE8A8] transition-colors group-hover:text-[#17140D] group-active:text-[#17140D]">
                          {feature.title}
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-white/65 transition-colors group-hover:text-[#40321C] group-active:text-[#40321C]">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/login"
                className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#121414] px-7 py-4 text-sm font-semibold text-[#EFE8A8] transition hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(201,164,92,0.3)]"
              >
                Enter Student Portal
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 07. LIVE MASTERCLASSES */}
      <section className="relative overflow-hidden bg-[#E8D8C5]/40 py-20 md:py-24">
        <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-[#EFE8A8]/30 blur-[100px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-[#C9A45C]/20 blur-[100px]" />

        <div className="wrap relative">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-[#A7864B]">
                <Sparkles size={15} />
                Beyond Recorded Lessons
              </span>

              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                Learn Together.
                <br />
                <span className="italic text-[#B18A45]">
                  Create Together.
                </span>
              </h2>

              <p className="mt-6 leading-8 text-[#786F63]">
                Take your learning experience further with
                scheduled live classes. Participate in special
                demonstrations, learn new techniques and explore
                beauty artistry with interactive sessions.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Weekly and monthly masterclasses",
                  "Live beauty demonstrations",
                  "Interactive learning sessions",
                  "Access to available class recordings",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-[#655D52]"
                  >
                    <CheckCircle2 size={18} className="shrink-0 text-[#A7864B]" />
                    {item}
                  </div>
                ))}
              </div>

              <Link
                href="/courses"
                className="mt-9 inline-flex items-center gap-2 rounded-full border border-[#C9A45C] px-7 py-4 text-sm font-bold text-[#8D6D34] transition hover:bg-[#EFE8A8]/60 hover:shadow-[0_0_20px_rgba(201,164,92,0.2)]"
              >
                Explore Learning Plans
                <ArrowRight size={17} />
              </Link>
            </div>

            {/* CINEMATIC MASTERCLASS VIDEO */}
            <div className="group relative">
              <div className="absolute -inset-3 rounded-[36px] bg-gradient-to-br from-[#EFE8A8]/60 via-[#C9A45C]/30 to-[#8C692C]/40 opacity-70 blur-xl transition duration-700 group-hover:opacity-100" />

              <div className="relative overflow-hidden rounded-[30px] border-[3px] border-[#C9A45C] bg-[#090908] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.3),0_0_30px_rgba(201,164,92,0.3)] transition-all duration-500 group-hover:-translate-y-1 group-hover:border-[#EFE8A8] group-hover:shadow-[0_0_35px_rgba(239,232,168,0.5),0_25px_65px_rgba(0,0,0,0.3)]">
                <div className="relative overflow-hidden rounded-[23px] bg-black">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    preload="metadata"
                    poster="/kbc-salon-hero.png"
                    aria-label="KBC professional beauty masterclass"
                    className="h-[320px] w-full bg-black object-cover sm:h-[380px] lg:h-[440px]"
                  >
                    <source
                      src="/videos/kbc-beauty-masterclass.mp4"
                      type="video/mp4"
                    />
                    Your browser does not support HTML video.
                  </video>

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/15" />

                  <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-[#EFE8A8]/60 bg-black/65 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#EFE8A8] shadow-lg backdrop-blur-md sm:left-6 sm:top-6">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#EFE8A8] shadow-[0_0_10px_#EFE8A8]" />
                    KBC Beauty Masterclass
                  </div>

                  <div className="pointer-events-none absolute bottom-12 left-5 right-5 sm:bottom-14 sm:left-8">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#EFE8A8] sm:text-xs">
                      Professional Beauty Training
                    </span>

                    <h3 className="mt-2 font-serif text-2xl leading-tight text-white sm:text-3xl md:text-4xl">
                      The Art of Bridal Beauty.
                    </h3>

                    <p className="mt-2 max-w-md text-xs leading-6 text-white/75 sm:text-sm">
                      Discover professional techniques, creativity
                      and the beauty of transformation.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 px-3 py-4 sm:px-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#EFE8A8]">
                      Learn. Practice. Create.
                    </p>
                    <p className="mt-1 text-[11px] text-white/50">
                      Kavyas Beauty Centre
                    </p>
                  </div>

                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#C9A45C]/60 bg-[#EFE8A8]/10 text-[#EFE8A8] transition-all duration-300 group-hover:border-[#EFE8A8] group-hover:bg-[#EFE8A8] group-hover:text-[#17140D] group-hover:shadow-[0_0_20px_rgba(239,232,168,0.4)]">
                    <Video size={22} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 08. WHY CHOOSE KBC */}
      <section className="bg-[#100F0C] py-20 text-[#FAF5ED] md:py-24">
        <div className="wrap">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#EFE8A8]">
              The KBC Difference
            </span>

            <h2 className="mt-4 font-serif text-4xl md:text-5xl">
              Why Choose <span className="italic text-[#EFE8A8]">KBC?</span>
            </h2>

            <p className="mt-5 leading-7 text-white/55">
              A learning experience built to encourage creativity,
              confidence and professional beauty skills.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <div key={benefit.title} className={goldCard}>
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#C9A45C]/10 blur-2xl transition-all duration-500 group-hover:bg-[#8C692C]/15 group-active:bg-[#8C692C]/15" />

                  <span className="absolute -right-3 -top-5 font-serif text-7xl text-[#EFE8A8]/10 transition-colors group-hover:text-[#76551D]/15 group-active:text-[#76551D]/15">
                    0{index + 1}
                  </span>

                  <div className={goldIcon}>
                    <Icon size={26} />
                  </div>

                  <h3 className="relative mt-7 text-lg font-bold text-[#EFE8A8] transition-colors group-hover:text-[#17140D] group-active:text-[#17140D]">
                    {benefit.title}
                  </h3>

                  <p className="relative mt-3 text-sm leading-7 text-white/65 transition-colors group-hover:text-[#40321C] group-active:text-[#40321C]">
                    {benefit.description}
                  </p>

                  <div className="relative mt-6 h-[2px] w-10 bg-[#C9A45C] shadow-[0_0_10px_rgba(239,232,168,0.35)] transition-all duration-500 group-hover:w-full group-hover:bg-[#76551D] group-hover:shadow-[0_0_15px_rgba(118,85,29,0.4)] group-active:w-full group-active:bg-[#76551D]" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 09. FINAL CALL TO ACTION */}
      <section className="relative overflow-hidden bg-[#090908] py-24 text-center text-white md:py-32">
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#C9A45C]/15 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#EFE8A8]/10 blur-[110px]" />

        <div className="wrap relative">
          <div className="mx-auto mb-7 grid h-16 w-16 place-items-center rounded-2xl border border-[#EFE8A8]/60 bg-[#EFE8A8]/10 text-[#EFE8A8] shadow-[0_0_25px_rgba(239,232,168,0.18)]">
            <Sparkles size={30} />
          </div>

          <span className="text-xs font-bold uppercase tracking-[0.35em] text-[#EFE8A8]">
            Your Story Begins Here
          </span>

          <h2 className="mx-auto mt-6 max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
            Your Passion.
            <br />
            Your Creativity.
            <br />
            <span className="italic text-[#EFE8A8]">
              Your Beautiful Future.
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-xl leading-8 text-white/55">
            Discover your potential, explore professional beauty
            courses and begin your creative journey with
            KBC Saloon Academy.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/courses"
              className="group inline-flex items-center gap-3 rounded-full bg-[#EFE8A8] px-8 py-4 text-sm font-bold text-[#121414] transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_0_35px_rgba(239,232,168,0.35)]"
            >
              Explore Our Courses
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-3 rounded-full border border-[#EFE8A8]/50 px-8 py-4 text-sm font-semibold text-[#EFE8A8] transition-all duration-300 hover:-translate-y-1 hover:border-[#EFE8A8] hover:bg-[#EFE8A8]/10 hover:shadow-[0_0_25px_rgba(239,232,168,0.2)]"
            >
              Student Login
              <GraduationCap size={18} />
            </Link>
          </div>

          <div className="mx-auto mt-16 h-px max-w-xs bg-gradient-to-r from-transparent via-[#C9A45C]/70 to-transparent" />

          <p className="mt-7 font-serif text-lg italic text-[#EFE8A8]/80">
            KBC SALOON ACADEMY
          </p>

          <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-white/35">
            Kavyas Beauty Centre
          </p>
        </div>
      </section>
    </main>
  );
}
