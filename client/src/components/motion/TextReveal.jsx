import React from 'react'
import { motion } from 'framer-motion'

/**
 * TextReveal
 * Renders text with staggered word reveals and smooth mask clip for editorial headings.
 */
export default function TextReveal({
  text,
  className = '',
  delay = 0,
  stagger = 0.04,
  as: Component = 'span',
  once = true,
}) {
  const words = text.split(' ')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  }

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 35,
      transition: {
        type: 'spring',
        damping: 18,
        stiffness: 140,
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 18,
        stiffness: 140,
      },
    },
  }

  return (
    <Component className={`inline-block ${className}`}>
      <motion.span
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: '-40px' }}
        className="inline-flex flex-wrap gap-x-[0.28em]"
      >
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden py-1">
            <motion.span variants={wordVariants} className="inline-block">
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Component>
  )
}
