"use client";

import { useEffect, useRef } from "react";

export default function ButterflyCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const sparkleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    const cursor = cursorRef.current;
    const sparkle = sparkleRef.current;

    if (!cursor || !sparkle) return;

    let frame = 0;

    const move = (e: MouseEvent) => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        const x = e.clientX - 22;
        const y = e.clientY - 22;

        cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        sparkle.style.transform = `translate3d(${x}px, ${y}px, 0)`;

        cursor.style.opacity = "1";
        sparkle.style.opacity = "1";
      });
    };

    const hide = () => {
      cursor.style.opacity = "0";
      sparkle.style.opacity = "0";
    };

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", hide);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", hide);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="butterfly-cursor">
        <svg viewBox="0 0 100 100" width="44" height="44">
          <defs>
            <linearGradient id="butterfly-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF4C2" />
              <stop offset="50%" stopColor="#C9A45C" />
              <stop offset="100%" stopColor="#8C642C" />
            </linearGradient>
          </defs>

          {/* Upper left wing */}
          <g className="butterfly-upper-left">
            <path
              d="M48 43 C35 10 7 5 8 30 C8 47 28 53 47 51Z"
              fill="#171717"
              stroke="url(#butterfly-gold)"
              strokeWidth="2"
            />
            <path
              d="M46 44 Q30 27 16 25 M45 48 Q29 43 18 38"
              stroke="url(#butterfly-gold)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="24" cy="30" r="3" fill="#EFE8A8" />
          </g>

          {/* Upper right wing */}
          <g className="butterfly-upper-right">
            <path
              d="M52 43 C65 10 93 5 92 30 C92 47 72 53 53 51Z"
              fill="#171717"
              stroke="url(#butterfly-gold)"
              strokeWidth="2"
            />
            <path
              d="M54 44 Q70 27 84 25 M55 48 Q71 43 82 38"
              stroke="url(#butterfly-gold)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="76" cy="30" r="3" fill="#EFE8A8" />
          </g>

          {/* Lower left wing */}
          <g className="butterfly-lower-left">
            <path
              d="M46 51 C22 43 13 57 23 77 C32 91 43 75 49 57Z"
              fill="#171717"
              stroke="url(#butterfly-gold)"
              strokeWidth="2"
            />
            <path
              d="M45 55 Q31 61 28 75"
              stroke="url(#butterfly-gold)"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="34" cy="66" r="2.5" fill="#EFE8A8" />
          </g>

          {/* Lower right wing */}
          <g className="butterfly-lower-right">
            <path
              d="M54 51 C78 43 87 57 77 77 C68 91 57 75 51 57Z"
              fill="#171717"
              stroke="url(#butterfly-gold)"
              strokeWidth="2"
            />
            <path
              d="M55 55 Q69 61 72 75"
              stroke="url(#butterfly-gold)"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="66" cy="66" r="2.5" fill="#EFE8A8" />
          </g>

          {/* Body */}
          <path
            d="M50 37 C44 47 44 62 50 70 C56 62 56 47 50 37Z"
            fill="url(#butterfly-gold)"
          />

          {/* Antennae */}
          <path
            d="M48 39 Q36 20 31 24 M52 39 Q64 20 69 24"
            stroke="#C9A45C"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="31" cy="24" r="2.5" fill="#EFE8A8" />
          <circle cx="69" cy="24" r="2.5" fill="#EFE8A8" />
        </svg>
      </div>

      {/* Golden sparkle trail */}
      <div ref={sparkleRef} className="butterfly-sparkle">
        <span className="sparkle-one" />
        <span className="sparkle-two" />
        <span className="sparkle-three" />
      </div>

      <style jsx global>{`
        .butterfly-cursor {
          position: fixed;
          top: 0;
          left: 0;
          width: 44px;
          height: 44px;
          pointer-events: none;
          z-index: 99999;
          opacity: 0;
          will-change: transform;
          filter: drop-shadow(0 0 5px rgba(201, 164, 92, 0.5));
        }

        .butterfly-upper-left,
        .butterfly-upper-right,
        .butterfly-lower-left,
        .butterfly-lower-right {
          transform-box: view-box;
          transform-style: preserve-3d;
          backface-visibility: visible;
        }

        .butterfly-upper-left {
          transform-origin: 48px 48px;
          animation: upperLeftFlap 0.32s ease-in-out infinite alternate;
        }

        .butterfly-upper-right {
          transform-origin: 52px 48px;
          animation: upperRightFlap 0.32s ease-in-out infinite alternate;
        }

        .butterfly-lower-left {
          transform-origin: 48px 52px;
          animation: lowerLeftFlap 0.32s ease-in-out infinite alternate;
        }

        .butterfly-lower-right {
          transform-origin: 52px 52px;
          animation: lowerRightFlap 0.32s ease-in-out infinite alternate;
        }

        @keyframes upperLeftFlap {
          from { transform: rotateY(0deg) rotateZ(0deg); }
          to { transform: rotateY(48deg) rotateZ(-7deg); }
        }

        @keyframes upperRightFlap {
          from { transform: rotateY(0deg) rotateZ(0deg); }
          to { transform: rotateY(-48deg) rotateZ(7deg); }
        }

        @keyframes lowerLeftFlap {
          from { transform: rotateY(0deg) rotateZ(0deg); }
          to { transform: rotateY(35deg) rotateZ(5deg); }
        }

        @keyframes lowerRightFlap {
          from { transform: rotateY(0deg) rotateZ(0deg); }
          to { transform: rotateY(-35deg) rotateZ(-5deg); }
        }

        .butterfly-sparkle {
          position: fixed;
          top: 0;
          left: 0;
          width: 44px;
          height: 44px;
          pointer-events: none;
          z-index: 99998;
          opacity: 0;
          will-change: transform;
        }

        .butterfly-sparkle span {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #C9A45C;
          box-shadow: 0 0 8px #EFE8A8;
          animation: goldSparkle 1.2s ease-in-out infinite;
        }

        .sparkle-one { top: 5px; right: 0; }
        .sparkle-two {
          bottom: 5px;
          left: 0;
          animation-delay: 0.4s !important;
        }
        .sparkle-three {
          top: 50%;
          right: -7px;
          animation-delay: 0.8s !important;
        }

        @keyframes goldSparkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.5);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .butterfly-upper-left,
          .butterfly-upper-right,
          .butterfly-lower-left,
          .butterfly-lower-right,
          .butterfly-sparkle span {
            animation: none !important;
          }
        }

        @media (hover: none), (pointer: coarse) {
          .butterfly-cursor,
          .butterfly-sparkle {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
