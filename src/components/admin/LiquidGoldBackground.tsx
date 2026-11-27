
"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  opacity: number;
  phase: number;
};

type Ripple = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  width: number;
};

export default function LiquidGoldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrame = 0;
    let lastTime = 0;
    let rippleTimer = 0;

    let particles: Particle[] = [];
    let ripples: Ripple[] = [];

    const createParticles = () => {
      const count = Math.min(
        85,
        Math.max(30, Math.floor((width * height) / 16000))
      );

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.5,
        speed: Math.random() * 0.22 + 0.08,
        drift: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.45 + 0.15,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const createRipple = () => {
      ripples.push({
        x: width * (0.15 + Math.random() * 0.7),
        y: height * (0.15 + Math.random() * 0.7),
        radius: 5,
        speed: Math.random() * 0.45 + 0.3,
        opacity: Math.random() * 0.15 + 0.1,
        width: Math.random() * 1.2 + 0.7,
      });
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      createParticles();
      ripples = [];

      if (reducedMotion) draw(0, true);
    };

    const drawOrb = (
      x: number,
      y: number,
      radius: number,
      opacity: number
    ) => {
      const gradient = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        radius
      );

      gradient.addColorStop(0, `rgba(239,232,168,${opacity})`);
      gradient.addColorStop(0.35, `rgba(239,232,168,${opacity * 0.3})`);
      gradient.addColorStop(1, "rgba(239,232,168,0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawGrid = (time: number) => {
      const centerX = width * 0.5;
      const centerY = height * 0.48;
      const maxRadius = Math.max(width, height) * 0.75;

      ctx.save();
      ctx.strokeStyle = "rgba(239,232,168,0.035)";
      ctx.lineWidth = 1;

      for (let i = 1; i <= 9; i++) {
        ctx.beginPath();
        ctx.arc(
          centerX,
          centerY,
          (maxRadius / 9) * i + Math.sin(time * 0.0003 + i) * 2,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      for (let i = 0; i < 24; i++) {
        const angle = (Math.PI * 2 * i) / 24;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(angle) * maxRadius,
          centerY + Math.sin(angle) * maxRadius
        );
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawRipples = (delta: number) => {
      ctx.save();

      ripples.forEach((ripple) => {
        ripple.radius += ripple.speed * delta * 0.06;
        ripple.opacity -= 0.00016 * delta;

        if (ripple.opacity <= 0) return;

        // Multiple soft rings create a water-ripple appearance.
        for (let ring = 0; ring < 3; ring++) {
          const ringRadius = ripple.radius - ring * 17;

          if (ringRadius <= 0) continue;

          ctx.beginPath();
          ctx.arc(
            ripple.x,
            ripple.y,
            ringRadius,
            0,
            Math.PI * 2
          );

          ctx.strokeStyle = `rgba(239,232,168,${
            ripple.opacity * (1 - ring * 0.22)
          })`;

          ctx.lineWidth = ripple.width;
          ctx.shadowBlur = 12;
          ctx.shadowColor = "rgba(239,232,168,0.3)";
          ctx.stroke();
        }
      });

      ripples = ripples.filter(
        (ripple) => ripple.opacity > 0 && ripple.radius < 420
      );

      ctx.restore();
    };

    const drawParticles = (time: number, delta: number) => {
      particles.forEach((particle) => {
        if (!reducedMotion) {
          particle.y -= particle.speed * delta * 0.06;
          particle.x +=
            Math.sin(time * 0.0005 + particle.phase) *
              particle.drift *
              delta *
              0.025;
        }

        if (particle.y < -10) {
          particle.y = height + 10;
          particle.x = Math.random() * width;
        }

        const pulse =
          0.75 + Math.sin(time * 0.001 + particle.phase) * 0.25;

        ctx.beginPath();
        ctx.arc(
          particle.x,
          particle.y,
          particle.size,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(239,232,168,${
          particle.opacity * pulse
        })`;

        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(239,232,168,0.65)";
        ctx.fill();
      });

      ctx.shadowBlur = 0;
    };

    function draw(time: number, staticFrame = false) {
      const delta = lastTime ? Math.min(time - lastTime, 40) : 16;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#121414";
      ctx.fillRect(0, 0, width, height);

      const movement = staticFrame ? 0 : time * 0.00015;

      // Drifting champagne-gold glowing orbs.
      drawOrb(
        width * (0.2 + Math.sin(movement) * 0.06),
        height * 0.28,
        Math.max(width, height) * 0.28,
        0.075
      );

      drawOrb(
        width * (0.78 + Math.cos(movement * 0.8) * 0.05),
        height * 0.72,
        Math.max(width, height) * 0.25,
        0.065
      );

      drawOrb(
        width * 0.5,
        height * (0.48 + Math.sin(movement * 1.3) * 0.05),
        Math.max(width, height) * 0.18,
        0.035
      );

      drawGrid(time);
      drawRipples(delta);
      drawParticles(time, delta);

      if (!staticFrame && !reducedMotion) {
        rippleTimer += delta;

        if (rippleTimer > 2600) {
          createRipple();
          rippleTimer = 0;
        }

        animationFrame = requestAnimationFrame((nextTime) =>
          draw(nextTime)
        );
      }
    }

    resize();
    createRipple();
    createRipple();

    if (!reducedMotion) {
      animationFrame = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="kbc-liquid-gold" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="kbc-gold-particle-canvas"
      />
      <div className="kbc-gold-vignette" />
    </div>
  );
}
