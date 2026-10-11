import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Editorial Ambient Spotlight & Context-Aware Cursor
 * - Smooth hardware-accelerated spring cursor (zero React re-renders on mousemove)
 * - Subtle ambient golden spotlight following the pointer
 * - Expands into an editorial badge only over elements marked with data-cursor="explore" | "view" | "drag"
 * - Completely inactive on touch devices and respects prefers-reduced-motion
 */
export default function CustomCursorSpotlight() {
  const [isPointerFine, setIsPointerFine] = useState(false)
  const [cursorMode, setCursorMode] = useState(null) // null | 'explore' | 'view' | 'drag'
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Direct MotionValues for 60fps performance
  const mouseX = useMotionValue(-500)
  const mouseY = useMotionValue(-500)

  // Spring physics for luxurious liquid drag
  const smoothX = useSpring(mouseX, { damping: 28, stiffness: 220, mass: 0.6 })
  const smoothY = useSpring(mouseY, { damping: 28, stiffness: 220, mass: 0.6 })

  // Slower ambient spotlight spring
  const glowX = useSpring(mouseX, { damping: 40, stiffness: 120, mass: 1.2 })
  const glowY = useSpring(mouseY, { damping: 40, stiffness: 120, mass: 1.2 })

  useEffect(() => {
    // Only enable on desktop pointer devices
    const mediaQuery = window.matchMedia('(pointer: fine)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const checkDevice = () => {
      setIsPointerFine(mediaQuery.matches && !reducedMotionQuery.matches)
    }

    checkDevice()
    mediaQuery.addEventListener('change', checkDevice)
    reducedMotionQuery.addEventListener('change', checkDevice)

    if (!mediaQuery.matches || reducedMotionQuery.matches) {
      return () => {
        mediaQuery.removeEventListener('change', checkDevice)
        reducedMotionQuery.removeEventListener('change', checkDevice)
      }
    }

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      if (!isVisible) setIsVisible(true)

      // Check if hovering an editorial zone with data-cursor attribute
      const target = e.target.closest('[data-cursor]')
      if (target) {
        const mode = target.getAttribute('data-cursor')
        setCursorMode(mode || 'explore')
      } else {
        setCursorMode(null)
      }

      // Check if hovering interactive controls (buttons, links) for magnetic hint
      const interactive = e.target.closest('button, a, input, select, textarea, [role="button"]')
      setIsHoveringInteractive(Boolean(interactive))
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      mediaQuery.removeEventListener('change', checkDevice)
      reducedMotionQuery.removeEventListener('change', checkDevice)
    }
  }, [mouseX, mouseY, isVisible])

  if (!isPointerFine) return null

  return (
    <>
      {/* 1. Ambient Pointer Spotlight (Atmospheric, non-intrusive) */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-0 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35"
        style={{
          x: glowX,
          y: glowY,
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, rgba(126, 24, 40, 0.04) 40%, transparent 70%)',
          filter: 'blur(40px)',
          display: isVisible ? 'block' : 'none',
        }}
      />

      {/* 2. Custom Editorial Cursor (Appears only on data-cursor editorial areas) */}
      {cursorMode && isVisible && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 z-50 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
          style={{
            x: smoothX,
            y: smoothY,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#D4AF37]/80 bg-[#08090D]/80 backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.35)]">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
              {cursorMode === 'view' ? 'VIEW' : cursorMode === 'drag' ? 'DRAG' : 'EXPLORE'}
            </span>
            <div className="absolute -inset-1 rounded-full border border-[#D4AF37]/20 animate-ping opacity-30" />
          </div>
        </motion.div>
      )}

      {/* 3. Subtle floating trailing dot for editorial rhythm */}
      {isVisible && !cursorMode && !isHoveringInteractive && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 z-40 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D4AF37]/50 mix-blend-screen"
          style={{
            x: smoothX,
            y: smoothY,
          }}
          transition={{ duration: 0.1 }}
        />
      )}
    </>
  )
}
