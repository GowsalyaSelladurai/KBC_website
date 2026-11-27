
"use client";

import type { ReactNode } from "react";

export type KbcCardVariant =
  | "gold-outline"
  | "glass"
  | "folded"
  | "minimal"
  | "circle"
  | "calendar"
  | "glow"
  | "stacked"
  | "document"
  | "angled";

interface KbcCardProps {
  variant?: KbcCardVariant;
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  badge?: string;
  footer?: ReactNode;
  className?: string;
}

const variants: Record<KbcCardVariant, string> = {
  "gold-outline":
    "border-2 border-[#BDA66B] bg-[#292929] shadow-[0_0_15px_rgba(189,166,107,0.08)]",

  glass:
    "border border-white/15 bg-gradient-to-br from-white/[0.12] to-white/[0.03] shadow-xl backdrop-blur-xl",

  folded:
    "relative overflow-hidden border border-[#BDA66B]/60 bg-[#30302D]",

  minimal:
    "border border-white/10 bg-[#30302D] shadow-lg",

  circle:
    "flex aspect-square max-w-[260px] flex-col justify-center rounded-full border border-[#D2B45F] bg-gradient-to-br from-[#D9BD70] to-[#A98A3D] p-8 text-[#242424] shadow-[0_0_30px_rgba(210,180,95,0.20)]",

  calendar:
    "border border-white/10 border-t-4 border-t-[#BDA66B] bg-[#30302D] shadow-lg",

  glow:
    "border border-[#D6B966]/50 bg-gradient-to-br from-[#51472D] via-[#302D25] to-[#292929] shadow-[0_0_30px_rgba(214,185,102,0.15)]",

  stacked:
    "relative border border-white/15 bg-[#393939] shadow-[0_8px_0_#242424,0_14px_0_#1c1c1c,0_18px_25px_rgba(0,0,0,0.35)]",

  document:
    "border border-[#BDA66B]/40 border-t-2 border-t-[#D6B966] bg-[#30302D] shadow-lg",

  angled:
    "border border-white/10 bg-gradient-to-br from-[#3A3A3A] to-[#252525] shadow-xl",
};

export default function KbcCard({
  variant = "gold-outline",
  title,
  value,
  description,
  icon,
  badge,
  footer,
  className = "",
}: KbcCardProps) {
  const isCircle = variant === "circle";
  const isAngled = variant === "angled";
  const isFolded = variant === "folded";

  return (
    <div
      className={`
        group relative min-h-[175px] rounded-2xl p-5
        transition-all duration-300 ease-out
        hover:-translate-y-1
        ${variants[variant]}
        ${isCircle ? "rounded-full" : ""}
        ${isAngled ? "-skew-x-3 hover:-skew-x-2" : ""}
        ${className}
      `}
    >
      {/* Folded corner decoration */}
      {isFolded && (
        <div className="absolute right-0 top-0 h-0 w-0 border-l-[58px] border-t-[58px] border-l-transparent border-t-[#D0B15D]">
          <span className="absolute -right-[49px] -top-[53px] text-[#242424]">
            ✦
          </span>
        </div>
      )}

      {/* Gold glow decoration */}
      {variant === "glow" && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#D6B966]/15 blur-3xl" />
      )}

      {/* Card content */}
      <div className={isAngled ? "skew-x-3" : ""}>
        {/* Header */}
        <div className="relative z-10 mb-5 flex items-start justify-between gap-3">
          <p
            className={`text-sm font-medium ${
              isCircle ? "text-[#332B1B]" : "text-[#D4C9A7]"
            }`}
          >
            {title}
          </p>

          {icon && (
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                isCircle
                  ? "bg-black/10 text-[#332B1B]"
                  : "bg-[#EFE8A8]/10 text-[#EFE8A8]"
              }`}
            >
              {icon}
            </div>
          )}
        </div>

        {/* Value */}
        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <h3
            className={`text-3xl font-semibold tracking-tight ${
              isCircle ? "text-[#292315]" : "text-[#F5F1E6]"
            }`}
          >
            {value}
          </h3>

          {badge && (
            <span className="rounded-full border border-[#EFE8A8]/20 bg-[#EFE8A8]/10 px-2.5 py-1 text-[10px] font-semibold text-[#EFE8A8]">
              {badge}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p
            className={`mt-2 text-xs ${
              isCircle ? "text-[#40351E]" : "text-[#A9A58A]"
            }`}
          >
            {description}
          </p>
        )}

        {/* Footer */}
        {footer && (
          <div className="relative z-10 mt-4 border-t border-white/10 pt-3">
            {footer}
          </div>
        )}
      </div>

      {/* Hover accent */}
      {!isCircle && (
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-[#EFE8A8]/25" />
        </div>
      )}
    </div>
  );
}
