import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Music, Sparkles } from 'lucide-react'
import NewsletterForm from '../common/NewsletterForm'

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
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-[#05060A] text-gray-300 border-t border-white/10 pt-20 pb-12 mt-28 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section: Wordmark, Philosophy & Social Icons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Brand Identity Column */}
          <div className="lg:col-span-7 space-y-6">
            <Link to="/" className="inline-block group">
              <span className="font-serif text-3xl sm:text-4xl tracking-[0.24em] font-light text-white group-hover:text-[#D4AF37] transition-colors block">
                AUREVA
              </span>
              <span className="text-[9px] uppercase tracking-[0.34em] text-[#D4AF37] block mt-1 font-mono">
                Style Without Boundaries • Paris / Tokyo / New York
              </span>
            </Link>
            <p className="font-serif text-lg sm:text-xl text-gray-400 font-light leading-relaxed max-w-xl">
              "We reject ephemeral trend cycles in pursuit of monumental silhouettes, deliberate drape, and garments engineered to outlive the season."
            </p>

            {/* Social Icons */}
            <div className="pt-2 flex items-center space-x-6 text-gray-400">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AUREVA Instagram Studio Archives (Demo Link)"
                className="hover:text-[#D4AF37] transition-colors p-1 -m-1"
                title="Instagram Archives (Demo Link)"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AUREVA Pinterest Moodboards (Demo Link)"
                className="hover:text-[#D4AF37] transition-colors p-1 -m-1"
                title="Pinterest Moodboards (Demo Link)"
              >
                <PinterestIcon size={18} />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AUREVA X Dispatch (Demo Link)"
                className="hover:text-[#D4AF37] transition-colors p-1 -m-1"
                title="Twitter / X Dispatch (Demo Link)"
              >
                <TwitterXIcon size={18} />
              </a>
              <a
                href="https://spotify.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AUREVA Runway Soundscape Playlist (Demo Link)"
                className="hover:text-[#D4AF37] transition-colors p-1 -m-1"
                title="Atelier Soundscape (Demo Link)"
              >
                <Music size={18} />
              </a>
            </div>
          </div>

          {/* Atelier Contact & Physical Coordinates Column */}
          <div className="lg:col-span-5 space-y-6 lg:pl-8">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#D4AF37]">
              Studio & Concierge
            </h3>
            <div className="space-y-3 text-xs text-gray-300">
              <p>
                <strong className="text-white block font-sans uppercase tracking-wider text-[10px]">Head Atelier Paris:</strong>
                14 Rue de la Paix, 75002 Paris, France
              </p>
              <p>
                <strong className="text-white block font-sans uppercase tracking-wider text-[10px]">Concierge Service:</strong>
                <a href="mailto:concierge@aureva-studios.demo" className="hover:text-[#D4AF37] underline transition-colors">
                  concierge@aureva-studios.demo
                </a>
                <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-mono mt-0.5">
                  [ATELIER PRIVATE SALON DISPATCH]
                </span>
              </p>
              <p>
                <strong className="text-white block font-sans uppercase tracking-wider text-[10px]">Salon Direct Line:</strong>
                <span className="text-gray-400 font-mono">+33 (0)1 42 68 55 00</span>
              </p>
            </div>
            <div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-[#D4AF37] hover:text-white border-b border-[#D4AF37]/50 hover:border-white pb-0.5 transition-colors"
              >
                <span>Book A Private Salon Fitting</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter Dispatch Banner in Liquid Glass */}
        <div className="py-12 border-b border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-2">
            <span className="tag-overline text-[#D4AF37]">ATELIER DISPATCH</span>
            <h3 className="font-serif text-2xl sm:text-3xl text-white">
              Receive Private Monograph Allocations
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-sans max-w-lg">
              Subscribe for advance previews of seasonal drops and private salon allocations. Enjoy 15% courtesy with code AUREVA15.
            </p>
          </div>
          <div className="lg:col-span-6 lg:pl-8">
            <div className="glass-panel p-2 rounded-xs border-white/10">
              <NewsletterForm variant="dark" />
            </div>
          </div>
        </div>

        {/* Middle Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-14 border-b border-white/10 text-xs">
          {/* Column 1: Navigation */}
          <div className="space-y-4">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#D4AF37]">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-gray-400">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  Shop All Silhouettes
                </Link>
              </li>
              <li>
                <Link to="/shop?filter=collections" className="hover:text-white transition-colors">
                  Runway Lookbook
                </Link>
              </li>
              <li>
                <Link to="/shop?filter=new" className="hover:text-white transition-colors">
                  New Arrivals (Drop 02)
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Our Story & Manifesto
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Categories */}
          <div className="space-y-4">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#D4AF37]">
              Categories
            </h4>
            <ul className="space-y-2.5 text-gray-400">
              <li>
                <Link to="/shop?category=Women" className="hover:text-white transition-colors">
                  Women Ready-to-Wear
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Men" className="hover:text-white transition-colors">
                  Men Ready-to-Wear
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Accessories" className="hover:text-white transition-colors">
                  Leather Objects & Accessories
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Outerwear" className="hover:text-white transition-colors">
                  Sculptural Outerwear
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Client Care */}
          <div className="space-y-4">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#D4AF37]">
              Client Care
            </h4>
            <ul className="space-y-2.5 text-gray-400">
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Private Salon Inquiries
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Bespoke Sizing Consultation
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Worldwide Shipping & Duties
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Complimentary Returns Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Client Services */}
          <div className="space-y-4">
            <h4 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#D4AF37]">
              Orders & Bag
            </h4>
            <ul className="space-y-2.5 text-gray-400">
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Review Shopping Bag
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="hover:text-white transition-colors">
                  Express Checkout
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="hover:text-[#D4AF37] transition-colors text-left cursor-pointer"
                >
                  Return to Top ↑
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Currencies & Studio Mark */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] tracking-[0.18em] uppercase text-gray-500 font-mono">
          <p>© 2026 AUREVA STUDIOS LTD. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-6">
            <span>CURRENCY: INR (₹)</span>
            <span>SHIPPING: WORLDWIDE</span>
            <span className="text-[#D4AF37] font-semibold">NEO-LUXURY NOIR EDIT</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
