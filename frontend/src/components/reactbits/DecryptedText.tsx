'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

interface DecryptedTextProps {
  text: string
  className?: string
  speed?: number
  triggerOnHover?: boolean
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/**
 * Character-scramble reveal (inspired by reactbits.dev DecryptedText).
 * Honors prefers-reduced-motion and cleans up intervals on unmount.
 */
export function DecryptedText({
  text,
  className = '',
  speed = 28,
  triggerOnHover = true,
}: DecryptedTextProps) {
  const shouldReduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(text)
  const [runId, setRunId] = useState(0)

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplay(text)
      return
    }

    let iteration = 0
    const interval = window.setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' '
            if (index < iteration) return text[index]
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          })
          .join('')
      )

      iteration += 0.5
      if (iteration >= text.length) {
        window.clearInterval(interval)
        setDisplay(text)
      }
    }, speed)

    return () => window.clearInterval(interval)
  }, [text, speed, runId, shouldReduceMotion])

  return (
    <span
      className={className}
      onMouseEnter={triggerOnHover && !shouldReduceMotion ? () => setRunId((n) => n + 1) : undefined}
    >
      {display}
    </span>
  )
}

