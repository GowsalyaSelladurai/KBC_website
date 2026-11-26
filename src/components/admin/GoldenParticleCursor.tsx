"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  maxLife: number;
};

export default function GoldenParticleCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    if (!media.matches) return;

    let particles: Particle[] = [];
    let animationFrame = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let lastX = 0;
    let lastY = 0;
    let hasMoved = false;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createParticle = (x: number, y: number) => {
      particles.push({
        x,
        y,
        size: Math.random() * 2.5 + 1,
        speedX: (Math.random() - 0.5) * 1.2,
        speedY: (Math.random() - 0.5) * 1.2,
        life: 1,
        maxLife: Math.random() * 35 + 25,
      });

      if (particles.length > 120) {
        particles.splice(0, particles.length - 120);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!hasMoved) {
        lastX = event.clientX;
        lastY = event.clientY;
        hasMoved = true;
      }

      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const distance = Math.hypot(dx, dy);
      const count = Math.min(Math.floor(distance / 5), 5);

      for (let i = 0; i < count; i++) {
        const progress = (i + 1) / (count + 1);

        createParticle(
          lastX + dx * progress,
          lastY + dy * progress
        );
      }

      lastX = event.clientX;
      lastY = event.clientY;
    };

    const handleClick = (event: MouseEvent) => {
      for (let i = 0; i < 18; i++) {
        const angle = (Math.PI * 2 * i) / 18;
        const speed = Math.random() * 2 + 1;

        particles.push({
          x: event.clientX,
          y: event.clientY,
          size: Math.random() * 3 + 1,
          speedX: Math.cos(angle) * speed,
          speedY: Math.sin(angle) * speed,
          life: 1,
          maxLife: 45,
        });
      }
    };

    const animate = () => {
      context.clearRect(0, 0, width, height);

      particles = particles.filter((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life -= 1 / particle.maxLife;

        const opacity = Math.max(particle.life, 0);

        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          particle.size * opacity,
          0,
          Math.PI * 2
        );

        context.fillStyle = `rgba(239, 232, 168, ${opacity})`;
        context.shadowColor = "#EFE8A8";
        context.shadowBlur = 12;
        context.fill();

        return particle.life > 0;
      });

      context.shadowBlur = 0;
      animationFrame = requestAnimationFrame(animate);
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("click", handleClick);

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="kbc-golden-particles"
      aria-hidden="true"
    />
  );
}