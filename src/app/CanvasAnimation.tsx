"use client";

import { useEffect, useRef } from "react";

export default function CanvasAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const lineWeight = 40;
    const lines = 15;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const quadraticCurve = (
      p1x: number,
      p1y: number,
      p2x: number,
      p2y: number,
      p3x: number,
      p3y: number,
      color: string
    ) => {
      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.quadraticCurveTo(p2x, p2y, p3x, p3y);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWeight;
      ctx.stroke();
    };

    let frameCount = 0;
    const animate = () => {
      frameCount++;
      // Skip every other frame for 30fps to reduce CPU load
      if (frameCount % 2 === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      timeRef.current += 0.4;
      const time = timeRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // Clear with black background
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillRect(0, 0, width, height);

      // Set blend mode to screen for the neon effect
      ctx.globalCompositeOperation = "screen";

      for (let i = 0; i < lines; i++) {
        const t = i / lines;
        // Blend original colors with lime green (#7dff00)
        const r = Math.floor(150 + 105 * Math.sin(0.4 + -i * 0.1 + time * 0.05) + 50 * t);
        const g = Math.floor(180 + 75 * Math.sin(i * 0.1 + time * 0.1) + 77 * (1 - t));
        const b = Math.floor(100 + 55 * Math.sin(time * 0.1) + 50 * t);
        const a = 100 * Math.sin((Math.PI * i) / lines);

        const p1x = -i - 1 * i * Math.cos(time * 0.05);
        const p1y =
          height * 0.5 -
          10 * Math.pow((height * (i + 3)) / lines, 0.5) +
          2 *
            Math.pow(
              (height * 0.5 * (lines - i)) / lines,
              Math.sin((time - 20) * 0.02 + 0.2)
            );

        const p2x = width / 2 + width * (0.4 * Math.cos(i * 0.01 + time * 0.05));
        const p2y =
          height * (0.5 + 0.5 * Math.sin(Math.PI * 0.5 + (i * Math.PI) / lines)) -
          500 * Math.pow(Math.sin(i / lines + Math.PI), 6) +
          2 *
            Math.pow(
              (height * 0.5 * (lines - i)) / lines,
              Math.sin((time - 15) * 0.02 + 0.2)
            );

        const p3x = width + 5 + 5 * Math.sin(time * 0.02 - Math.PI * 0.4);
        const p3y =
          height * 1 -
          Math.pow(
            (height * (i + lines * 0.2)) / lines,
            0.7 + 0.3 * Math.sin(time * 0.03 + 0.3)
          );

        quadraticCurve(
          p1x,
          p1y,
          p2x,
          p2y,
          p3x,
          p3y,
          `rgba(${r}, ${g}, ${b}, ${a / 255})`
        );
      }

      // Reset composite operation
      ctx.globalCompositeOperation = "source-over";

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: 0, willChange: "transform", transform: "translateZ(0)" }}
    />
  );
}
