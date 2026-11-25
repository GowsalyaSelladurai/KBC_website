
"use client";

import { useEffect, useRef } from "react";

type Butterfly = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  size: number;
};

export default function ButterflyCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId = 0;
    let lastSpawn = 0;
    let idCounter = 0;

    const butterflies: Butterfly[] = [];

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createButterfly = (x: number, y: number) => {
      butterflies.push({
        id: idCounter++,
        x,
        y,
        vx: (Math.random() - 0.5) * 1.8,
        vy: -Math.random() * 1.5 - 0.4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.06,
        life: 1,
        size: Math.random() * 9 + 9,
      });

      if (butterflies.length > 35) {
        butterflies.shift();
      }
    };

    const drawButterfly = (b: Butterfly) => {
      ctx.save();

      ctx.translate(b.x, b.y);
      ctx.rotate(b.rotation);
      ctx.globalAlpha = b.life;

      const wingFlap = Math.sin(performance.now() * 0.012 + b.id) * 0.45;

      ctx.shadowColor = "#EFE8A8";
      ctx.shadowBlur = 12;

      // Left wing
      ctx.save();
      ctx.rotate(-wingFlap);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-b.size, -b.size * 1.2, -b.size * 1.8, -b.size * 0.5, -b.size, b.size * 0.2);
      ctx.bezierCurveTo(-b.size * 0.8, b.size, -b.size * 0.3, b.size * 0.6, 0, 0);
      ctx.closePath();

      const leftGradient = ctx.createLinearGradient(-b.size, -b.size, 0, b.size);
      leftGradient.addColorStop(0, "#FFF8D6");
      leftGradient.addColorStop(1, "#D99A32");

      ctx.fillStyle = leftGradient;
      ctx.fill();

      ctx.restore();

      // Right wing
      ctx.save();
      ctx.rotate(wingFlap);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(b.size, -b.size * 1.2, b.size * 1.8, -b.size * 0.5, b.size, b.size * 0.2);
      ctx.bezierCurveTo(b.size * 0.8, b.size, b.size * 0.3, b.size * 0.6, 0, 0);
      ctx.closePath();

      const rightGradient = ctx.createLinearGradient(0, -b.size, b.size, b.size);
      rightGradient.addColorStop(0, "#FFF8D6");
      rightGradient.addColorStop(1, "#B89970");

      ctx.fillStyle = rightGradient;
      ctx.fill();

      ctx.restore();

      // Butterfly body
      ctx.shadowBlur = 5;
      ctx.fillStyle = "#FFF8D6";

      ctx.beginPath();
      ctx.ellipse(0, 0, 1.3, b.size * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const handleMouseMove = (event: MouseEvent) => {
      const now = performance.now();

      if (now - lastSpawn > 45) {
        createButterfly(event.clientX, event.clientY);
        lastSpawn = now;
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = butterflies.length - 1; i >= 0; i--) {
        const b = butterflies[i];

        b.x += b.vx;
        b.y += b.vy;

        b.vx *= 0.99;
        b.vy += 0.012;

        b.rotation += b.rotationSpeed;
        b.life -= 0.012;

        drawButterfly(b);

        if (b.life <= 0) {
          butterflies.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      butterflies.length = 0;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
}
