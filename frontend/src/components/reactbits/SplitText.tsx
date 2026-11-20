'use client'

import { motion, useReducedMotion } from 'motion/react'

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  stagger?: number
  duration?: number
}

/**
 * Masked word-by-word kinetic reveal (inspired by reactbits.dev SplitText
 * and Preymaker-style mask transitions).
 */
export function SplitText({
  text,
  className = '',
  delay = 0,
  stagger = 0.055,
  duration = 0.72,
}: SplitTextProps) {
  const shouldReduceMotion = useReducedMotion()
  const words = text.split(' ')

  if (shouldReduceMotion) {
    return <span className={className}>{text}</span>
  }

  return (
    <span className={`inline-flex flex-wrap gap-x-[0.26em] ${className}`}>
      {words.map((word, idx) => (
        <span
          key={`${word}-${idx}`}
          className="inline-block overflow-hidden px-[0.08em] -mx-[0.08em] pt-[0.06em] -mt-[0.06em] pb-[0.12em] -mb-[0.12em] align-bottom"
        >
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: '112%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{
              duration,
              delay: delay + idx * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

