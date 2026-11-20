'use client'

import { motion, useReducedMotion } from 'motion/react'

interface MotionSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

/**
 * Isolated client leaf for subtle, GPU-accelerated architectural entrance motion.
 * Honors prefers-reduced-motion.
 */
export function MotionSection({
  children,
  className = '',
  delay = 0,
}: MotionSectionProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay, ease: EASE_OUT_EXPO }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

