
"use client";

import { useState } from "react";
import type {
  ReactNode,
  MouseEvent,
  CSSProperties,
} from "react";

type GlowEffect =
  | "champagne-border"
  | "spotlight"
  | "corner-glow"
  | "light-sweep"
  | "ambient-halo"
  | "gold-particles"
  | "breathing-glow"
  | "liquid-glass"
  | "golden-orbit"
  | "magnetic-tilt";

type GoldenFireCardProps = {
  children: ReactNode;
  className?: string;
  intensity?: "soft" | "medium" | "strong";
  effect?: GlowEffect;
};

export default function GoldenFireCard({
  children,
  className = "",
  intensity = "medium",
  effect = "spotlight",
}: GoldenFireCardProps) {
  const [spotlight, setSpotlight] = useState({
    x: 50,
    y: 50,
  });

  const [tilt, setTilt] = useState({
    x: 0,
    y: 0,
  });

  const handleMouseMove = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    const bounds =
      event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - bounds.left) / bounds.width) *
      100;

    const y =
      ((event.clientY - bounds.top) / bounds.height) *
      100;

    setSpotlight({ x, y });

    if (effect === "magnetic-tilt") {
      setTilt({
        x: (50 - y) / 8,
        y: (x - 50) / 8,
      });
    }
  };

  const handleMouseLeave = () => {
    setSpotlight({ x: 50, y: 50 });
    setTilt({ x: 0, y: 0 });
  };

  const cardStyle = {
    "--spotlight-x": `${spotlight.x}%`,
    "--spotlight-y": `${spotlight.y}%`,
    "--tilt-x": `${tilt.x}deg`,
    "--tilt-y": `${tilt.y}deg`,
  } as CSSProperties;

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        kbc-glow-card
        kbc-glow-${effect}
        kbc-glass-${intensity}
        ${className}
      `}
      style={cardStyle}
    >
      <div
        className="kbc-glow-border"
        aria-hidden="true"
      />

      <div
        className="kbc-glow-spotlight"
        aria-hidden="true"
      />

      <div
        className="kbc-glow-particles"
        aria-hidden="true"
      />

      <div className="kbc-glow-content">
        {children}
      </div>
    </div>
  );
}
