import React, { useRef, useState, useEffect } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'

/**
 * TiltCard
 * Provides a subtle 3D tilt perspective on desktop hover.
 * Calibrated with low angles (max 6-8 deg) for a high-end luxury feel.
 */
export default function TiltCard({
  children,
  maxTilt = 7,
  scaleOnHover = 1.02,
  className = '',
  glare = true,
  ...props
}) {
  const ref = useRef(null)
  const [canHover, setCanHover] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const rawRotateX = useMotionValue(0)
  const rawRotateY = useMotionValue(0)
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)

  const rotateX = useSpring(rawRotateX, { damping: 20, stiffness: 200 })
  const rotateY = useSpring(rawRotateY, { damping: 20, stiffness: 200 })

  useEffect(() => {
    const media = window.matchMedia('(pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    setCanHover(media.matches && !reduced.matches)

    const update = () => setCanHover(media.matches && !reduced.matches)
    media.addEventListener('change', update)
    reduced.addEventListener('change', update)
    return () => {
      media.removeEventListener('change', update)
      reduced.removeEventListener('change', update)
    }
  }, [])

  const handleMouseMove = (e) => {
    if (!canHover || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const tiltX = -((y - centerY) / centerY) * maxTilt
    const tiltY = ((x - centerX) / centerX) * maxTilt

    rawRotateX.set(tiltX)
    rawRotateY.set(tiltY)

    if (glare) {
      glareX.set((x / rect.width) * 100)
      glareY.set((y / rect.height) * 100)
    }
  }

  const handleMouseEnter = () => {
    if (canHover) setIsHovered(true)
  }

  const handleMouseLeave = () => {
    rawRotateX.set(0)
    rawRotateY.set(0)
    setIsHovered(false)
  }

  if (!canHover) {
    return <div className={className} {...props}>{children}</div>
  }

  return (
    <div
      style={{ perspective: 1000 }}
      className="inline-block w-full"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: isHovered ? scaleOnHover : 1,
        }}
        transition={{ duration: 0.3 }}
        className={`relative ${className}`}
        {...props}
      >
        {children}

        {/* Subtle Specular Sheen Glare */}
        {glare && isHovered && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30 opacity-20 mix-blend-overlay transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${glareX.get()}% ${glareY.get()}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  )
}
