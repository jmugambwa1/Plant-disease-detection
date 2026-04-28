"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface Beam {
  x: number;
  y: number;
  width: number;
  speed: number;
  opacity: number;
  hue: number;
  length: number;
}

function createBeam(width: number, height: number): Beam {
  return {
    x: Math.random() * width,
    y: 0,
    width: Math.random() * 2 + 1,
    speed: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.6 + 0.3,
    hue: Math.random() * 60 + 140,
    length: Math.random() * height * 0.6 + height * 0.2,
  };
}

export interface BeamsBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  intensity?: "subtle" | "medium" | "strong";
}

export function BeamsBackground({
  className,
  children,
  intensity = "medium",
}: BeamsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const animRef = useRef<number>(0);

  const beamCount = intensity === "subtle" ? 8 : intensity === "strong" ? 24 : 16;
  const opacityScale = intensity === "subtle" ? 0.6 : intensity === "strong" ? 1.0 : 0.8;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      beamsRef.current = Array.from({ length: beamCount }, () =>
        createBeam(canvas.width, canvas.height)
      );
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      beamsRef.current.forEach((beam) => {
        beam.y += beam.speed;
        if (beam.y > canvas.height) {
          beam.y = -beam.length;
          beam.x = Math.random() * canvas.width;
          beam.hue = Math.random() * 60 + 140;
        }

        const gradient = ctx.createLinearGradient(beam.x, beam.y, beam.x, beam.y + beam.length);
        gradient.addColorStop(0, `hsla(${beam.hue}, 80%, 70%, 0)`);
        gradient.addColorStop(
          0.4,
          `hsla(${beam.hue}, 80%, 70%, ${beam.opacity * opacityScale})`
        );
        gradient.addColorStop(1, `hsla(${beam.hue}, 80%, 70%, 0)`);

        ctx.save();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = beam.width;
        ctx.shadowColor = `hsl(${beam.hue}, 80%, 70%)`;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(beam.x, beam.y);
        ctx.lineTo(beam.x, beam.y + beam.length);
        ctx.stroke();
        ctx.restore();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [beamCount, opacityScale]);

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-neutral-950", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,200,160,0.15), transparent)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />
      {children && <div className="relative z-10 h-full">{children}</div>}
    </div>
  );
}
