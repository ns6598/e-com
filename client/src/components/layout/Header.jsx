import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag,
  Heart,
  Menu,
  X,
  Search,
  User,
  ChevronDown,
  ArrowRight,
  Flame,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import WishlistDrawer from '../wishlist/WishlistDrawer'
import productService from '../../services/productService'
import { formatCurrency } from '../../utils/formatters'

// Configurable Top Announcement Bar Messages
const ANNOUNCEMENTS = [
  'FREE EXPRESS COURIER ON ORDERS OVER ₹2,999 • WORLDWIDE DISPATCH',
  'DARK REBELLION DROP MMXXVI • LIMITED EDITORIAL RUN • NO RESTOCKS',
  'USE CODE AUREVA15 FOR 15% OFF INAUGURAL ORDERS',
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeMegaMenu, setActiveMegaMenu] = useState(null) // 'shop' | 'collections' | null
  const [announcementIndex, setAnnouncementIndex] = useState(0)

  const location = useLocation()
  const navigate = useNavigate()
  const searchInputRef = useRef(null)
  const megaMenuTimeoutRef = useRef(null)

  const { openCart, totalItems, cartBounced } = useCart()
  const { totalWishlist } = useWishlist()
  const { user, isAuthenticated, isAdmin } = useAuth()

  // Rotate announcement bar every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Header scroll appearance
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close overlays on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setSearchOpen(false)
    setActiveMegaMenu(null)
  }, [location.pathname])

  // Focus search input when overlay opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  // Debounced search query handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSearching(false)
      return
    }

    setSearching(true)
    const timeoutId = setTimeout(() => {
      productService
        .getProducts({ search: searchQuery.trim(), limit: 6 })
        .then((res) => {
          setSearchResults(res.items || [])
        })
        .catch(() => {
          setSearchResults([])
        })
        .finally(() => {
          setSearching(false)
        })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Mega menu hover delay management
  const handleMegaEnter = (menu) => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current)
    setActiveMegaMenu(menu)
  }

  const handleMegaLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null)
    }, 200)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      {/* 1. Configurable Top Announcement Bar */}
      <aside
        aria-label="Announcement"
        className="bg-[#111111] text-[#A6A6A6] text-[11px] tracking-[0.2em] uppercase py-2 px-4 text-center border-b border-[#292929] z-40 relative select-none"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between sm:justify-center gap-4">
          <span className="hidden lg:inline text-[#737373] font-mono text-[10px]">
            [ AUREVA SUBVERSIVE COUTURE ]
          </span>

          <AnimatePresence mode="wait">
            <motion.p
              key={announcementIndex}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
              className="font-mono text-[#F5F5F5] font-medium"
            >
              {ANNOUNCEMENTS[announcementIndex]}
            </motion.p>
          </AnimatePresence>

          <span className="hidden lg:inline text-[#B8FF00] font-mono text-[10px] font-bold">
            PARIS • BERLIN • TOKYO
          </span>
        </div>
      </aside>

      {/* 2. Main Sticky Navigation Bar */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
          scrolled
            ? 'bg-[#090909]/95 backdrop-blur-md border-[#292929] py-3 shadow-2xl'
            : 'bg-[#090909] border-[#292929]/70 py-4.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* LEFT: AUREVA Brand Logo */}
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 text-[#F5F5F5] hover:text-[#B8FF00] transition-colors cursor-pointer"
                aria-label="Open mobile navigation menu"
              >
                <Menu size={22} />
              </button>

              <Link
                to="/"
                data-cursor="explore"
                className="group flex items-center gap-1.5 select-none"
                aria-label="AUREVA Homepage"
              >
                <span className="font-display font-extrabold text-2xl sm:text-3xl tracking-[-0.04em] text-[#F5F5F5] group-hover:text-white transition-colors">
                  AUREVA
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8FF00] inline-block shadow-[0_0_8px_#B8FF00] group-hover:scale-125 transition-transform" />
              </Link>
            </div>

            {/* CENTER: Desktop Primary Navigation Links with Mega Menus */}
            <nav className="hidden lg:flex items-center space-x-8" aria-label="Main Navigation">
              {/* SHOP with Mega Menu */}
              <div
                className="relative py-2"
                onMouseEnter={() => handleMegaEnter('shop')}
                onMouseLeave={handleMegaLeave}
              >
                <NavLink
                  to="/shop"
                  className={({ isActive }) =>
                    `font-condensed text-[14px] uppercase tracking-[0.14em] font-semibold transition-colors flex items-center gap-1 ${
                      isActive || activeMegaMenu === 'shop'
                        ? 'text-[#B8FF00]'
                        : 'text-[#F5F5F5] hover:text-[#B8FF00]'
                    }`
                  }
                >
                  <span>SHOP</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      activeMegaMenu === 'shop' ? 'rotate-180 text-[#B8FF00]' : ''
                    }`}
                  />
                </NavLink>

                {/* SHOP Desktop Mega Menu */}
                <AnimatePresence>
                  {activeMegaMenu === 'shop' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full -left-12 w-[680px] bg-[#111111] border border-[#292929] shadow-2xl p-6 grid grid-cols-12 gap-6 z-50 rounded-xs"
                    >
                      <div className="col-span-7 space-y-4">
                        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B8FF00] border-b border-[#292929] pb-2">
                          SHOP DEPARTMENTS
                        </div>
                        <ul className="space-y-3 font-condensed tracking-wider uppercase text-sm">
                          {[
                            { name: 'WOMEN', path: '/shop?category=women', tag: 'Drop MMXXVI' },
                            { name: 'MEN', path: '/shop?category=men', tag: 'Tailored' },
                            { name: 'ACCESSORIES', path: '/shop?category=accessories', tag: 'Leather & Silver' },
                            { name: 'COLLECTIONS', path: '/shop?filter=collections', tag: 'Archive' },
                            { name: 'SALE PIECES', path: '/shop?filter=sale', tag: 'Up to 30% Off', highlight: true },
                          ].map((cat) => (
                            <li key={cat.path}>
                              <Link
                                to={cat.path}
                                onClick={() => setActiveMegaMenu(null)}
                                className={`flex items-center justify-between group py-1 transition-colors ${
                                  cat.highlight
                                    ? 'text-[#B8FF00] hover:text-[#D1FF38]'
                                    : 'text-[#F5F5F5] hover:text-[#B8FF00]'
                                }`}
                              >
                                <span className="font-semibold text-[15px]">{cat.name}</span>
                                <span className="font-mono text-[10px] text-[#A6A6A6] group-hover:text-[#F5F5F5] transition-colors">
                                  {cat.tag} →
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="col-span-5 bg-[#171717] border border-[#292929] p-4 flex flex-col justify-between">
                        <div>
                          <div className="text-[9px] font-mono tracking-widest text-[#B8FF00] uppercase mb-1">
                            FEATURED DROP
                          </div>
                          <h4 className="font-display font-bold text-base text-[#F5F5F5] leading-tight">
                            CYBER GRUNGE MONOGRAPH
                          </h4>
                          <p className="text-xs text-[#A6A6A6] mt-2 font-light leading-relaxed">
                            Heavy distress, sculptural silhouettes, and raw metal hardware.
                          </p>
                        </div>
                        <Link
                          to="/shop?sort=newest"
                          onClick={() => setActiveMegaMenu(null)}
                          className="mt-4 inline-flex items-center gap-1.5 text-xs font-mono tracking-widest text-[#B8FF00] uppercase hover:underline"
                        >
                          <span>DISCOVER NOW</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* NEW ARRIVALS */}
              <NavLink
                to="/shop?sort=newest"
                className={({ isActive }) =>
                  `font-condensed text-[14px] uppercase tracking-[0.14em] font-semibold transition-colors ${
                    isActive ? 'text-[#B8FF00]' : 'text-[#F5F5F5] hover:text-[#B8FF00]'
                  }`
                }
              >
                NEW ARRIVALS
              </NavLink>

              {/* COLLECTIONS with Mega Menu */}
              <div
                className="relative py-2"
                onMouseEnter={() => handleMegaEnter('collections')}
                onMouseLeave={handleMegaLeave}
              >
                <NavLink
                  to="/shop?filter=collections"
                  className={({ isActive }) =>
                    `font-condensed text-[14px] uppercase tracking-[0.14em] font-semibold transition-colors flex items-center gap-1 ${
                      isActive || activeMegaMenu === 'collections'
                        ? 'text-[#B8FF00]'
                        : 'text-[#F5F5F5] hover:text-[#B8FF00]'
                    }`
                  }
                >
                  <span>COLLECTIONS</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      activeMegaMenu === 'collections' ? 'rotate-180 text-[#B8FF00]' : ''
                    }`}
                  />
                </NavLink>

                {/* COLLECTIONS Desktop Mega Menu */}
                <AnimatePresence>
                  {activeMegaMenu === 'collections' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-full -left-20 w-[600px] bg-[#111111] border border-[#292929] shadow-2xl p-6 grid grid-cols-2 gap-6 z-50 rounded-xs"
                    >
                      <div className="space-y-3">
                        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B8FF00] border-b border-[#292929] pb-2">
                          ACTIVE CHAPTERS
                        </div>
                        <ul className="space-y-2.5 font-condensed tracking-wider uppercase text-sm">
                          {[
                            { name: 'NEW DROP MMXXVI', path: '/shop?sort=newest' },
                            { name: 'DARK ESSENTIALS', path: '/shop?category=women' },
                            { name: 'NIGHT COUTURE', path: '/shop?category=men' },
                            { name: 'SIGNATURE HARDWARE', path: '/shop?category=accessories' },
                          ].map((item) => (
                            <li key={item.path}>
                              <Link
                                to={item.path}
                                onClick={() => setActiveMegaMenu(null)}
                                className="block py-1 text-[#F5F5F5] hover:text-[#B8FF00] transition-colors"
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3 border-l border-[#292929] pl-6 flex flex-col justify-between">
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#A6A6A6]">
                            MANIFESTO
                          </div>
                          <p className="text-xs text-[#A6A6A6] mt-2 font-light leading-relaxed">
                            "AUREVA is not just what you wear. It is how you arrive." Garments crafted for permanent defiance.
                          </p>
                        </div>
                        <Link
                          to="/about"
                          onClick={() => setActiveMegaMenu(null)}
                          className="inline-flex items-center gap-1.5 text-xs font-mono tracking-widest text-[#B8FF00] uppercase hover:underline"
                        >
                          <span>READ MANIFESTO →</span>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SALE */}
              <NavLink
                to="/shop?filter=sale"
                className={({ isActive }) =>
                  `font-condensed text-[14px] uppercase tracking-[0.14em] font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-[#B8FF00]' : 'text-[#F5F5F5] hover:text-[#B8FF00]'
                  }`
                }
              >
                <span>SALE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8FF00] animate-pulse" />
              </NavLink>

              {/* ABOUT */}
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `font-condensed text-[14px] uppercase tracking-[0.14em] font-semibold transition-colors ${
                    isActive ? 'text-[#B8FF00]' : 'text-[#F5F5F5] hover:text-[#B8FF00]'
                  }`
                }
              >
                ABOUT
              </NavLink>
            </nav>

            {/* RIGHT: Action Icons (Search, Account, Wishlist, Bag) */}
            <div className="flex items-center space-x-4 sm:space-x-5 text-[#F5F5F5]">
              {/* Search Trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-1.5 hover:text-[#B8FF00] transition-colors cursor-pointer flex items-center gap-1.5"
                aria-label="Open search"
              >
                <Search size={19} />
                <span className="hidden xl:inline text-xs font-mono tracking-widest uppercase text-[#A6A6A6]">
                  SEARCH
                </span>
              </button>

              {/* Account */}
              <Link
                to={isAuthenticated ? '/account' : '/login'}
                className="p-1.5 hover:text-[#B8FF00] transition-colors flex items-center gap-1.5"
                aria-label={isAuthenticated ? 'Patron Account' : 'Sign In'}
              >
                <User size={19} />
                <span className="hidden xl:inline text-xs font-mono tracking-widest uppercase text-[#A6A6A6]">
                  {isAuthenticated ? (user?.name?.split(' ')[0] || 'ACCOUNT') : 'ACCOUNT'}
                </span>
              </Link>

              {/* Wishlist */}
              <button
                type="button"
                onClick={() => setWishlistOpen(true)}
                className="relative p-1.5 hover:text-[#B8FF00] transition-colors cursor-pointer"
                aria-label={`Wishlist (${totalWishlist} items)`}
              >
                <Heart size={19} />
                {totalWishlist > 0 && (
                  <span className="absolute -top-1 -right-1 font-mono text-[10px] font-bold bg-[#B8FF00] text-[#090909] w-4 h-4 rounded-full flex items-center justify-center">
                    {totalWishlist}
                  </span>
                )}
              </button>

              {/* Bag */}
              <button
                type="button"
                onClick={openCart}
                className={`relative p-1.5 hover:text-[#B8FF00] transition-colors cursor-pointer ${
                  cartBounced ? 'scale-110' : ''
                }`}
                aria-label={`Shopping Bag (${totalItems} items)`}
              >
                <ShoppingBag size={19} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 font-mono text-[10px] font-bold bg-[#B8FF00] text-[#090909] w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Fullscreen / Dark Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#090909]/95 backdrop-blur-xl flex flex-col justify-start p-6 md:p-12 overflow-y-auto"
          >
            <div className="max-w-4xl w-full mx-auto">
              <div className="flex items-center justify-between pb-6 border-b border-[#292929]">
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#B8FF00]">
                  SEARCH AUREVA CATALOGUE
                </span>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-2 text-[#A6A6A6] hover:text-[#F5F5F5] transition-colors cursor-pointer"
                  aria-label="Close search overlay"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="mt-8">
                <div className="relative flex items-center border-b-2 border-[#292929] focus-within:border-[#B8FF00] transition-colors pb-3">
                  <Search size={28} className="text-[#A6A6A6] mr-4 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="TYPE TO SEARCH (E.G. COAT, CORSET, BOOTS, NOIR)..."
                    className="w-full bg-transparent text-[#F5F5F5] font-condensed text-2xl md:text-4xl tracking-wider placeholder-[#737373] uppercase focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-xs font-mono text-[#A6A6A6] hover:text-[#F5F5F5] cursor-pointer ml-2"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              </form>

              {/* Live Search Results */}
              <div className="mt-8">
                {searching ? (
                  <div className="py-12 text-center font-mono text-xs text-[#A6A6A6] tracking-widest uppercase">
                    SCANNING ATELIER ARCHIVES...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between font-mono text-xs text-[#A6A6A6] uppercase tracking-wider">
                      <span>{searchResults.length} PIECES DISCOVERED</span>
                      <Link
                        to={`/shop?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setSearchOpen(false)}
                        className="text-[#B8FF00] hover:underline"
                      >
                        VIEW ALL RESULTS →
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.slug || product.id}`}
                          onClick={() => setSearchOpen(false)}
                          className="alt-card p-3 flex gap-3 group hover:border-[#B8FF00] transition-colors"
                        >
                          <div className="w-16 h-20 bg-[#111111] shrink-0 overflow-hidden">
                            <img
                              src={product.images?.[0] || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80'}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="flex flex-col justify-between py-0.5">
                            <div>
                              <span className="font-mono text-[9px] uppercase tracking-wider text-[#A6A6A6] block">
                                {product.category}
                              </span>
                              <h4 className="font-condensed font-semibold text-sm uppercase text-[#F5F5F5] line-clamp-1 group-hover:text-[#B8FF00] transition-colors">
                                {product.name}
                              </h4>
                            </div>
                            <span className="font-mono text-xs font-bold text-[#F5F5F5]">
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="py-12 text-center font-mono text-xs text-[#A6A6A6] tracking-widest uppercase">
                    NO PIECES MATCH '{searchQuery}'. TRY SEARCHING 'LEATHER', 'JACKET', 'CORSET', OR 'SILK'.
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Fullscreen Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-[#090909] text-[#F5F5F5] flex flex-col justify-between p-6 overflow-y-auto"
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between pb-6 border-b border-[#292929]">
              <span className="font-display font-extrabold text-2xl tracking-tight text-[#F5F5F5]">
                AUREVA
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#A6A6A6] hover:text-[#B8FF00] transition-colors cursor-pointer"
                aria-label="Close mobile menu"
              >
                <X size={26} />
              </button>
            </div>

            {/* Mobile Primary Links */}
            <nav className="my-auto py-8 space-y-6">
              {[
                { label: 'SHOP ALL', to: '/shop' },
                { label: 'NEW ARRIVALS', to: '/shop?sort=newest', accent: true },
                { label: 'WOMEN', to: '/shop?category=women' },
                { label: 'MEN', to: '/shop?category=men' },
                { label: 'ACCESSORIES', to: '/shop?category=accessories' },
                { label: 'COLLECTIONS', to: '/shop?filter=collections' },
                { label: 'SALE', to: '/shop?filter=sale', sale: true },
                { label: 'ABOUT AUREVA', to: '/about' },
                { label: 'VIP CONCIERGE', to: '/contact' },
              ].map((item, idx) => (
                <motion.div
                  key={item.to}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.04 + 0.1, duration: 0.25 }}
                >
                  <Link
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block font-condensed text-3xl sm:text-4xl uppercase tracking-wider font-bold transition-colors ${
                      item.sale
                        ? 'text-[#B8FF00]'
                        : item.accent
                        ? 'text-[#F5F5F5] hover:text-[#B8FF00]'
                        : 'text-[#F5F5F5] hover:text-[#B8FF00]'
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {isAdmin && (
                <div className="pt-4 border-t border-[#292929]">
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-mono text-xs uppercase tracking-widest text-[#B8FF00] font-bold block"
                  >
                    → ADMIN CONSOLE
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Footer Coordinates */}
            <div className="pt-6 border-t border-[#292929] flex flex-col gap-2 font-mono text-[10px] tracking-widest uppercase text-[#737373]">
              <div className="flex justify-between">
                <span>CONCIERGE@AUREVA.COM</span>
                <span>PARIS • BERLIN • TOKYO</span>
              </div>
              <p>© MMXXVI AUREVA. STYLE WITHOUT BOUNDARIES.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Persistent Wishlist Slide-Over */}
      <WishlistDrawer isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </>
  )
}
