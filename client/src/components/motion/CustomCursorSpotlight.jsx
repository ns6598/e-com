import React, { useEffect, useState, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/**
 * Editorial Interactive Desktop Cursor
 * - 60fps hardware-accelerated motion using direct MotionValues & physics springs
 * - Zero React re-renders during mouse movements
 * - Dynamic context-aware states:
 *    * Normal: Minimalist dot with trailing precision ring
 *    * Interactive (buttons, links): Ring expands smoothly with electric lime accent
 *    * Product card: Shows dark alternative "VIEW" indicator
 *    * Campaign image: Shows "EXPLORE" indicator
 * - Completely disabled on mobile/touch devices and when prefers-reduced-motion is active
 * - Pointer-events: none ensures zero obstruction to clicks or accessibility
 */
export default function CustomCursorSpotlight() {
  const [isDesktopPointer, setIsDesktopPointer] = useState(false)
  const [cursorState, setCursorState] = useState({
    mode: 'default', // 'default' | 'interactive' | 'view' | 'explore'
    visible: false,
  })

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  // Direct fast spring for center dot
  const dotX = useSpring(mouseX, { damping: 30, stiffness: 450 })
  const dotY = useSpring(mouseY, { damping: 30, stiffness: 450 })

  // Fluid trailing spring for the outer ring / badge
  const ringX = useSpring(mouseX, { damping: 25, stiffness: 220, mass: 0.5 })
  const ringY = useSpring(mouseY, { damping: 25, stiffness: 220, mass: 0.5 })

  // Soft ambient dark alternative spotlight
  const glowX = useSpring(mouseX, { damping: 45, stiffness: 100, mass: 1.2 })
  const glowY = useSpring(mouseY, { damping: 45, stiffness: 100, mass: 1.2 })

  const stateRef = useRef(cursorState)
  stateRef.current = cursorState

  useEffect(() => {
    // Check if device supports fine pointer (mouse/trackpad) and reduced motion
    const pointerQuery = window.matchMedia('(pointer: fine)')
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const checkSupport = () => {
      setIsDesktopPointer(pointerQuery.matches && !reducedMotionQuery.matches)
    }

    checkSupport()
    pointerQuery.addEventListener('change', checkSupport)
    reducedMotionQuery.addEventListener('change', checkSupport)

    if (!pointerQuery.matches || reducedMotionQuery.matches) {
      return () => {
        pointerQuery.removeEventListener('change', checkSupport)
        reducedMotionQuery.removeEventListener('change', checkSupport)
      }
    }

    let lastTarget = null

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)

      // Only check DOM targets if target element changed to prevent redundant calculations
      if (e.target !== lastTarget) {
        lastTarget = e.target

        const cursorAttr = e.target.closest('[data-cursor]')
        const isInteractive = Boolean(e.target.closest('button, a, input, select, textarea, [role="button"]'))

        let newMode = 'default'
        if (cursorAttr) {
          const val = cursorAttr.getAttribute('data-cursor')
          newMode = val === 'explore' ? 'explore' : 'view'
        } else if (isInteractive) {
          newMode = 'interactive'
        }

        if (stateRef.current.mode !== newMode || !stateRef.current.visible) {
          setCursorState({ mode: newMode, visible: true })
        }
      } else if (!stateRef.current.visible) {
        setCursorState((prev) => ({ ...prev, visible: true }))
      }
    }

    const handleMouseLeave = () => {
      setCursorState((prev) => ({ ...prev, visible: false }))
    }

    const handleMouseEnter = () => {
      setCursorState((prev) => ({ ...prev, visible: true }))
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      pointerQuery.removeEventListener('change', checkSupport)
      reducedMotionQuery.removeEventListener('change', checkSupport)
    }
  }, [mouseX, mouseY])

  if (!isDesktopPointer || !cursorState.visible) return null

  const isView = cursorState.mode === 'view'
  const isExplore = cursorState.mode === 'explore'
  const isInteractive = cursorState.mode === 'interactive'

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {/* Ambient Dark Spotlight Glow */}
      <motion.div
        className="fixed top-0 left-0 w-80 h-80 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 pointer-events-none"
        style={{
          x: glowX,
          y: glowY,
          background: 'radial-gradient(circle, #B8FF00 0%, #8B0000 40%, transparent 70%)',
        }}
      />

      {/* Trailing Outer Ring / Badge */}
      <motion.div
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center pointer-events-none transition-colors duration-200"
        style={{
          x: ringX,
          y: ringY,
          width: isView || isExplore ? 68 : isInteractive ? 44 : 26,
          height: isView || isExplore ? 68 : isInteractive ? 44 : 26,
          backgroundColor: isView || isExplore ? '#171717' : 'transparent',
          borderWidth: isView || isExplore ? 1 : 1.5,
          borderColor: isView || isExplore ? '#B8FF00' : isInteractive ? '#B8FF00' : 'rgba(245, 245, 245, 0.35)',
          boxShadow: isView || isExplore ? '0 0 20px rgba(184, 255, 0, 0.25)' : 'none',
        }}
      >
        {(isView || isExplore) && (
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#B8FF00] font-bold select-none">
            {isView ? 'VIEW' : 'EXPLORE'}
          </span>
        )}
      </motion.div>

      {/* Center Precision Dot (hidden when in badge mode) */}
      {!isView && !isExplore && (
        <motion.div
          className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-transform duration-150"
          style={{
            x: dotX,
            y: dotY,
            width: isInteractive ? 6 : 4,
            height: isInteractive ? 6 : 4,
            backgroundColor: isInteractive ? '#B8FF00' : '#F5F5F5',
            boxShadow: isInteractive ? '0 0 8px #B8FF00' : 'none',
          }}
        />
      )}
    </div>
  )
}
