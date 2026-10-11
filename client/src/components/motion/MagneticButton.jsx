import React, { useRef, useState, useEffect } from 'react'
import { motion, useSpring } from 'framer-motion'

/**
 * MagneticButton
 * Adds a restrained physics pull towards the mouse pointer.
 * Gracefully disables on touch devices and for users with prefers-reduced-motion.
 */
export default function MagneticButton({
  children,
  strength = 0.25,
  maxDisplacement = 12,
  className = '',
  ...props
}) {
  const ref = useRef(null)
  const [canHover, setCanHover] = useState(false)

  const x = useSpring(0, { stiffness: 180, damping: 18, mass: 0.5 })
  const y = useSpring(0, { stiffness: 180, damping: 18, mass: 0.5 })

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
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const distanceX = (e.clientX - centerX) * strength
    const distanceY = (e.clientY - centerY) * strength

    // Clamp within maxDisplacement
    const clampedX = Math.max(-maxDisplacement, Math.min(maxDisplacement, distanceX))
    const clampedY = Math.max(-maxDisplacement, Math.min(maxDisplacement, distanceY))

    x.set(clampedX)
    y.set(clampedY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  if (!canHover) {
    return <div className={className} {...props}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className={`inline-block ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
