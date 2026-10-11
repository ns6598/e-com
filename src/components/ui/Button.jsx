import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Editorial Luxury Button Component
 * Pure geometric precision, zero generic rounded pill styling, high tactile feedback
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
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-sans tracking-[0.18em] uppercase transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6D202D] focus-visible:ring-offset-2'

  const sizeStyles = {
    sm: 'text-[10px] px-4 py-2.5 gap-2',
    md: 'text-xs px-7 py-3.5 gap-2.5',
    lg: 'text-xs px-9 py-4 gap-3 font-semibold',
  }

  const variantStyles = {
    primary: 'bg-[#171717] text-[#F6F2EA] border border-[#171717] hover:bg-[#6D202D] hover:border-[#6D202D] hover:text-[#FFFFFF] active:bg-[#501620]',
    secondary: 'bg-transparent text-[#171717] border border-[#171717] hover:bg-[#171717] hover:text-[#F6F2EA] active:bg-[#2B2B2B]',
    oxblood: 'bg-[#6D202D] text-[#FFFFFF] border border-[#6D202D] hover:bg-[#171717] hover:border-[#171717] hover:text-[#F6F2EA] active:bg-[#501620]',
    stone: 'bg-[#D8D0C4] text-[#171717] border border-[#D8D0C4] hover:bg-[#171717] hover:border-[#171717] hover:text-[#F6F2EA]',
    text: 'bg-transparent text-[#171717] border-b border-[#171717] hover:border-[#6D202D] hover:text-[#6D202D] px-0 py-1 rounded-none tracking-[0.2em] gap-2',
    ghost: 'bg-transparent text-[#171717] hover:bg-[#171717]/5 active:bg-[#171717]/10',
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

  if (to) {
    return (
      <Link to={to} className={`group ${combinedClasses}`} {...props}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={`group ${combinedClasses}`} {...props}>
        {content}
      </a>
    )
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`group ${combinedClasses}`}
      {...props}
    >
      {content}
    </button>
  )
}
