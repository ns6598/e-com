import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Menu, X, Search, Check, Copy, Sparkles, Ruler, User } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import WishlistDrawer from '../wishlist/WishlistDrawer'
import SizeChartModal from '../common/SizeChartModal'


export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [sizeChartOpen, setSizeChartOpen] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const searchInputRef = useRef(null)

  const { openCart, totalItems, cartBounced } = useCart()
  const { totalWishlist } = useWishlist()
  const { user, isAuthenticated, isAdmin } = useAuth()

  const isHomePage = location.pathname === '/'


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

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
    { label: 'Shop Catalog', to: '/shop' },
    { label: 'Runway Lookbook', to: '/shop?filter=collections' },
    { label: 'New Arrivals', to: '/shop?filter=new' },
    { label: 'The Manifesto', to: '/about' },
    { label: 'VIP Concierge', to: '/contact' },
  ]

  return (
    <>
      {/* Top Haute Couture Announcement Bar */}
      <aside aria-label="Announcement" className="bg-[#050609] text-gray-300 text-[10px] tracking-[0.26em] uppercase py-2.5 px-4 text-center border-b border-white/5 z-50 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between sm:justify-center gap-4 sm:gap-8">
          <span className="hidden lg:inline text-gray-500 font-mono">PARIS • MILAN • TOKYO</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-300">INAUGURAL EDIT: 15% COMPLIMENTARY WITH CODE</span>
            <button
              type="button"
              onClick={handleCopyLaunchCode}
              title="Click to copy code"
              className="inline-flex items-center gap-1 font-mono font-bold gold-gradient-bg text-[#08090D] px-2 py-0.5 tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <span>AUREVA15</span>
              {copiedCode ? <Check size={11} className="text-emerald-900" /> : <Copy size={10} />}
            </button>
            {copiedCode && (
              <span className="text-[#D4AF37] font-mono text-[9px] tracking-widest hidden sm:inline">
                [COPIED]
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSizeChartOpen(true)}
              className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#D4AF37] font-mono transition-colors cursor-pointer"
              title="View Atelier Size Chart & Measurement Guide"
            >
              <Ruler size={11} className="text-[#D4AF37]" />
              <span>SIZE CHART</span>
            </button>
            <span className="hidden sm:inline text-gray-500 font-mono">COMPLIMENTARY COURIER OVER ₹2,999</span>
          </div>
        </div>
      </aside>

      {/* Floating Liquid Glass Persistent Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'glass-panel bg-[#080A10]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3'
            : isHomePage
            ? 'bg-[#080A10]/75 backdrop-blur-lg border-b border-white/5 py-4'
            : 'bg-[#080A10]/90 backdrop-blur-lg border-b border-white/10 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Desktop Left Nav */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8" aria-label="Primary Navigation">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-xs uppercase tracking-[0.2em] font-medium transition-all relative py-1 hover:text-[#D4AF37] ${
                      isActive && !link.to.includes('?') ? 'text-[#D4AF37] font-semibold' : 'text-gray-300'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && !link.to.includes('?') && (
                        <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37] cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* AUREVA Brand Mark */}
            <div className="text-center">
              <Link
                to="/"
                className="group inline-flex flex-col items-center focus-visible:outline-none select-none"
              >
                <span className="font-serif text-2xl sm:text-3xl lg:text-4xl tracking-[0.26em] font-light text-white group-hover:text-[#D4AF37] transition-colors">
                  AUREVA
                </span>
                <span className="text-[8px] uppercase tracking-[0.4em] text-gray-400 group-hover:text-[#D4AF37]/80 transition-colors -mt-0.5">
                  Style Without Boundaries
                </span>
              </Link>
            </div>

            {/* Right Action Icons: Search, Wishlist, Shopping Bag */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Toggle search catalog"
                className={`p-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37] ${
                  searchOpen ? 'text-[#D4AF37]' : 'text-gray-300 hover:text-[#D4AF37]'
                }`}
                title="Search collection"
              >
                <Search size={18} />
              </button>

              {/* Size Chart Button */}
              <button
                type="button"
                onClick={() => setSizeChartOpen(true)}
                aria-label="Open Atelier Size Chart & Fit Guide"
                className="p-2 text-gray-300 hover:text-[#D4AF37] transition-colors cursor-pointer hidden md:flex items-center gap-1 font-mono text-[11px] tracking-wider"
                title="Size Chart & Fit Guide"
              >
                <Ruler size={15} />
                <span className="hidden xl:inline uppercase">Sizing</span>
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => setWishlistOpen(true)}
                aria-label={`Open wishlist with ${totalWishlist} saved items`}
                className="relative p-2 text-gray-300 hover:text-[#D4AF37] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37] cursor-pointer"
              >
                <Heart size={18} />
                {totalWishlist > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#7E1828] text-[9px] font-bold text-white shadow-xs border border-white/20">
                    {totalWishlist}
                  </span>
                )}
              </button>

              {/* Patron Account / Sign In Link */}
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                aria-label={isAuthenticated ? `Patron Account: ${user?.name}` : 'Sign In to Patron Account'}
                className="p-2 text-gray-300 hover:text-[#D4AF37] transition-colors cursor-pointer relative flex items-center"
                title={isAuthenticated ? `Dossier: ${user?.name}` : 'Patron Sign In'}
              >
                {isAuthenticated ? (
                  <span className="h-6 w-6 rounded-full border border-[#D4AF37] gold-gradient-bg text-[#08090D] font-bold text-[10px] flex items-center justify-center font-mono shadow-xs">
                    {(user?.name || user?.email || 'A')[0].toUpperCase()}
                  </span>
                ) : (
                  <User size={18} />
                )}
              </Link>


              {/* Shopping Bag Button with Live Motion Bounce */}
              <motion.button
                type="button"
                onClick={openCart}
                animate={cartBounced ? { scale: [1, 1.25, 0.95, 1.1, 1], rotate: [0, -6, 6, -3, 0] } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.55 }}
                aria-label={`Open shopping bag with ${totalItems} items`}
                className={`relative p-2 text-gray-300 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37] cursor-pointer ${
                  cartBounced ? 'text-[#D4AF37]' : ''
                }`}
              >
                <ShoppingBag size={18} />
                <motion.span
                  key={totalItems}
                  initial={{ scale: 1.35, color: '#D4AF37' }}
                  animate={{ scale: 1, color: '#FFFFFF' }}
                  className="hidden sm:inline text-xs font-mono tracking-wider font-semibold text-white"
                >
                  ({totalItems})
                </motion.span>
                {cartBounced && (
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#D4AF37] animate-ping" />
                )}
                {totalItems > 0 && (
                  <span className="sm:hidden absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full gold-gradient-bg text-[#08090D] text-[9px] font-bold">
                    {totalItems}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Liquid Glass Search Drawer */}
        {searchOpen && (
          <div className="border-t border-white/10 glass-panel bg-[#0B0D15]/95 px-4 py-3 mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search size={16} className="text-gray-400 absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH SILHOUETTES, COATS, TROUSERS, LEATHERS..."
                  className="w-full bg-[#121522] border border-white/15 pl-9 pr-24 py-2.5 text-xs tracking-wider uppercase text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  className="absolute right-2 gold-gradient-bg text-[#08090D] font-bold text-[10px] tracking-widest uppercase px-3.5 py-1.5 transition-opacity hover:opacity-90 cursor-pointer"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 glass-panel bg-[#0B0D15]/98 px-6 py-8 mt-3 space-y-6 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
            <nav className="flex flex-col space-y-5" aria-label="Mobile Navigation Drawer">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-serif text-2xl tracking-wide text-white hover:text-[#D4AF37] transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                to="/cart"
                className="font-serif text-2xl tracking-wide text-white hover:text-[#D4AF37] transition-colors flex items-center justify-between pt-2 border-t border-white/10"
              >
                <span>Shopping Bag</span>
                <span className="font-mono text-xs gold-gradient-bg text-[#08090D] font-bold px-2.5 py-1">
                  {totalItems} items
                </span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setWishlistOpen(true)
                }}
                className="font-serif text-2xl tracking-wide text-white hover:text-[#D4AF37] transition-colors flex items-center justify-between text-left cursor-pointer"
              >
                <span>Curated Wishlist</span>
                <span className="font-mono text-xs bg-[#7E1828] text-white px-2.5 py-1 border border-white/20">
                  {totalWishlist} saved
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setSizeChartOpen(true)
                }}
                className="font-serif text-2xl tracking-wide text-white hover:text-[#D4AF37] transition-colors flex items-center justify-between text-left cursor-pointer"
              >
                <span>Size Chart & Guide</span>
                <Ruler size={18} className="text-[#D4AF37]" />
              </button>

              <Link
                to={isAuthenticated ? '/account' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="font-serif text-2xl tracking-wide text-white hover:text-[#D4AF37] transition-colors flex items-center justify-between pt-2 border-t border-white/10"
              >
                <span>{isAuthenticated ? 'Patron Dossier' : 'Patron Sign In'}</span>
                <User size={18} className="text-[#D4AF37]" />
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-serif text-2xl tracking-wide text-[#D4AF37] hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>Atelier Admin Console</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 border border-[#D4AF37]">
                    Curator
                  </span>
                </Link>
              )}
            </nav>


            <div className="pt-6 border-t border-white/10 flex flex-col space-y-2 text-[11px] tracking-widest uppercase text-gray-400 font-mono">
              <p>Curated in Paris & Tokyo</p>
              <p>Inquiries: concierge@aureva-studios.com</p>
            </div>
          </div>
        )}
      </header>

      {/* Persistent Wishlist Slide-Over */}
      <WishlistDrawer isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />

      {/* Persistent Atelier Size Chart Modal */}
      <SizeChartModal isOpen={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
    </>
  )
}
