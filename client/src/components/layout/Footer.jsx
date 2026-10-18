import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
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
  const [sizeChartOpen, setSizeChartOpen] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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

        {/* Bottom Bar: Copyright & Location */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] tracking-[0.22em] uppercase text-[#737373] font-mono">
          <p>© MMXXVI AUREVA STUDIOS LTD. ALL RIGHTS RESERVED.</p>
          <p>PARIS • BERLIN • TOKYO • NEW YORK</p>
        </div>
      </div>

      {/* Monumental Oversized AUREVA Wordmark Watermark */}
      <div
        aria-hidden="true"
        className="w-full select-none pointer-events-none overflow-hidden text-center mt-12 sm:mt-16 opacity-[0.04] -mb-4 sm:-mb-8"
      >
        <span className="font-display font-extrabold text-[18vw] tracking-[0.2em] text-[#F5F5F5] leading-none inline-block whitespace-nowrap">
          AUREVA
        </span>
      </div>

      {/* Persistent Size Chart Modal */}
      <SizeChartModal isOpen={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
    </footer>
  )
}
