'use client'

import { useEffect, useRef } from 'react'

interface DotGridProps {
  className?: string
  dotSize?: number
  gap?: number
  baseColor?: string
  activeColor?: string
  proximity?: number
}

/**
 * Interactive architectural dot matrix canvas (inspired by reactbits.dev DotGrid).
 * Reacts to pointer proximity without triggering React state re-renders.
 */
export function DotGrid({
  className = '',
  dotSize = 1.5,
  gap = 28,
  baseColor = 'rgba(244, 244, 245, 0.14)',
  activeColor = 'rgba(0, 230, 118, 0.65)',
  proximity = 130,
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let rafId = 0

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = parent.clientWidth
      height = parent.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      const cols = Math.floor(width / gap)
      const rows = Math.floor(height / gap)
      const offsetX = (width - cols * gap) / 2
      const offsetY = (height - rows * gap) / 2

      const { x: px, y: py, active } = pointerRef.current

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const x = offsetX + c * gap
          const y = offsetY + r * gap

          let radius = dotSize
          let color = baseColor

          if (active && !reducedMotion) {
            const dx = x - px
            const dy = y - py
            const dist = Math.hypot(dx, dy)

            if (dist < proximity) {
              const t = 1 - dist / proximity
              radius = dotSize + t * 1.8
              color = activeColor
              ctx.globalAlpha = 0.25 + t * 0.75
            } else {
              ctx.globalAlpha = 1
            }
          } else {
            ctx.globalAlpha = 1
          }

          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.globalAlpha = 1
    }

    const renderLoop = () => {
      draw()
      if (!reducedMotion && pointerRef.current.active) {
        rafId = requestAnimationFrame(renderLoop)
      }
    }

    resize()
    draw()

    const observer = new ResizeObserver(() => {
      resize()
      draw()
    })
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement)
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (reducedMotion) return
      const rect = canvas.getBoundingClientRect()
      pointerRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      }
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(renderLoop)
    }

    const handlePointerLeave = () => {
      pointerRef.current.active = false
      cancelAnimationFrame(rafId)
      draw()
    }

    const parent = canvas.parentElement
    parent?.addEventListener('pointermove', handlePointerMove, { passive: true })
    parent?.addEventListener('pointerleave', handlePointerLeave, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
      parent?.removeEventListener('pointermove', handlePointerMove)
      parent?.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [dotSize, gap, baseColor, activeColor, proximity])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  )
}

