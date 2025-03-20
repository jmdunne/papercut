"use client";

import { useEffect, useRef } from "react";

export function AnimatedGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Colors for the gradient
    const colors = [
      { r: 10, g: 10, b: 30 },
      { r: 30, g: 20, b: 60 },
      { r: 20, g: 40, b: 80 },
    ];

    // Gradient points
    const points = [
      { x: width * 0.1, y: height * 0.1, vx: 0.3, vy: 0.2 },
      { x: width * 0.8, y: height * 0.3, vx: -0.2, vy: 0.1 },
      { x: width * 0.5, y: height * 0.8, vx: 0.1, vy: -0.3 },
    ];

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Move points
      points.forEach((point, i) => {
        point.x += point.vx;
        point.y += point.vy;

        // Bounce off edges
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;
      });

      // Create gradient
      const gradient = ctx.createRadialGradient(
        points[0].x,
        points[0].y,
        0,
        points[1].x,
        points[1].y,
        width * 0.8
      );

      gradient.addColorStop(
        0,
        `rgba(${colors[0].r}, ${colors[0].g}, ${colors[0].b}, 0.5)`
      );
      gradient.addColorStop(
        0.5,
        `rgba(${colors[1].r}, ${colors[1].g}, ${colors[1].b}, 0.3)`
      );
      gradient.addColorStop(
        1,
        `rgba(${colors[2].r}, ${colors[2].g}, ${colors[2].b}, 0.2)`
      );

      // Fill background
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 opacity-60"
    />
  );
}
