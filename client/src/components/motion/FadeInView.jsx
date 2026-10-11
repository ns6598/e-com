import React from 'react'
import { motion } from 'framer-motion'

/**
 * FadeInView
 * Viewport-triggered reveal with smooth spring easing.
 */
export default function FadeInView({
  children,
  direction = 'up', // 'up' | 'down' | 'left' | 'right' | 'none'
  delay = 0,
  duration = 0.6,
  className = '',
  threshold = 0.15,
  once = true,
  ...props
}) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { y: 32, x: 0 }
      case 'down':
        return { y: -32, x: 0 }
      case 'left':
        return { x: 32, y: 0 }
      case 'right':
        return { x: -32, y: 0 }
      case 'none':
      default:
        return { x: 0, y: 0 }
    }
  }

  const offset = getInitialPosition()

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: threshold }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
