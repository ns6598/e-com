import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingBag, Heart, Menu, X, Search, Check, Copy } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import WishlistDrawer from '../wishlist/WishlistDrawer'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const searchInputRef = useRef(null)

  const { openCart, totalItems } = useCart()
  const { totalWishlist } = useWishlist()

  const isHomePage = location.pathname === '/'

  // Track scroll state for refined header elevation and overlay transitions
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile drawer & search on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  // Focus search input when search bar opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  const handleCopyLaunchCode = (e) => {
    e.preventDefault()
    if (navigator.clipboard) {
      navigator.clipboard.writeText('AUREVA15')
    }
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2500)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const navLinks = [
    { label: 'Shop', to: '/shop' },
    { label: 'Collections', to: '/shop?filter=collections' },
    { label: 'New Arrivals', to: '/shop?filter=new' },
    { label: 'Our Story', to: '/about' },
    { label: 'Concierge', to: '/contact' },
  ]

  return (
    <>
      {/* Editorial Announcement Bar with Tasteful Launch Offer */}
      <aside aria-label="Announcement" className="bg-[#171717] text-[#F6F2EA] text-[10px] tracking-[0.24em] uppercase py-2.5 px-4 text-center border-b border-[#171717] z-50 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between sm:justify-center gap-4 sm:gap-8">
          <span className="hidden lg:inline opacity-60">PARIS • MILAN • TOKYO</span>
          <div className="flex items-center gap-2">
            <span>INAUGURAL LAUNCH: 15% COURTESY WITH CODE</span>
            <button
              type="button"
              onClick={handleCopyLaunchCode}
              title="Click to copy code"
              className="inline-flex items-center gap-1 font-mono font-bold bg-[#6D202D] text-white px-2 py-0.5 tracking-wider hover:bg-[#8B2C3C] transition-colors cursor-pointer"
            >
              <span>AUREVA15</span>
              {copiedCode ? <Check size={11} className="text-emerald-300" /> : <Copy size={10} />}
            </button>
            {copiedCode && (
              <span className="text-emerald-300 font-mono text-[9px] tracking-widest hidden sm:inline">
                [COPIED]
              </span>
            )}
          </div>
          <span className="hidden sm:inline opacity-60">COMPLIMENTARY WORLDWIDE COURIER</span>
        </div>
      </aside>

      {/* Main Persistent Header with Adaptive Hero Overlay & Elevation */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#F6F2EA]/95 backdrop-blur-md shadow-xs border-b border-[#171717]/10 py-3.5'
            : isHomePage
            ? 'bg-[#F6F2EA]/90 backdrop-blur-xs border-b border-[#171717]/10 py-4.5'
            : 'bg-[#F6F2EA] border-b border-[#171717]/10 py-4.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left Nav (Desktop) */}
            <nav className="hidden md:flex items-center space-x-7 lg:space-x-9" aria-label="Primary Navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-xs uppercase tracking-[0.2em] font-medium transition-colors relative py-1 hover:text-[#6D202D] ${
                      isActive && !link.to.includes('?') ? 'text-[#6D202D] font-semibold' : 'text-[#171717]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && !link.to.includes('?') && (
                        <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#6D202D]" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#171717] hover:text-[#6D202D] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6D202D] cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Minimal AUREVA Wordmark */}
            <div className="text-center">
              <Link
                to="/"
                className="group inline-flex flex-col items-center focus-visible:outline-none select-none"
              >
                <span className="font-serif text-2xl sm:text-3xl lg:text-4xl tracking-[0.24em] font-light text-[#171717] group-hover:text-[#6D202D] transition-colors">
                  AUREVA
                </span>
                <span className="text-[8px] uppercase tracking-[0.38em] text-[#171717]/60 -mt-0.5">
                  Style Without Boundaries
                </span>
              </Link>
            </div>

            {/* Right Action Icons: Search, Wishlist, Shopping Bag */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Quick Search Toggle */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Toggle search catalog"
                className={`p-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6D202D] ${
                  searchOpen ? 'text-[#6D202D]' : 'text-[#171717] hover:text-[#6D202D]'
                }`}
                title="Search collection"
              >
                <Search size={18} />
              </button>

              {/* Wishlist Icon */}
              <button
                type="button"
                onClick={() => setWishlistOpen(true)}
                aria-label={`Open wishlist with ${totalWishlist} saved items`}
                className="relative p-2 text-[#171717] hover:text-[#6D202D] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6D202D] cursor-pointer"
              >
                <Heart size={18} />
                {totalWishlist > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#6D202D] text-[9px] font-bold text-white shadow-xs">
                    {totalWishlist}
                  </span>
                )}
              </button>

              {/* Shopping Bag Drawer Trigger with Small Dynamic Item Count */}
              <button
                type="button"
                onClick={openCart}
                aria-label={`Open shopping bag with ${totalItems} items`}
                className="relative p-2 text-[#171717] hover:text-[#6D202D] transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6D202D] cursor-pointer"
              >
                <ShoppingBag size={18} />
                <span className="hidden sm:inline text-xs font-mono tracking-wider font-semibold">
                  ({totalItems})
                </span>
                {totalItems > 0 && (
                  <span className="sm:hidden absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#171717] text-[9px] font-bold text-[#F6F2EA]">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Quick Search Bar */}
        {searchOpen && (
          <div className="border-t border-[#171717]/10 bg-[#FAF8F5] px-4 py-3 mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search size={16} className="text-[#171717]/40 absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH SILHOUETTES, COATS, TROUSERS, LEATHERS..."
                  className="w-full bg-[#F6F2EA] border border-[#171717]/20 pl-9 pr-24 py-2.5 text-xs tracking-wider uppercase text-[#171717] placeholder:text-[#171717]/40 focus:outline-none focus:border-[#171717]"
                />
                <button
                  type="submit"
                  className="absolute right-2 bg-[#171717] text-[#F6F2EA] hover:bg-[#6D202D] text-[10px] tracking-widest uppercase px-3 py-1.5 transition-colors cursor-pointer"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Responsive Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#171717]/10 bg-[#F6F2EA] px-6 py-8 mt-3 space-y-6 animate-in slide-in-from-top-2 duration-200 shadow-xl">
            <nav className="flex flex-col space-y-5" aria-label="Mobile Navigation Drawer">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-serif text-2xl tracking-wide text-[#171717] hover:text-[#6D202D] transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                to="/cart"
                className="font-serif text-2xl tracking-wide text-[#171717] hover:text-[#6D202D] transition-colors flex items-center justify-between pt-2 border-t border-[#171717]/10"
              >
                <span>Shopping Bag</span>
                <span className="font-mono text-xs bg-[#171717] text-[#F6F2EA] px-2.5 py-1">
                  {totalItems} items
                </span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setWishlistOpen(true)
                }}
                className="font-serif text-2xl tracking-wide text-[#171717] hover:text-[#6D202D] transition-colors flex items-center justify-between text-left cursor-pointer"
              >
                <span>Curated Wishlist</span>
                <span className="font-mono text-xs bg-[#6D202D] text-[#FFFFFF] px-2.5 py-1">
                  {totalWishlist} saved
                </span>
              </button>
            </nav>

            <div className="pt-6 border-t border-[#171717]/10 flex flex-col space-y-2 text-[11px] tracking-widest uppercase text-[#171717]/60">
              <p>Curated in Paris & Tokyo</p>
              <p>Inquiries: concierge@aureva-studios.com</p>
            </div>
          </div>
        )}
      </header>

      {/* Persistent Wishlist Slide-Over */}
      <WishlistDrawer isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </>
  )
}
