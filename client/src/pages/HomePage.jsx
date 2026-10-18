import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Flame, ShieldAlert, Sparkles } from 'lucide-react'
import { PRODUCTS } from '../data/products'
import productService from '../services/productService'
import ProductCard from '../components/product/ProductCard'
import ProductQuickViewModal from '../components/product/ProductQuickViewModal'
import NewsletterForm from '../components/common/NewsletterForm'

// Configurable Promotional Strip Marquee Ticker Items
const PROMO_STRIP_ITEMS = [
  'NEW SEASON // NEW ATTITUDE',
  'LIMITED DROP // AVAILABLE NOW',
  'SUBVERSIVE DARKWEAR & CYBER GRUNGE',
  'FREE EXPRESS DISPATCH OVER ₹2,999',
  'STYLE WITHOUT BOUNDARIES',
  'NO RESTOCKS // ARCHIVE PIECES',
]

export default function HomePage() {
  const [liveProducts, setLiveProducts] = useState(PRODUCTS)
  const [selectedGridCategory, setSelectedGridCategory] = useState('ALL')
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  // Horizontal scroll rail ref
  const railRef = useRef(null)

  // Fetch live products from backend API
  useEffect(() => {
    let isMounted = true
    productService
      .getProducts({ limit: 16 })
      .then((res) => {
        if (isMounted && res.items?.length > 0) {
          setLiveProducts(res.items)
        }
      })
      .catch(() => {
        // Fallback to static PRODUCTS if offline
      })
    return () => {
      isMounted = false
    }
  }, [])

  // Pointer movement tracking for Hero Parallax (restrained for desktop, disabled on touch)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 30, stiffness: 120 }
  const heroImageX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig)
  const heroImageY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-10, 10]), springConfig)

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  // Scroll parallax for campaign section
  const campaignRef = useRef(null)
  const { scrollYProgress: campaignProgress } = useScroll({
    target: campaignRef,
    offset: ['start end', 'end start'],
  })
  const campaignParallaxY = useTransform(campaignProgress, [0, 1], ['-6%', '6%'])

  // Rail scroll handler
  const scrollRail = (direction) => {
    if (railRef.current) {
      const scrollAmount = railRef.current.clientWidth * 0.75
      railRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  // Filtered products for Section 5 Discovery Grid
  const filteredGridProducts = liveProducts.filter((p) => {
    if (selectedGridCategory === 'ALL') return true
    if (selectedGridCategory === 'NEW ARRIVALS') return p.isNew
    if (selectedGridCategory === 'SALE') return p.isSale || (p.originalPrice && p.originalPrice > p.price)
    return p.category?.toUpperCase() === selectedGridCategory || p.department?.toUpperCase() === selectedGridCategory
  })

  return (
    <div className="w-full bg-[#090909] text-[#F5F5F5] overflow-hidden">
      {/* ========================================================
          SECTION 1 — HERO
          Full-width dark fashion hero with pointer motion
      ======================================================== */}
      <section
        onMouseMove={handleHeroMouseMove}
        className="relative min-h-[92vh] lg:min-h-screen flex flex-col justify-between pt-20 pb-12 px-4 sm:px-8 md:px-12 lg:px-16 border-b border-[#292929] overflow-hidden bg-[#090909]"
      >
        {/* Background Dark Atmosphere Image with Parallax */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div
            style={{ x: heroImageX, y: heroImageY }}
            className="w-full h-[110%] -top-[5%] -left-[5%] relative"
          >
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=2200&q=90"
              alt="AUREVA Dark Alternative Runway"
              className="w-full h-full object-cover object-top opacity-40 filter contrast-125 brightness-90"
            />
            {/* Dark vignette overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090909] via-[#090909]/70 to-transparent" />
          </motion.div>
        </div>

        {/* Top Editorial Monograph Metadata */}
        <div className="relative z-10 flex items-center justify-between text-[11px] tracking-[0.25em] uppercase font-mono text-[#A6A6A6]">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#B8FF00] inline-block shadow-[0_0_8px_#B8FF00]" />
            <span>SEASON MMXXVI // DROP 01</span>
          </span>
          <span className="hidden md:inline-block">DARK ALTERNATIVE READY-TO-WEAR</span>
          <span>PARIS • BERLIN • TOKYO</span>
        </div>

        {/* Hero Typography & Intent */}
        <div className="relative z-10 my-auto py-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block px-3 py-1 bg-[#171717] border border-[#292929] font-mono text-xs uppercase tracking-widest text-[#B8FF00] mb-4">
              NEW DROP AVAILABLE NOW
            </span>
            <h1 className="font-display font-extrabold text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[-0.03em] leading-[0.92] uppercase text-[#F5F5F5]">
              BOLD TEXTURE.
              <br />
              <span className="text-[#B8FF00]">DARK ATTITUDE.</span>
              <br />
              YOUR STYLE.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="mt-6 text-base md:text-lg max-w-xl text-[#A6A6A6] font-light leading-relaxed tracking-wide"
          >
            Subversive tailoring, heavy metal hardware, and deconstructed silhouettes crafted for those who walk in shadows. Style without boundaries.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
            className="mt-8 flex flex-wrap items-center gap-4 sm:gap-5"
          >
            <Link
              to="/shop?sort=newest"
              data-cursor="explore"
              className="alt-btn-accent group"
            >
              <span>SHOP NEW ARRIVALS</span>
              <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/shop"
              data-cursor="explore"
              className="alt-btn-secondary group"
            >
              <span>EXPLORE COLLECTION</span>
              <ArrowUpRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </div>

        {/* Small Scroll Indicator */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-[#292929] text-xs font-mono text-[#737373] tracking-[0.2em] uppercase">
          <div className="flex items-center gap-3">
            <span className="w-8 h-px bg-[#B8FF00]" />
            <span className="text-[#A6A6A6]">SCROLL TO EXPLORE ARCHIVE</span>
          </div>
          <span className="hidden sm:inline-block">NO RESTOCKS ONCE CLAIMED</span>
        </div>
      </section>

      {/* ========================================================
          SECTION 2 — BOLD PROMOTIONAL STRIP (TICKER)
          Horizontal movement with large bold typography
      ======================================================== */}
      <section className="bg-[#B8FF00] text-[#090909] py-3.5 overflow-hidden border-y border-[#B8FF00] select-none">
        <div className="animate-ticker flex items-center gap-8 font-condensed font-bold text-base sm:text-lg uppercase tracking-wider whitespace-nowrap">
          {PROMO_STRIP_ITEMS.concat(PROMO_STRIP_ITEMS).map((item, idx) => (
            <React.Fragment key={idx}>
              <span className="flex items-center gap-2">
                <span>{item}</span>
                <span className="text-[#090909] opacity-60">✦</span>
              </span>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 3 — LARGE CATEGORY BLOCKS
          WOMEN, MEN, ACCESSORIES, SALE with hover zoom & dark overlay
      ======================================================== */}
      <section className="py-20 md:py-28 px-4 sm:px-8 md:px-12 lg:px-16 border-b border-[#292929] bg-[#090909]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 pb-4 border-b border-[#292929]">
          <div>
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#B8FF00] block mb-1">
              CATEGORY ARCHIVES
            </span>
            <h2 className="font-display font-bold text-3xl md:text-5xl uppercase tracking-tight text-[#F5F5F5]">
              EXPLORE BY SECTOR
            </h2>
          </div>
          <Link
            to="/shop"
            data-cursor="explore"
            className="mt-4 sm:mt-0 text-xs font-mono uppercase tracking-widest text-[#A6A6A6] hover:text-[#B8FF00] transition-colors flex items-center gap-1.5"
          >
            <span>VIEW ALL APPAREL</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* 4 Category Blocks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              title: 'WOMEN',
              tag: 'SECTOR 01',
              desc: 'Corsetry, deconstructed knitwear, and floor-sweeping cloaks.',
              image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
              link: '/shop?category=women',
            },
            {
              title: 'MEN',
              tag: 'SECTOR 02',
              desc: 'Distressed denim, structured overcoats, and harness jackets.',
              image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85',
              link: '/shop?category=men',
            },
            {
              title: 'ACCESSORIES',
              tag: 'SECTOR 03',
              desc: 'Solid silver pendants, studded belts, and heavy combat boots.',
              image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85',
              link: '/shop?category=accessories',
            },
            {
              title: 'SALE',
              tag: 'FINAL PIECES',
              desc: 'Archived capsule pieces with discounts up to 30% off.',
              image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=85',
              link: '/shop?filter=sale',
              isSale: true,
            },
          ].map((cat) => (
            <div
              key={cat.title}
              className="group relative overflow-hidden bg-[#171717] border border-[#292929] hover:border-[#B8FF00] transition-colors duration-300 flex flex-col justify-between"
            >
              <Link
                to={cat.link}
                data-cursor="explore"
                className="block relative aspect-[4/5] overflow-hidden"
              >
                <img
                  src={cat.image}
                  alt={`AUREVA ${cat.title}`}
                  className="w-full h-full object-cover object-center filter contrast-110 brightness-90 group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-[#090909]/40 to-transparent group-hover:via-[#090909]/20 transition-all duration-300" />

                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border ${
                      cat.isSale
                        ? 'bg-[#8B0000] text-white border-[#8B0000]'
                        : 'bg-[#090909]/80 text-[#B8FF00] border-[#292929]'
                    }`}
                  >
                    {cat.tag}
                  </span>
                </div>

                {/* Bottom Title & Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end">
                  <h3 className="font-display font-extrabold text-3xl uppercase tracking-tight text-[#F5F5F5] group-hover:text-[#B8FF00] group-hover:-translate-y-1 transition-all duration-200">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#A6A6A6] font-light leading-relaxed line-clamp-2">
                    {cat.desc}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-condensed font-bold uppercase tracking-wider text-[#F5F5F5] group-hover:text-[#B8FF00] transition-colors">
                    <span>SHOP NOW</span>
                    <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 4 — HORIZONTAL PRODUCT RAIL
          Desktop horizontal rail + touch scrollable mobile rail
      ======================================================== */}
      <section className="py-20 md:py-28 px-4 sm:px-8 md:px-12 lg:px-16 border-b border-[#292929] bg-[#090909]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#B8FF00] block mb-1">
              RUNWAY MONOGRAPHS
            </span>
            <h2 className="font-display font-bold text-3xl md:text-5xl uppercase tracking-tight text-[#F5F5F5]">
              FEATURED DISPATCHES
            </h2>
          </div>

          {/* Desktop Left/Right Scroll Buttons */}
          <div className="hidden sm:flex items-center gap-2 mt-4 sm:mt-0">
            <button
              type="button"
              onClick={() => scrollRail('left')}
              aria-label="Scroll rail left"
              className="p-3 border border-[#292929] bg-[#111111] text-[#F5F5F5] hover:border-[#B8FF00] hover:text-[#B8FF00] transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollRail('right')}
              aria-label="Scroll rail right"
              className="p-3 border border-[#292929] bg-[#111111] text-[#F5F5F5] hover:border-[#B8FF00] hover:text-[#B8FF00] transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Rail Container */}
        <div
          ref={railRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth' }}
        >
          {liveProducts.slice(0, 8).map((product) => (
            <div
              key={`rail-${product.id}`}
              className="w-[260px] sm:w-[290px] md:w-[320px] shrink-0 snap-start"
            >
              <ProductCard
                product={product}
                showQuickAdd={true}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION 5 — FULLSCREEN VISUAL CAMPAIGN
          Parallax fashion visual with overlay text
      ======================================================== */}
      <section
        ref={campaignRef}
        className="relative h-[75vh] md:h-[85vh] flex items-center justify-center overflow-hidden border-b border-[#292929]"
      >
        <motion.div
          style={{ y: campaignParallaxY }}
          className="absolute inset-0 w-full h-[120%] -top-[10%] pointer-events-none"
        >
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2200&q=90"
            alt="AUREVA Campaign Editorial"
            className="w-full h-full object-cover object-center filter contrast-125 brightness-75"
          />
          <div className="absolute inset-0 bg-[#090909]/60" />
        </motion.div>

        {/* Campaign Editorial Overlay Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl text-[#F5F5F5]">
          <span className="text-xs uppercase font-mono tracking-[0.35em] text-[#B8FF00] mb-4 block">
            LIMITED DROP MMXXVI
          </span>
          <h2 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-[-0.03em] leading-[0.95] text-white">
            THE NEW
            <br />
            AUREVA
            <br />
            <span className="text-[#B8FF00]">COLLECTION</span>
          </h2>

          <p className="mt-6 text-sm md:text-base text-[#A6A6A6] font-light max-w-lg mx-auto">
            Deconstructed silhouettes, heavy Biella wools, and raw metal closures made for uncompromising individuality.
          </p>

          <div className="mt-8">
            <Link
              to="/shop"
              data-cursor="explore"
              className="alt-btn-accent"
            >
              <span>DISCOVER THE COLLECTION</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 6 — CLEAN PRODUCT GRID
          4 cols desktop / 3 tablet / 2 mobile with category filters
      ======================================================== */}
      <section className="py-20 md:py-28 px-4 sm:px-8 md:px-12 lg:px-16 border-b border-[#292929] bg-[#090909]">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#B8FF00] block mb-1">
              DISCOVERY CATALOGUE
            </span>
            <h2 className="font-display font-bold text-3xl md:text-5xl uppercase tracking-tight text-[#F5F5F5]">
              ALL ESSENTIALS
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-6 md:mt-0 font-condensed text-xs uppercase tracking-wider font-semibold">
            {['ALL', 'WOMEN', 'MEN', 'ACCESSORIES', 'NEW ARRIVALS', 'SALE'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedGridCategory(cat)}
                className={`px-3.5 py-1.5 transition-all cursor-pointer border ${
                  selectedGridCategory === cat
                    ? 'border-[#B8FF00] bg-[#B8FF00] text-[#090909]'
                    : 'border-[#292929] bg-[#111111] text-[#A6A6A6] hover:text-[#F5F5F5] hover:border-[#404040]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Col Desktop / 3 Col Tablet / 2 Col Mobile Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredGridProducts.slice(0, 8).map((product) => (
            <ProductCard
              key={`grid-${product.id}`}
              product={product}
              showQuickAdd={true}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            to="/shop"
            data-cursor="explore"
            className="alt-btn-secondary"
          >
            <span>EXPLORE FULL ATELIER CATALOGUE</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ========================================================
          SECTION 7 — EDITORIAL STORYTELLING
          Atelier craftsmanship, noble textiles, verified facts
      ======================================================== */}
      <section className="py-20 md:py-28 px-4 sm:px-8 md:px-12 lg:px-20 border-b border-[#292929] bg-[#111111]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#B8FF00] block">
              THE ATELIER ETHOS
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-[#F5F5F5] leading-[1.02]">
              CRAFTED FOR PERMANENT DEFIANCE.
            </h2>
            <div className="space-y-4 text-sm md:text-base text-[#A6A6A6] font-light leading-relaxed">
              <p>
                AUREVA was conceived as a weapon against disposable micro-trends. We craft garments with anatomical precision, weighted virgin wools, raw hardware, and dark subcultural authority.
              </p>
              <p>
                Every pattern is drafted in our Paris atelier and executed in partnership with master weavers in Biella and Lyon, producing garments that improve with age, wear, and kinetic stride.
              </p>
            </div>

            <div className="pt-4 grid grid-cols-2 gap-4 border-t border-[#292929]">
              <div>
                <span className="font-condensed font-bold text-xl uppercase text-[#F5F5F5] block">BIELLA VIRGIN WOOL</span>
                <span className="text-[11px] font-mono tracking-wider uppercase text-[#737373]">Dense Double-Faced Weave</span>
              </div>
              <div>
                <span className="font-condensed font-bold text-xl uppercase text-[#F5F5F5] block">TUSCAN SADDLE LEATHER</span>
                <span className="text-[11px] font-mono tracking-wider uppercase text-[#737373]">Vegetable-Tanned Finish</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative aspect-[4/5] overflow-hidden bg-[#171717] border border-[#292929]">
            <img
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1600&q=88"
              alt="Atelier Draping & Tailoring"
              className="w-full h-full object-cover object-top filter contrast-110 brightness-95"
            />
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 8 — MINIMAL PREMIUM NEWSLETTER
          Connected to backend API (/api/newsletter/subscribe)
      ======================================================== */}
      <section className="py-20 md:py-28 px-4 sm:px-8 md:px-12 lg:px-20 border-b border-[#292929] bg-[#090909]">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <span className="text-[10px] font-mono tracking-[0.35em] uppercase text-[#B8FF00] block">
            SALON PRIVÉ // JOIN THE COVEN
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-[#F5F5F5]">
            ENTER THE WORLD OF AUREVA.
          </h2>
          <p className="text-sm md:text-base text-[#A6A6A6] font-light leading-relaxed max-w-lg mx-auto">
            Receive private exhibition invitations, secret monograph releases, and 15% courtesy applied on your inaugural piece with code <strong className="font-mono text-[#B8FF00]">AUREVA15</strong>.
          </p>

          <div className="pt-4 max-w-lg mx-auto">
            <NewsletterForm variant="dark" />
          </div>
        </div>
      </section>

      {/* Modal for quick viewing any piece */}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          isOpen={Boolean(quickViewProduct)}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  )
}
