import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import MagneticButton from '../motion/MagneticButton'

/**
 * Neo-Luxury Liquid Glass Button Component
 * Architectural cuts, gold gradient shimmer, frosted glass borders, magnetic hover & tactile micro-feedback
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  onClick,
  type = 'button',
  disabled = false,
  fullWidth = false,
  className = '',
  icon: Icon,
  iconPosition = 'right',
  magnetic = false,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-sans tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090D]'

  const sizeStyles = {
    sm: 'text-[10px] px-4 py-2.5 gap-2',
    md: 'text-xs px-6 py-3.5 gap-2.5 font-medium',
    lg: 'text-xs px-8 py-4 gap-3 font-semibold',
  }

  const variantStyles = {
    primary: 'gold-gradient-bg text-[#08090D] font-bold border border-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.45)] active:scale-[0.98]',
    secondary: 'glass-panel text-white border-white/20 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] active:scale-[0.98]',
    oxblood: 'bg-[#7E1828] text-white border border-[#A3283E]/50 hover:bg-[#A3283E] hover:shadow-[0_0_20px_rgba(163,40,62,0.35)] active:scale-[0.98]',
    glass: 'glass-panel-gold text-white border-[#D4AF37]/40 hover:border-[#D4AF37] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)]',
    stone: 'bg-white/10 text-white border border-white/20 hover:border-[#D4AF37] hover:text-[#D4AF37]',
    text: 'bg-transparent text-[#D4AF37] border-b border-[#D4AF37]/40 hover:border-[#D4AF37] hover:text-white px-0 py-1 rounded-none tracking-[0.22em] gap-2',
    ghost: 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5 active:bg-white/10',
  }

  const widthStyle = fullWidth ? 'w-full' : ''
  const combinedClasses = `${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${widthStyle} ${className}`

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon size={14} className="shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon size={14} className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" />}
    </>
  )

  const wrapWithMagnetic = (element) => {
    if (magnetic || variant === 'primary') {
      return <MagneticButton className={fullWidth ? 'w-full' : ''}>{element}</MagneticButton>
    }
    return element
  }

  if (to) {
    return wrapWithMagnetic(
      <Link to={to} className={`group ${combinedClasses}`} {...props}>
        {content}
      </Link>
    )
  }

  if (href) {
    return wrapWithMagnetic(
      <a href={href} className={`group ${combinedClasses}`} {...props}>
        {content}
      </a>
    )
  }

  return wrapWithMagnetic(
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group ${combinedClasses}`}
      {...props}
    >
      {content}
    </motion.button>
  )
}
