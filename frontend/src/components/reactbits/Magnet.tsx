'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react'

interface MagnetProps {
  children: React.ReactNode
  className?: string
  strength?: number
  disabled?: boolean
}

/**
 * Magnetic pointer attraction wrapper (inspired by reactbits.dev Magnet).
 * Uses MotionValues outside React render cycle to avoid re-renders.
 */
export function Magnet({
  children,
  className = '',
  strength = 0.18,
  disabled = false,
}: MagnetProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const shouldReduceMotion = useReducedMotion()

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const x = useSpring(rawX, { stiffness: 260, damping: 20, mass: 0.4 })
  const y = useSpring(rawY, { stiffness: 260, damping: 20, mass: 0.4 })

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || shouldReduceMotion || e.pointerType === 'touch' || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const offsetX = (e.clientX - (rect.left + rect.width / 2)) * strength
    const offsetY = (e.clientY - (rect.top + rect.height / 2)) * strength
    rawX.set(offsetX)
    rawY.set(offsetY)
  }

  const handlePointerLeave = () => {
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      style={shouldReduceMotion || disabled ? undefined : { x, y }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={className}
    >
      {children}
    </motion.div>
  )
}

