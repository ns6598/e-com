import React from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'

/**
 * ScrollProgress
 * Pinned gold hairline indicator tracking viewport scroll progress.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 h-[2px] origin-left bg-gradient-to-r from-[#D4AF37] via-[#FFF3CC] to-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)] pointer-events-none"
      style={{ scaleX }}
    />
  )
}
