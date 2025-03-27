"use client"

import { useRef, useEffect } from "react"

interface GlitterParticle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string
  alpha: number
  decay: number
}

export function GlitterEffect({ duration = 1500 }: { duration?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", updateCanvasSize)
    updateCanvasSize()

    // Create particles
    const particles: GlitterParticle[] = []
    const colors = [
      "#FFD700", // Gold
      "#C0C0C0", // Silver
      "#B9F2FF", // Light blue
      "#FFFFFF", // White
      "#E6E6FA", // Lavender
      "#87CEFA", // Light sky blue
      "#40E0D0", // Turquoise
    ]

    const createParticles = () => {
      // Clear existing particles
      particles.length = 0

      // Create new particles
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const size = Math.random() * 3 + 1
        const speedX = (Math.random() - 0.5) * 2
        const speedY = (Math.random() - 0.5) * 2
        const color = colors[Math.floor(Math.random() * colors.length)]
        const alpha = Math.random() * 0.5 + 0.5
        const decay = 0.01 + Math.random() * 0.02

        particles.push({ x, y, size, speedX, speedY, color, alpha, decay })
      }
    }

    // Animation loop
    let animationId: number

    const animate = () => {
      // Clear canvas with a semi-transparent background to create trail effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Update position
        p.x += p.speedX
        p.y += p.speedY

        // Reduce alpha (fade out)
        p.alpha -= p.decay

        // Remove particles that are no longer visible
        if (p.alpha <= 0) {
          // Replace with a new particle
          const x = Math.random() * canvas.width
          const y = Math.random() * canvas.height
          const size = Math.random() * 3 + 1
          const speedX = (Math.random() - 0.5) * 2
          const speedY = (Math.random() - 0.5) * 2
          const color = colors[Math.floor(Math.random() * colors.length)]
          const alpha = Math.random() * 0.5 + 0.5
          const decay = 0.01 + Math.random() * 0.02

          particles[i] = { x, y, size, speedX, speedY, color, alpha, decay }
          continue
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()
        ctx.globalAlpha = 1
      }

      animationId = requestAnimationFrame(animate)
    }

    // Start animation
    createParticles()
    animationId = requestAnimationFrame(animate)

    // Stop animation after duration
    const timer = setTimeout(() => {
      cancelAnimationFrame(animationId)
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }, duration)

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateCanvasSize)
      cancelAnimationFrame(animationId)
      clearTimeout(timer)
    }
  }, [duration])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10 opacity-70" />
}

