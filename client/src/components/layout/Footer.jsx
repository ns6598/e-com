import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Shield, X, ArrowRight } from 'lucide-react'
import NewsletterForm from '../common/NewsletterForm'
import SizeChartModal from '../common/SizeChartModal'

function InstagramIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function TwitterXIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  )
}

function PinterestIcon({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="4" x2="12" y2="20" />
      <path d="M8 8a4 4 0 0 1 8 0c0 3-2 5-4 8" />
    </svg>
  )
}

export default function Footer() {
  const navigate = useNavigate()
  const [sizeChartOpen, setSizeChartOpen] = useState(false)

  // Hidden Vault Interaction State
  const [vaultModalOpen, setVaultModalOpen] = useState(false)
  const [isFlickering, setIsFlickering] = useState(false)
  const clickTimestampsRef = useRef([])
  const longPressTimerRef = useRef(null)
  const touchStartPosRef = useRef({ x: 0, y: 0 })

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Trigger the Vault Access discovery sequence
  const activateVaultAccess = useCallback(() => {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Visual flicker effect on the logo
    setIsFlickering(true)

    const flickerDuration = prefersReducedMotion ? 50 : 380
    setTimeout(() => {
      setIsFlickering(false)
      setVaultModalOpen(true)
    }, flickerDuration)
  }, [])

  // Desktop Interaction: 5 clicks within 3 seconds
  const handleLogoClick = (e) => {
    const now = Date.now()
    // Retain only timestamps from within the last 3000ms
    const recentClicks = clickTimestampsRef.current.filter((t) => now - t <= 3000)
    recentClicks.push(now)
    clickTimestampsRef.current = recentClicks

    if (recentClicks.length >= 5) {
      clickTimestampsRef.current = []
      activateVaultAccess()
    }
  }

  // Mobile Interaction: Long Press for 1.5 seconds
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return
    const touch = e.touches[0]
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY }

    longPressTimerRef.current = setTimeout(() => {
      activateVaultAccess()
    }, 1500)
  }

  const handleTouchMove = (e) => {
    if (!longPressTimerRef.current) return
    const touch = e.touches[0]
    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x)
    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y)
    // If movement exceeds 10px, assume regular scrolling and cancel long press
    if (dx > 10 || dy > 10) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const handleTouchCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setVaultModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <footer className="bg-[#090909] text-[#A6A6A6] pt-20 pb-8 mt-24 relative overflow-hidden border-t border-[#292929]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Newsletter & Brand Monograph Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#292929]">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-[10px] uppercase font-mono tracking-[0.28em] text-[#B8FF00] block">
              ENTER THE WORLD OF AUREVA
            </span>
            <h3 className="font-display font-extrabold text-3xl sm:text-4xl text-[#F5F5F5] uppercase leading-tight">
              BOLD TEXTURE. DARK ATTITUDE. YOUR STYLE.
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#A6A6A6] leading-relaxed max-w-md font-light">
              Receive secret archive releases, private drop alerts, and 15% courtesy applied on your inaugural piece with code <strong className="font-mono text-[#B8FF00]">AUREVA15</strong>.
            </p>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="bg-[#111111] p-4 border border-[#292929]">
              <NewsletterForm variant="dark" />
            </div>
            <p className="text-[10px] font-mono text-[#737373] mt-2 tracking-wider">
              15% courtesy applied on your inaugural piece with code AUREVA15.
            </p>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-b border-[#292929] text-xs">
          {/* Column 1: AUREVA Collections */}
          <div className="space-y-4">
            <h4 className="font-condensed text-[13px] uppercase tracking-[0.2em] text-[#F5F5F5] font-bold">
              SHOP
            </h4>
            <ul className="space-y-2.5 font-sans text-[#A6A6A6]">
              <li>
                <Link to="/shop?category=women" className="hover:text-[#B8FF00] transition-colors">
                  WOMEN'S APPAREL
                </Link>
              </li>
              <li>
                <Link to="/shop?category=men" className="hover:text-[#B8FF00] transition-colors">
                  MEN'S APPAREL
                </Link>
              </li>
              <li>
                <Link to="/shop?category=accessories" className="hover:text-[#B8FF00] transition-colors">
                  ACCESSORIES & BOOTS
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=newest" className="hover:text-[#B8FF00] transition-colors">
                  NEW ARRIVALS
                </Link>
              </li>
              <li>
                <Link to="/shop?filter=sale" className="text-[#B8FF00] hover:underline font-semibold">
                  SALE ARCHIVE
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Atelier & Ethos */}
          <div className="space-y-4">
            <h4 className="font-condensed text-[13px] uppercase tracking-[0.2em] text-[#F5F5F5] font-bold">
              ABOUT
            </h4>
            <ul className="space-y-2.5 font-sans text-[#A6A6A6]">
              <li>
                <Link to="/about" className="hover:text-[#B8FF00] transition-colors">
                  THE MANIFESTO
                </Link>
              </li>
              <li>
                <Link to="/about#provenance" className="hover:text-[#B8FF00] transition-colors">
                  MATERIAL PROVENANCE
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setSizeChartOpen(true)}
                  className="hover:text-[#B8FF00] transition-colors cursor-pointer text-left"
                >
                  SIZE GUIDE & MEASURES
                </button>
              </li>
              <li>
                <Link to="/about#sustainability" className="hover:text-[#B8FF00] transition-colors">
                  ETHICAL TEXTILES
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Concierge */}
          <div className="space-y-4">
            <h4 className="font-condensed text-[13px] uppercase tracking-[0.2em] text-[#F5F5F5] font-bold">
              CONCIERGE
            </h4>
            <ul className="space-y-2.5 font-sans text-[#A6A6A6]">
              <li>
                <Link to="/contact" className="hover:text-[#B8FF00] transition-colors">
                  CONTACT AUREVA
                </Link>
              </li>
              <li>
                <Link to="/contact#faq" className="hover:text-[#B8FF00] transition-colors">
                  FREQUENT QUESTIONS
                </Link>
              </li>
              <li>
                <Link to="/contact#shipping" className="hover:text-[#B8FF00] transition-colors">
                  SHIPPING & COURIER
                </Link>
              </li>
              <li>
                <Link to="/contact#returns" className="hover:text-[#B8FF00] transition-colors">
                  RETURNS & EXCHANGES
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Social */}
          <div className="space-y-4">
            <h4 className="font-condensed text-[13px] uppercase tracking-[0.2em] text-[#F5F5F5] font-bold">
              LEGAL & SOCIAL
            </h4>
            <ul className="space-y-2.5 font-sans text-[#A6A6A6]">
              <li>
                <Link to="/about#privacy" className="hover:text-[#B8FF00] transition-colors">
                  PRIVACY POLICY
                </Link>
              </li>
              <li>
                <Link to="/about#terms" className="hover:text-[#B8FF00] transition-colors">
                  TERMS OF SERVICE
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="hover:text-[#B8FF00] transition-colors cursor-pointer text-left block font-mono"
                >
                  RETURN TO TOP ↑
                </button>
              </li>
            </ul>

            <div className="pt-2 flex items-center space-x-4 text-[#A6A6A6]">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-[#B8FF00] transition-colors"
              >
                <InstagramIcon size={16} />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="hover:text-[#B8FF00] transition-colors"
              >
                <PinterestIcon size={16} />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="hover:text-[#B8FF00] transition-colors"
              >
                <TwitterXIcon size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Central Brand Mark with Hidden Interaction Trigger */}
        <div className="py-8 flex flex-col items-center justify-center border-b border-[#292929]">
          <div
            id="aureva-footer-logo"
            role="button"
            tabIndex={0}
            onClick={handleLogoClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            className={`inline-flex items-center gap-2 select-none cursor-pointer px-4 py-2 transition-all duration-300 relative rounded-sm ${
              isFlickering
                ? 'opacity-80 scale-105 filter drop-shadow-[0_0_12px_rgba(184,255,0,0.6)] animate-pulse'
                : 'hover:opacity-95'
            }`}
            title="AUREVA Maison"
            aria-label="AUREVA Brand Seal"
          >
            <span className="font-display font-extrabold text-2xl tracking-[-0.04em] text-[#F5F5F5]">
              AUREVA
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full bg-[#B8FF00] inline-block transition-transform duration-300 ${
                isFlickering ? 'scale-150 shadow-[0_0_12px_#B8FF00]' : 'shadow-[0_0_8px_#B8FF00]'
              }`}
            />
          </div>
          <p className="text-[10px] tracking-[0.28em] uppercase text-[#737373] font-mono mt-1">
            HAUTE COUTURE ARCHIVE • PARIS
          </p>
        </div>

        {/* Bottom Bar: Copyright & Location */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] tracking-[0.22em] uppercase text-[#737373] font-mono">
          <p>© MMXXVI AUREVA STUDIOS LTD. ALL RIGHTS RESERVED.</p>
          <p>PARIS • BERLIN • TOKYO • NEW YORK</p>
        </div>
      </div>

      {/* Monumental Oversized AUREVA Wordmark Watermark (also accepts clicks & long-press) */}
      <div
        id="aureva-footer-watermark"
        onClick={handleLogoClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        role="presentation"
        className={`w-full select-none cursor-pointer overflow-hidden text-center mt-12 sm:mt-16 transition-opacity duration-500 -mb-4 sm:-mb-8 ${
          isFlickering ? 'opacity-20 animate-pulse text-[#B8FF00]' : 'opacity-[0.04] hover:opacity-[0.07]'
        }`}
      >
        <span className="font-display font-extrabold text-[18vw] tracking-[0.2em] text-[#F5F5F5] leading-none inline-block whitespace-nowrap">
          AUREVA
        </span>
      </div>

      {/* Elegant Hidden Vault Access Modal / Reveal Overlay */}
      {vaultModalOpen && (
        <div
          id="vault-access-overlay"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vault-access-title"
        >
          <div className="relative w-full max-w-md bg-[#0D0D0D] border border-[#292929] p-8 shadow-2xl text-center space-y-6">
            {/* Dismiss Button */}
            <button
              onClick={() => setVaultModalOpen(false)}
              className="absolute top-4 right-4 text-[#737373] hover:text-[#F5F5F5] transition-colors p-1 cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Emblem */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#292929] text-[#B8FF00]">
              <Shield size={22} />
            </div>

            {/* Subtle Elegant Transition Display */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono tracking-[0.35em] uppercase text-[#B8FF00] font-semibold block animate-pulse">
                VAULT ACCESS
              </span>
              <h2 id="vault-access-title" className="font-display font-extrabold text-2xl text-[#F5F5F5] uppercase tracking-wide">
                ENTER THE AUREVA VAULT
              </h2>
              <p className="text-xs text-[#A6A6A6] font-mono leading-relaxed">
                Restricted administrative protocol initialized. Authorized personnel only.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-3">
              <button
                id="enter-vault-button"
                onClick={() => {
                  setVaultModalOpen(false)
                  navigate('/vault')
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#B8FF00] hover:bg-[#a6e600] text-[#090909] font-mono font-bold text-xs uppercase tracking-[0.2em] py-3.5 px-6 transition-colors shadow-lg cursor-pointer"
              >
                ENTER THE AUREVA VAULT →
              </button>

              <button
                onClick={() => setVaultModalOpen(false)}
                className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#737373] hover:text-[#A6A6A6] py-1 transition-colors cursor-pointer"
              >
                RETURN TO STOREFRONT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Size Chart Modal */}
      <SizeChartModal isOpen={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
    </footer>
  )
}

