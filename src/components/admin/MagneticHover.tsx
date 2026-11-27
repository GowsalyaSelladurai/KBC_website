
"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
} from "react";

type MagneticHoverProps = {
  children: ReactNode;
  strength?: number;
  className?: string;
};

export default function MagneticHover({
  children,
  strength = 5,
  className = "",
}: MagneticHoverProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    if (!media.matches) return;

    const handleMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const x = (event.clientX - centerX) / (rect.width / 2);
      const y = (event.clientY - centerY) / (rect.height / 2);

      element.style.setProperty(
        "--magnetic-x",
        `${x * strength}px`
      );

      element.style.setProperty(
        "--magnetic-y",
        `${y * strength}px`
      );

      element.classList.add("kbc-magnetic-active");
    };

    const handleLeave = () => {
      element.style.setProperty("--magnetic-x", "0px");
      element.style.setProperty("--magnetic-y", "0px");
      element.classList.remove("kbc-magnetic-active");
    };

    element.addEventListener("pointermove", handleMove);
    element.addEventListener("pointerleave", handleLeave);

    return () => {
      element.removeEventListener("pointermove", handleMove);
      element.removeEventListener("pointerleave", handleLeave);
    };
  }, [strength]);

  return (
    <div
      ref={elementRef}
      className={`kbc-magnetic ${className}`}
    >
      {children}
    </div>
  );
}
