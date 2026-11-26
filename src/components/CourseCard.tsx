
import Link from "next/link";
import { Course } from "@/data/mock";

export default function CourseCard({ c }: { c: Course }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#171918] p-3 transition-all duration-500 hover:-translate-y-1 hover:border-[#D8C58A]/60 hover:shadow-[0_15px_40px_rgba(0,0,0,0.35)]">

      {/* Course Icon */}
      <div className="relative grid h-36 place-items-center overflow-hidden rounded-xl border border-[#D8C58A]/15 bg-gradient-to-br from-[#292b27] via-[#1d211e] to-[#111312]">

        <div className="absolute inset-0 bg-gradient-to-tr from-[#D8C58A]/10 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

        <span className="relative text-5xl transition-transform duration-500 group-hover:scale-110">
          {c.icon}
        </span>

        <span className="absolute bottom-2 right-3 text-[9px] tracking-[3px] text-[#D8C58A]/50">
          KBC ACADEMY
        </span>
      </div>

      {/* Course Details */}
      <div className="flex flex-1 flex-col pt-3">

        <span className="mb-2 w-fit rounded-full border border-[#D8C58A]/20 bg-[#D8C58A]/5 px-2.5 py-1 text-[10px] font-medium tracking-wider text-[#D8C58A]">
          {c.days} DAY{c.days > 1 ? "S" : ""} ACCESS
        </span>

        <h3 className="text-base font-semibold leading-snug text-[#F2EEE3] transition-colors duration-300 group-hover:text-[#D8C58A]">
          {c.name}
        </h3>

        <p className="mt-1.5 text-xs leading-relaxed text-[#999B94]">
          {c.videos.length} video lessons
          <span className="mx-1.5 text-[#D8C58A]/50">·</span>
          {c.days * 24}h access
        </p>

        {/* Price & Button */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.07] pt-3 mt-4">

          <div>
            <span className="block text-[9px] uppercase tracking-[2px] text-[#888A82]">
              Course fee
            </span>

            <span className="text-lg font-semibold text-[#D8C58A]">
              ₹{c.price.toLocaleString("en-IN")}
            </span>
          </div>

          <Link
            href={`/courses/${c.id}`}
            className="rounded-lg border border-[#D8C58A]/40 bg-[#D8C58A]/10 px-3 py-2 text-[11px] font-semibold tracking-wide text-[#E9D9A7] transition-all duration-300 hover:border-[#D8C58A] hover:bg-[#D8C58A] hover:text-[#171918]"
          >
            Explore →
          </Link>

        </div>
      </div>
    </div>
  );
}
