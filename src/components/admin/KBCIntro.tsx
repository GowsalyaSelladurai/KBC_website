
"use client";

import { useEffect, useRef, useState } from "react";

type KBCIntroProps = {
  onComplete: () => void;
};

type Particle = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  size: number;
  alpha: number;
  color: string;
  phase: number;
};

export default function KBCIntro({ onComplete }: KBCIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [assembled, setAssembled] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    let animationFrame = 0;
    let particles: Particle[] = [];
    let ambient: Particle[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;
    let startTime = performance.now();
    let imageReady = false;
    let disposed = false;

    const colors = [
      "#fff4c2",
      "#EFE8A8",
      "#ffd27a",
      "#ffad4d",
      "#ff7a24",
      "#e85b1b",
    ];

    const logo = new Image();
    logo.src = "/kavyas-logo.png";

    const resizeCanvas = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const createLogoParticles = () => {
      if (!logo.complete || !logo.naturalWidth) return;

      const offscreen = document.createElement("canvas");
      const offContext = offscreen.getContext("2d");

      if (!offContext) return;

      const maxWidth = Math.min(330, width * 0.7);
      const maxHeight = Math.min(190, height * 0.28);

      const scale = Math.min(
        maxWidth / logo.naturalWidth,
        maxHeight / logo.naturalHeight
      );

      const logoWidth = logo.naturalWidth * scale;
      const logoHeight = logo.naturalHeight * scale;

      offscreen.width = Math.max(1, Math.round(logoWidth));
      offscreen.height = Math.max(1, Math.round(logoHeight));

      offContext.drawImage(
        logo,
        0,
        0,
        offscreen.width,
        offscreen.height
      );

      const pixels = offContext.getImageData(
        0,
        0,
        offscreen.width,
        offscreen.height
      ).data;

      const offsetX = (width - logoWidth) / 2;
      const offsetY = height / 2 - logoHeight / 2 - 35;

      particles = [];

      for (let y = 0; y < offscreen.height; y += 4) {
        for (let x = 0; x < offscreen.width; x += 4) {
          const index = (y * offscreen.width + x) * 4;
          const alpha = pixels[index + 3];

          if (alpha < 90) continue;

          const targetX = offsetX + x;
          const targetY = offsetY + y;

          particles.push({
            x: Math.random() * width,
            y: height + Math.random() * height,
            targetX,
            targetY,
            speed: 0.035 + Math.random() * 0.055,
            size: 0.7 + Math.random() * 1.6,
            alpha: 0.55 + Math.random() * 0.45,
            color: colors[Math.floor(Math.random() * colors.length)],
            phase: Math.random() * Math.PI * 2,
          });
        }
      }

      imageReady = true;
    };

    const createAmbientParticles = () => {
      ambient = Array.from({ length: 95 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        targetX: Math.random() * width,
        targetY: Math.random() * height,
        speed: 0.2 + Math.random() * 0.8,
        size: 0.5 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.7,
        color: colors[Math.floor(Math.random() * colors.length)],
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const drawParticle = (
      particle: Particle,
      glow: boolean
    ) => {
      const flicker =
        0.65 + Math.sin(performance.now() * 0.008 + particle.phase) * 0.3;

      context.globalAlpha = particle.alpha * flicker;

      if (glow) {
        context.shadowBlur = 15;
        context.shadowColor = particle.color;
      } else {
        context.shadowBlur = 8;
        context.shadowColor = particle.color;
      }

      context.fillStyle = particle.color;
      context.beginPath();
      context.arc(
        particle.x,
        particle.y,
        particle.size,
        0,
        Math.PI * 2
      );
      context.fill();

      context.shadowBlur = 0;
      context.globalAlpha = 1;
    };

    const animate = (now: number) => {
      if (disposed) return;

      context.clearRect(0, 0, width, height);

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / 2600, 1);

      // Ambient floating fire sparks.
      ambient.forEach((particle) => {
        particle.y -= particle.speed * 0.45;
        particle.x += Math.sin(now * 0.001 + particle.phase) * 0.25;

        if (particle.y < -10) {
          particle.y = height + 10;
          particle.x = Math.random() * width;
        }

        drawParticle(particle, false);
      });

      // Particles assemble the actual logo shape.
      if (imageReady) {
        particles.forEach((particle) => {
          const dx = particle.targetX - particle.x;
          const dy = particle.targetY - particle.y;

          particle.x += dx * particle.speed;
          particle.y += dy * particle.speed;

          if (progress < 0.88) {
            context.globalAlpha = 0.22;
            context.strokeStyle = particle.color;
            context.lineWidth = 0.7;
            context.beginPath();
            context.moveTo(
              particle.x,
              particle.y + 5
            );
            context.lineTo(
              particle.x,
              particle.y + 13
            );
            context.stroke();
            context.globalAlpha = 1;
          }

          drawParticle(particle, true);
        });
      }

      // Central golden light burst.
      if (elapsed > 1600 && elapsed < 3300) {
        const burstProgress = (elapsed - 1600) / 1700;
        const radius = 25 + burstProgress * 240;

        const gradient = context.createRadialGradient(
          width / 2,
          height / 2 - 35,
          0,
          width / 2,
          height / 2 - 35,
          radius
        );

        gradient.addColorStop(0, "rgba(255, 202, 105, 0.12)");
        gradient.addColorStop(0.4, "rgba(255, 139, 48, 0.045)");
        gradient.addColorStop(1, "rgba(255, 139, 48, 0)");

        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createAmbientParticles();

    const handleResize = () => {
      resizeCanvas();
      createAmbientParticles();

      if (logo.complete) {
        createLogoParticles();
      }
    };

    logo.onload = () => {
      createLogoParticles();
    };

    window.addEventListener("resize", handleResize);

    animationFrame = requestAnimationFrame(animate);

    const assembleTimer = window.setTimeout(() => {
      setAssembled(true);
    }, 2400);

    const completeTimer = window.setTimeout(() => {
      onComplete();
    }, 6800);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(assembleTimer);
      window.clearTimeout(completeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [onComplete]);

  return (
    <div
      className={`kbc-cinematic-intro ${assembled ? "is-assembled" : ""}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        minHeight: "100dvh",
        zIndex: 999999,
        overflow: "hidden",
        background: "#121414",
        isolation: "isolate",
        pointerEvents: "auto",
      }}
    >
      <canvas
        ref={canvasRef}
        className="kbc-assembly-canvas"
      />

      <div className="kbc-intro-vignette" />

      <div className="kbc-intro-scanline" />

      <div className="kbc-intro-center">
        <div className="kbc-logo-aura" />

        <img
          src="/kavyas-logo.png"
          alt="Kavyas Beauty Centre"
          className="kbc-assembled-logo"
        />

        <div className="kbc-logo-ring kbc-logo-ring-one" />
        <div className="kbc-logo-ring kbc-logo-ring-two" />

        <div className="kbc-intro-brand">
          <span className="kbc-brand-small">WELCOME TO</span>

          <h1>KBC SALON ACADEMY</h1>

          <div className="kbc-brand-divider">
            <span />
            ✦
            <span />
          </div>

          <p>BEAUTY · CREATIVITY · EXCELLENCE</p>
        </div>
      </div>

      <div className="kbc-intro-bottom">
        <span>EST. KAVYAS BEAUTY CENTRE</span>
        <span className="kbc-intro-loading">ILLUMINATING YOUR EXPERIENCE</span>
      </div>

      <button
        className="kbc-cinematic-skip"
        onClick={onComplete}
        type="button"
      >
        SKIP INTRO <span>↗</span>
      </button>
    </div>
  );
}
