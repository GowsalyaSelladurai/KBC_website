
import CourseBrowser from "@/components/CourseBrowser";

export default function Courses() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#FAF5ED] text-[#242424]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#C9A45C]/25">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#EFE8A8]/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#C9A45C]/15 blur-3xl" />

        <div className="wrap relative py-16 text-center md:py-24">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#C9A45C]/50 bg-white/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#94743A] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9A45C]" />
            KBC Saloon Academy
          </span>

          <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight text-[#242424] md:text-6xl">
            Discover Your
            <span className="block bg-gradient-to-r from-[#A77B32] via-[#D5B76B] to-[#98702E] bg-clip-text text-transparent">
              Signature Skill
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#777064] md:text-base">
            Explore professional beauty and makeover courses designed to
            inspire creativity, build confidence and turn your passion into
            professional skills.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <div className="rounded-xl border border-[#C9A45C]/30 bg-white/80 px-5 py-3 shadow-sm">
              <p className="text-xl font-bold text-[#A77B32]">01</p>
              <p className="mt-1 text-xs text-[#777064]">Choose your course</p>
            </div>
            <div className="rounded-xl border border-[#C9A45C]/30 bg-white/80 px-5 py-3 shadow-sm">
              <p className="text-xl font-bold text-[#A77B32]">02</p>
              <p className="mt-1 text-xs text-[#777064]">Learn from experts</p>
            </div>
            <div className="rounded-xl border border-[#C9A45C]/30 bg-white/80 px-5 py-3 shadow-sm">
              <p className="text-xl font-bold text-[#A77B32]">03</p>
              <p className="mt-1 text-xs text-[#777064]">Build your future</p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Collection */}
      <section className="wrap py-14 md:py-20">
        <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#A77B32]">
              The KBC Collection
            </p>
            <h2 className="text-3xl font-bold text-[#242424] md:text-4xl">
              Explore Our <span className="text-[#B18A45]">Courses</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#777064]">
              Find the right course for your interests and take the next step
              in your beauty journey.
            </p>
          </div>

          <span className="w-fit rounded-full border border-[#C9A45C]/40 bg-white px-4 py-2 text-xs font-medium text-[#94743A]">
            Learn • Create • Shine
          </span>
        </div>

        <div className="rounded-3xl border border-[#C9A45C]/20 bg-white/60 p-3 shadow-[0_15px_50px_rgba(100,75,35,0.07)] sm:p-5 md:p-7">
          <CourseBrowser search />
        </div>
      </section>

      {/* Closing Section */}
      <section className="relative overflow-hidden border-t border-[#C9A45C]/20 bg-[#242424]">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-[#C9A45C]/10 blur-3xl" />

        <div className="wrap relative py-14 text-center md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D5B76B]">
            Your journey begins here
          </p>
          <h2 className="mt-4 text-3xl font-bold text-[#FAF5ED] md:text-4xl">
            Passion into Profession.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#D1C9BA]">
            Every skill you learn is a new opportunity. Choose your course,
            discover your creativity and let your talent shine.
          </p>
          <div className="mx-auto mt-7 h-px w-24 bg-gradient-to-r from-transparent via-[#D5B76B] to-transparent" />
          <p className="mt-5 text-xs tracking-[0.2em] text-[#D5B76B]">
            KBC SALOON ACADEMY
          </p>
        </div>
      </section>
    </main>
  );
}
