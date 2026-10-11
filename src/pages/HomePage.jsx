import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowUpRight, ArrowRight, Check, Copy, Sparkles, Eye, ZoomIn, ShieldCheck, Compass, MoveDown } from 'lucide-react'
import { PRODUCTS } from '../data/products'
import ProductCard from '../components/product/ProductCard'
import ProductQuickViewModal from '../components/product/ProductQuickViewModal'
import Button from '../components/ui/Button'
import NewsletterForm from '../components/common/NewsletterForm'
import { formatCurrency } from '../utils/formatters'
import PageTransition from '../components/motion/PageTransition'
import TextReveal from '../components/motion/TextReveal'
import FadeInView from '../components/motion/FadeInView'
import TiltCard from '../components/motion/TiltCard'

const RUNWAY_LOOKS = [
  {
    id: 'look-01',
    lookNumber: 'LOOK 01',
    title: 'The Parisian Cocoon',
    subtitle: 'Virgin Merino Wool & Architectural Volume',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=88',
    model: '179cm / Size S (EU 36)',
    location: 'Palais de Tokyo, Paris',
    description: 'Sculpted from 720 GSM double-faced virgin wool, featuring dropped structural shoulders that contour into an exaggerated cocoon envelope.',
    featuredProductId: 'aur-01',
    hotspots: [
      {
        x: 48,
        y: 38,
        label: 'Cocoon Collar',
        detail: 'Exaggerated notched lapel with storm tab',
      },
      {
        x: 52,
        y: 65,
        label: 'Double-Faced Seam',
        detail: 'Unlined Biella merino with raw-edge finish',
      },
    ],
  },
  {
    id: 'look-02',
    lookNumber: 'LOOK 02',
    title: 'Deconstructed Modernity',
    subtitle: 'Asymmetric GOTS Poplin & Linear Drape',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1600&q=88',
    model: '181cm / Size M (EU 38)',
    location: 'Fondazione Prada, Milan',
    description: 'High-density crisp organic poplin with prolonged knuckle-length cuffs and an architectural asymmetric bib.',
    featuredProductId: 'aur-02',
    hotspots: [
      {
        x: 46,
        y: 35,
        label: 'Asymmetric Storm Bib',
        detail: '140 GSM high-density organic cotton poplin',
      },
      {
        x: 58,
        y: 60,
        label: 'Elongated Cuffs',
        detail: 'Tailored to gather effortlessly over the knuckles',
      },
    ],
  },
  {
    id: 'look-03',
    lookNumber: 'LOOK 03',
    title: 'Silk Velvet & Shadow',
    subtitle: 'Fluid Nocturnal Column with Raw Brass Accents',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=88',
    model: '178cm / Size S (EU 36)',
    location: 'Roppongi Atelier, Tokyo',
    description: 'Mulberry silk velvet that absorbs and refracts ambient nocturnal light, cut on the true bias for monumental kinetic movement.',
    featuredProductId: 'aur-04',
    hotspots: [
      {
        x: 50,
        y: 32,
        label: 'Bias Cut Bodice',
        detail: 'Crafted in Lyon, France from pure silk velvet',
      },
      {
        x: 52,
        y: 72,
        label: 'Floor Column Hem',
        detail: 'Weighted perimeter ensuring a sharp vertical drape',
      },
    ],
  },
  {
    id: 'look-04',
    lookNumber: 'LOOK 04',
    title: 'Brutalist Monolith Blazer',
    subtitle: 'Structured Shoulders & Tuscan Bridle Leather',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=88',
    model: '183cm / Size L (EU 40)',
    location: 'Chelsea Gallery, New York',
    description: 'A sculptural exploration of power tailoring with sharp square shoulders, concealed double-breasted placket, and deep jet pockets.',
    featuredProductId: 'aur-07',
    hotspots: [
      {
        x: 45,
        y: 38,
        label: 'Sculpted Shoulder',
        detail: 'Multi-layer horsehair canvas internal structure',
      },
      {
        x: 54,
        y: 68,
        label: 'Flapless Jet Pockets',
        detail: 'Ultra-clean architectural front silhouette',
      },
    ],
  },
]

export default function HomePage() {
  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 4)
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 4)

  const [activeLookIndex, setActiveLookIndex] = useState(0)
  const [activeHotspot, setActiveHotspot] = useState(null)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [copiedCode, setCopiedCode] = useState(false)

  // Mouse-driven subtle parallax for hero artwork
  const heroMouseX = useMotionValue(0)
  const heroMouseY = useMotionValue(0)
  const heroParallaxX = useSpring(heroMouseX, { damping: 28, stiffness: 100 })
  const heroParallaxY = useSpring(heroMouseY, { damping: 28, stiffness: 100 })

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - (rect.left + rect.width / 2)) / 32
    const y = (e.clientY - (rect.top + rect.height / 2)) / 32
    heroMouseX.set(x)
    heroMouseY.set(y)
  }

  const handleHeroMouseLeave = () => {
    heroMouseX.set(0)
    heroMouseY.set(0)
  }

  const activeLook = RUNWAY_LOOKS[activeLookIndex]
  const lookProduct = PRODUCTS.find((p) => p.id === activeLook.featuredProductId) || PRODUCTS[0]

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('AUREVA15')
    }
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2500)
  }

  return (
    <PageTransition className="space-y-28 sm:space-y-36">
      {/* =========================================================================
          HERO SECTION: Neo-Luxury Noir Runway Campaign
          Interactive mouse parallax, staggered typography, atmospheric wordmark
          ========================================================================= */}
      <section
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
        className="relative px-4 sm:px-6 lg:px-8 pt-4 sm:pt-10 overflow-hidden"
        aria-label="Hero Campaign"
      >
        {/* Cinematic Watermark Wordmark */}
        <div
          aria-hidden="true"
          className="absolute -top-10 sm:-top-16 left-1/2 -translate-x-1/2 select-none pointer-events-none opacity-[0.035] overflow-hidden whitespace-nowrap z-0"
        >
          <motion.span
            initial={{ letterSpacing: '0.4em', opacity: 0 }}
            animate={{ letterSpacing: '0.65em', opacity: 1 }}
            transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-[19vw] font-bold text-white tracking-[0.65em] leading-none block"
          >
            AUREVA
          </motion.span>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Top Overline and Coordinates */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/10 pb-4 mb-8 sm:mb-12 gap-2">
            <FadeInView direction="down" delay={0.1}>
              <span className="tag-overline text-[#D4AF37] font-mono">AUTUMN / WINTER 2026</span>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400 mt-1 font-mono">
                STUDIO RUNWAY — MONOGRAPH NO. 04
              </p>
            </FadeInView>
            <FadeInView direction="down" delay={0.2} className="text-right hidden sm:block">
              <span className="text-[11px] font-mono tracking-widest text-gray-500">
                48.8566° N, 2.3522° E (PARIS ATELIER)
              </span>
            </FadeInView>
          </div>

          {/* Hero Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-5 space-y-7 sm:space-y-9 order-2 lg:order-1">
              <div className="space-y-4">
                <FadeInView direction="up" delay={0.15}>
                  <div className="inline-flex items-center gap-2 glass-panel border-[#D4AF37]/30 text-white text-[10px] tracking-[0.28em] uppercase px-3 py-1 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                    <span className="text-[#D4AF37]">RUNWAY MONOGRAPH</span>
                  </div>
                </FadeInView>

                {/* Staggered Word Reveal Headline */}
                <h1 className="editorial-title text-4xl sm:text-6xl xl:text-7xl font-serif text-white tracking-tight leading-[0.94]">
                  <TextReveal text="STYLE WITHOUT" delay={0.2} />
                  <br />
                  <span className="italic font-light gold-gradient-text inline-block">
                    <TextReveal text="BOUNDARIES." delay={0.35} />
                  </span>
                </h1>
              </div>

              <FadeInView direction="up" delay={0.3}>
                <p className="font-serif text-lg sm:text-xl text-gray-300 leading-relaxed font-light max-w-lg">
                  An architectural dialogue between sculpted structure and effortless drape — handcrafted for individuals who inhabit space with quiet intention.
                </p>
              </FadeInView>

              <FadeInView direction="up" delay={0.4} className="pt-2 flex flex-wrap gap-4 items-center">
                <Button variant="primary" size="lg" to="/shop" magnetic>
                  DISCOVER THE COLLECTION
                </Button>
                <Button variant="secondary" size="lg" to="/about">
                  THE MANIFESTO
                </Button>
              </FadeInView>

              {/* Atelier Specs in Liquid Glass */}
              <FadeInView direction="up" delay={0.5}>
                <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10">
                  <div className="glass-panel p-3 border-white/5 hover:border-[#D4AF37]/30 transition-colors">
                    <span className="block font-serif text-xl sm:text-2xl text-white">100%</span>
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 font-mono block mt-0.5">Virgin Merino</span>
                  </div>
                  <div className="glass-panel p-3 border-white/5 hover:border-[#D4AF37]/30 transition-colors">
                    <span className="block font-serif text-xl sm:text-2xl text-[#D4AF37]">04</span>
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 font-mono block mt-0.5">Monograph Edit</span>
                  </div>
                  <div className="glass-panel p-3 border-white/5 hover:border-[#D4AF37]/30 transition-colors">
                    <span className="block font-serif text-xl sm:text-2xl text-white">Ltd</span>
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 font-mono block mt-0.5">Numbered Batches</span>
                  </div>
                </div>
              </FadeInView>
            </div>

            {/* Right Monumental Visual Column with Subtle Mouse Parallax */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <TiltCard maxTilt={5} scaleOnHover={1.01} className="relative">
                {/* Main Hero Photograph with Liquid Glass Frame */}
                <motion.div
                  style={{ x: heroParallaxX, y: heroParallaxY }}
                  className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] overflow-hidden bg-[#121522] border border-white/10 group shadow-2xl"
                  data-cursor="explore"
                >
                  <img
                    src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=88"
                    alt="AUREVA Runway Campaign Look 01 Editorial Silhouette"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1400&q=85'
                    }}
                    className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-104"
                  />

                  {/* Overlaid Look Information Plate in Frosted Glass */}
                  <div className="absolute bottom-4 left-4 right-4 glass-panel bg-[#0B0D15]/85 backdrop-blur-xl p-4 text-white flex items-center justify-between border border-white/15">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.24em] text-[#D4AF37] font-mono">LOOK 01 / AUTUMN 2026</p>
                      <p className="font-serif text-sm sm:text-base tracking-wide mt-0.5 text-gray-200">Sculptural Cocoon Silhouette in Biella Wool</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(PRODUCTS.find(p => p.id === 'aur-01') || PRODUCTS[0])}
                      className="p-2.5 gold-gradient-bg text-[#08090D] hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                      title="Quick inspect this piece"
                      aria-label="Inspect look details"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </motion.div>

                {/* Overlaid Floating Batch Tag */}
                <div className="hidden sm:block absolute -top-4 -right-4 glass-panel-gold bg-[#0E1018] px-4 py-2 text-[10px] tracking-[0.25em] uppercase font-mono text-[#D4AF37] shadow-xl">
                  EDITION: 42 PIECES WORLDWIDE
                </div>
              </TiltCard>
            </div>
          </div>

          {/* Animated Scroll Down Indicator */}
          <div className="pt-12 sm:pt-16 flex items-center justify-between text-xs font-mono text-gray-500 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="h-8 w-4 border border-white/20 rounded-full flex justify-center p-0.5">
                <motion.div
                  animate={{ y: [0, 9, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                  className="h-1.5 w-1 rounded-full bg-[#D4AF37]"
                />
              </div>
              <span className="text-[10px] tracking-[0.24em] uppercase text-gray-400">SCROLL TO IMMERSE</span>
            </div>
            <span className="hidden sm:inline text-[10px] tracking-[0.26em] text-gray-500 font-mono">
              PARIS ATELIER • ALLOCATIONS ACTIVE
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: THE INTERACTIVE RUNWAY LOOKBOOK & STUDIO EXHIBITION
          Interactive look tabs, visual hotspots, fabric specs, and quick inspect
          ========================================================================= */}
      <section id="lookbook" className="px-4 sm:px-6 lg:px-8 relative" aria-label="Runway Lookbook">
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-16 sm:pt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-ping" />
                <span className="tag-overline text-[#D4AF37] font-mono">INTERACTIVE STUDIO EXHIBITION</span>
              </div>
              <h2 className="editorial-title text-3xl sm:text-5xl font-serif text-white mt-1">
                Runway Lookbook No. 04
              </h2>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 max-w-sm font-mono">
              INTERACTIVE HOTSPOTS • CLICK PINS ON SILHOUETTES TO INSPECT WEAVE
            </p>
          </div>

          {/* Look Navigation Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-white/10">
            {RUNWAY_LOOKS.map((look, idx) => (
              <button
                key={look.id}
                type="button"
                onClick={() => {
                  setActiveLookIndex(idx)
                  setActiveHotspot(null)
                }}
                className={`px-5 py-3 text-xs uppercase tracking-[0.2em] font-mono transition-all duration-300 cursor-pointer shrink-0 border ${
                  activeLookIndex === idx
                    ? 'glass-panel-gold border-[#D4AF37] text-white shadow-[0_0_20px_rgba(212,175,55,0.25)]'
                    : 'glass-panel border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={activeLookIndex === idx ? 'text-[#D4AF37] font-bold' : 'text-gray-500'}>
                    0{idx + 1}
                  </span>
                  <span>{look.title}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Interactive Look Main Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Monumental Look Visual with Interactive Hotspot Pins */}
            <div className="lg:col-span-7 relative group">
              <div className="relative aspect-[3/4] sm:aspect-[4/3] lg:aspect-[3/4] overflow-hidden bg-[#10131E] border border-white/10">
                <img
                  src={activeLook.image}
                  alt={activeLook.title}
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-102"
                />

                {/* Hotspot Pins */}
                {activeLook.hotspots.map((hs, i) => (
                  <div
                    key={i}
                    className="absolute z-20"
                    style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveHotspot(activeHotspot === i ? null : i)}
                      aria-label={`Inspect ${hs.label}`}
                      className={`relative flex items-center justify-center h-8 w-8 rounded-full border transition-transform duration-200 cursor-pointer ${
                        activeHotspot === i
                          ? 'bg-[#D4AF37] text-[#08090D] border-white scale-110 shadow-[0_0_15px_rgba(212,175,55,0.8)]'
                          : 'bg-[#08090D]/80 backdrop-blur-md text-[#D4AF37] border-[#D4AF37]/60 hover:scale-110 hover:border-[#D4AF37]'
                      }`}
                    >
                      <span className="font-mono text-[10px] font-bold">0{i + 1}</span>
                      <span className="absolute -inset-1 rounded-full border border-[#D4AF37] opacity-40 animate-ping" />
                    </button>

                    {/* Hotspot Tooltip Popover */}
                    {activeHotspot === i && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-10 z-30 w-56 glass-panel-gold p-3 rounded-xs text-left animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-1 border-b border-white/10">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-[#D4AF37]">
                            {hs.label}
                          </span>
                          <span className="text-[9px] text-gray-400 font-mono">SPEC</span>
                        </div>
                        <p className="text-[11px] text-gray-200 mt-1 font-light leading-snug">
                          {hs.detail}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Look Location Badge */}
                <div className="absolute top-4 left-4 glass-panel px-3 py-1 text-[9px] uppercase tracking-[0.22em] font-mono text-gray-300">
                  {activeLook.location}
                </div>

                {/* Model Stats Badge */}
                <div className="absolute bottom-4 left-4 glass-panel px-3 py-1 text-[9px] uppercase tracking-[0.22em] font-mono text-gray-300">
                  MODEL: {activeLook.model}
                </div>
              </div>
            </div>

            {/* Right Information & Look Piece Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="tag-overline text-[#D4AF37] font-mono">
                  {activeLook.lookNumber} — EDITORIAL CURATION
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl text-white">
                  {activeLook.title}
                </h3>
                <p className="font-serif italic text-base text-gray-400 font-light">
                  {activeLook.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light pt-2">
                  {activeLook.description}
                </p>
              </div>

              {/* Tagged Featured Product Card in Liquid Glass */}
              {lookProduct && (
                <div className="glass-panel-gold p-5 border border-white/15 space-y-4 rounded-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-[#D4AF37]">
                    <span>RUNWAY FEATURED PIECE</span>
                    <span>{lookProduct.id.toUpperCase()}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-[#121522] border border-white/10 overflow-hidden shrink-0">
                      <img
                        src={lookProduct.images[0]}
                        alt={lookProduct.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-serif text-lg text-white leading-tight">
                        {lookProduct.name}
                      </h4>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-base text-white">
                          {formatCurrency(lookProduct.price)}
                        </span>
                        {lookProduct.originalPrice && lookProduct.originalPrice > lookProduct.price && (
                          <span className="text-xs text-gray-500 line-through">
                            {formatCurrency(lookProduct.originalPrice)}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {lookProduct.materials || 'Pure Natural Fibers'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setQuickViewProduct(lookProduct)}
                      className="flex-1 py-2.5 px-4 gold-gradient-bg text-[#08090D] font-mono text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Eye size={13} />
                      <span>QUICK INSPECT PIECE</span>
                    </button>
                    <Link
                      to={`/product/${lookProduct.id}`}
                      className="py-2.5 px-4 glass-panel text-white hover:text-[#D4AF37] border-white/20 font-mono text-[10px] uppercase tracking-widest transition-colors"
                    >
                      DETAILS
                    </Link>
                  </div>
                </div>
              )}

              {/* Hotspot Guide Helper */}
              <div className="glass-panel p-4 border-white/5 flex items-center gap-3 text-xs text-gray-300">
                <Compass size={18} className="text-[#D4AF37] shrink-0" />
                <span className="font-mono text-[10px] tracking-wider text-gray-400">
                  Tap glowing pins 01 and 02 on the photograph above to inspect structural seams, fabric weights, and drape details.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CAMPAIGN MONOGRAPH: Layered Asymmetrical Editorial Section
          Oversized typography, layered overlapping imagery, custom "EXPLORE" cursor
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 relative overflow-hidden" aria-label="Campaign Monograph">
        <div className="max-w-7xl mx-auto">
          <FadeInView direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-12 sm:mb-16 gap-4">
              <div>
                <span className="tag-overline text-[#D4AF37] font-mono">EDITORIAL MONOGRAPH — 04</span>
                <h2 className="editorial-title text-3xl sm:text-6xl font-serif text-white mt-1">
                  The Architecture of Form
                </h2>
              </div>
              <p className="text-xs text-gray-400 tracking-widest uppercase font-mono max-w-xs">
                A DIALOGUE BETWEEN TENSION, BIAS-CUT DRAPE, AND METROPOLITAN SILENCE.
              </p>
            </div>
          </FadeInView>

          {/* Asymmetrical Layered Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Layered Images (Break-the-grid composition) */}
            <div className="lg:col-span-7 relative" data-cursor="explore">
              <FadeInView direction="up" delay={0.15}>
                {/* Primary Hero Campaign Photo with Tilt */}
                <TiltCard maxTilt={5} glare={true} className="aspect-[4/5] sm:aspect-[16/11] w-full overflow-hidden border border-white/10 bg-[#0E1018]">
                  <img
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85"
                    alt="Aureva Autumn Winter Haute Couture Campaign"
                    className="w-full h-full object-cover object-center filter grayscale-[15%] contrast-[1.08] hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090D]/90 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Embedded editorial caption */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white pointer-events-none">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase block">LOOK 04 / PLATE IX</span>
                      <p className="font-serif text-lg sm:text-xl font-light">Structural Bias Trench in Oxblood Silk-Wool</p>
                    </div>
                    <span className="hidden sm:inline font-mono text-[10px] tracking-widest text-gray-400">PALAIS DE TOKYO</span>
                  </div>
                </TiltCard>
              </FadeInView>

              {/* Secondary Overlapping Floating Photo (Layered) */}
              <FadeInView direction="left" delay={0.3} className="absolute -bottom-8 -right-4 sm:-bottom-12 sm:-right-8 w-44 sm:w-64 z-20 shadow-2xl">
                <TiltCard maxTilt={8} className="aspect-[3/4] border border-[#D4AF37]/30 bg-[#141724] p-1.5 backdrop-blur-md">
                  <div className="relative w-full h-full overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=85"
                      alt="Campaign Detail Textile Close-up"
                      className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08090D]/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-wider block">TEXTILE DETAIL</span>
                      <p className="text-[11px] font-mono text-gray-300">Biella 720 GSM Weave</p>
                    </div>
                  </div>
                </TiltCard>
              </FadeInView>
            </div>

            {/* Right Editorial Copy & Quote Column */}
            <div className="lg:col-span-5 space-y-8 lg:pl-6 pt-6 lg:pt-0">
              <FadeInView direction="right" delay={0.2} className="space-y-4">
                <div className="inline-flex items-center gap-2 glass-panel border-[#D4AF37]/30 text-white text-[10px] tracking-[0.28em] uppercase px-3 py-1 font-mono">
                  <Sparkles size={12} className="text-[#D4AF37]" />
                  <span>SEASONAL STATEMENT</span>
                </div>
                <blockquote className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-white font-light leading-snug">
                  "We treat cloth not merely as a garment, but as space sculpted by momentum."
                </blockquote>
                <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
                  Rejecting fast-fashion obsolescence, the Autumn / Winter 2026 monograph was developed across eighteen months of tactile trial in Paris and Biella. Each silhouette balances monumental proportion with weightless kinetic drape.
                </p>
              </FadeInView>

              <FadeInView direction="right" delay={0.3} className="space-y-6 pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel p-4 border-white/10">
                    <span className="font-mono text-[10px] text-[#D4AF37] uppercase tracking-wider block">EDITION RUN</span>
                    <span className="font-serif text-xl sm:text-2xl text-white block mt-1">120 Pieces</span>
                    <span className="text-[10px] text-gray-400 font-mono">Numbered salon certificates</span>
                  </div>
                  <div className="glass-panel p-4 border-white/10">
                    <span className="font-mono text-[10px] text-[#D4AF37] uppercase tracking-wider block">ORIGIN CERTIFIED</span>
                    <span className="font-serif text-xl sm:text-2xl text-white block mt-1">100% Traceable</span>
                    <span className="text-[10px] text-gray-400 font-mono">Piedmont & Lyon Mills</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <Button variant="primary" size="md" to="/shop" magnetic={true}>
                    VIEW MONOGRAPH COLLECTION
                  </Button>
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-gray-300 hover:text-[#D4AF37] transition-colors"
                  >
                    <span>READ ATELIER ESSAY</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </FadeInView>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: Shop by Category: Women, Men and Accessories
          Liquid glass cards with subtle gold glow on hover
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8" aria-label="Shop by Category">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <FadeInView direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-12 gap-4">
              <div>
                <span className="tag-overline text-[#D4AF37] font-mono">CURATED DEPARTMENTS</span>
                <h2 className="editorial-title text-3xl sm:text-5xl font-serif text-white mt-1">
                  Shop By Category
                </h2>
              </div>
              <p className="text-xs text-gray-400 tracking-wider uppercase font-mono">
                THREE DISCIPLINARY STUDIES IN READY-TO-WEAR
              </p>
            </div>
          </FadeInView>

          {/* 3 Structured Category Cards in Liquid Glass */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Category 1: Women */}
            <Link
              to="/shop?category=Women"
              className="group relative flex flex-col bg-[#10131E] border border-white/10 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] hover:border-[#D4AF37]/50 transition-all duration-300"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85"
                  alt="AUREVA Women Ready-to-Wear Category"
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-mono block">
                    DEPARTMENT 01
                  </span>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-3xl sm:text-4xl tracking-wide">Women</h3>
                    <div className="h-8 w-8 rounded-full glass-panel-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowRight size={16} className="text-[#D4AF37]" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 font-light font-serif italic">
                    Cocoon coats, architectural column gowns, and bias tailoring.
                  </p>
                </div>
              </div>
            </Link>

            {/* Category 2: Men */}
            <Link
              to="/shop?category=Men"
              className="group relative flex flex-col bg-[#10131E] border border-white/10 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] hover:border-[#D4AF37]/50 transition-all duration-300"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85"
                  alt="AUREVA Men Ready-to-Wear Category"
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-mono block">
                    DEPARTMENT 02
                  </span>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-3xl sm:text-4xl tracking-wide">Men</h3>
                    <div className="h-8 w-8 rounded-full glass-panel-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowRight size={16} className="text-[#D4AF37]" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 font-light font-serif italic">
                    Single-breasted wool coats, heavy poplin tunics, and wide trousers.
                  </p>
                </div>
              </div>
            </Link>

            {/* Category 3: Accessories */}
            <Link
              to="/shop?category=Accessories"
              className="group relative flex flex-col bg-[#10131E] border border-white/10 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] hover:border-[#D4AF37]/50 transition-all duration-300"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85"
                  alt="AUREVA Leather Objects and Accessories Category"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/30 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-mono block">
                    DEPARTMENT 03
                  </span>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-3xl sm:text-4xl tracking-wide">Objects</h3>
                    <div className="h-8 w-8 rounded-full glass-panel-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowRight size={16} className="text-[#D4AF37]" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 font-light font-serif italic">
                    Tuscan bridle leather totes, raw brass hardware, and silk scarves.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: Featured New Arrivals Grid
          Liquid glass product cards with quick inspect modal
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8" aria-label="New Arrivals">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-12 gap-4">
            <div>
              <span className="tag-overline text-[#D4AF37] font-mono">AUTUMN / WINTER ALLOCATIONS</span>
              <h2 className="editorial-title text-3xl sm:text-5xl font-serif text-white mt-1">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/shop?filter=new"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-[#D4AF37] hover:text-white border-b border-[#D4AF37]/50 pb-0.5 transition-colors font-mono"
            >
              <span>View All Allocations</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: Atelier Materiality & Craft Matrix
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8" aria-label="Haute Couture Craftsmanship">
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-16">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="tag-overline text-[#D4AF37] font-mono">NOBLE TEXTILES</span>
            <h2 className="editorial-title text-3xl sm:text-5xl font-serif text-white">
              The Architecture of Materials
            </h2>
            <p className="text-xs text-gray-400 font-mono tracking-wider">
              ZERO SYNTHETIC FILLERS • UNCOMPROMISING NATURAL INTEGRITY
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 sm:p-8 space-y-4 rounded-xs border-white/10 hover:border-[#D4AF37]/40 transition-colors">
              <span className="font-mono text-xs text-[#D4AF37] font-bold">01 / BIELLA WOOL</span>
              <h3 className="font-serif text-2xl text-white">720 GSM Double-Faced Merino</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-light">
                Sourced from generational mills in Piedmont, Italy. Dense, structural, and unlined, retaining crisp architectural form without stiffening adhesives.
              </p>
            </div>

            <div className="glass-panel p-6 sm:p-8 space-y-4 rounded-xs border-white/10 hover:border-[#D4AF37]/40 transition-colors">
              <span className="font-mono text-xs text-[#D4AF37] font-bold">02 / LYON SILK</span>
              <h3 className="font-serif text-2xl text-white">Pure Mulberry Velvet</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-light">
                Woven on traditional jacquard looms in France. Provides extraordinary depth of tone and fluid kinetic drape under evening lighting.
              </p>
            </div>

            <div className="glass-panel p-6 sm:p-8 space-y-4 rounded-xs border-white/10 hover:border-[#D4AF37]/40 transition-colors">
              <span className="font-mono text-xs text-[#D4AF37] font-bold">03 / TUSCAN BRIDLE</span>
              <h3 className="font-serif text-2xl text-white">Vegetable-Tanned Cowhide</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-light">
                Steeped in chestnut and mimosa tannins for over 40 days. Develops a lustrous, individualized patina that deepens through every voyage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: Best Sellers / Permanent Wardrobe Edit
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8" aria-label="Curated Best Sellers">
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-16">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 mb-12 gap-4">
            <div>
              <span className="tag-overline text-[#D4AF37] font-mono">PERMANENT ARCHIVE</span>
              <h2 className="editorial-title text-3xl sm:text-5xl font-serif text-white mt-1">
                The Icons Edit
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-[#D4AF37] hover:text-white border-b border-[#D4AF37]/50 pb-0.5 transition-colors font-mono"
            >
              <span>Explore All Silhouettes</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {bestSellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: VIP Launch Offer Card in Frosted Liquid Glass
          Interactive copyable privilege code AUREVA15
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8" aria-label="Inaugural Launch Privilege">
        <div className="max-w-7xl mx-auto glass-panel-gold p-8 sm:p-12 relative overflow-hidden rounded-xs border border-white/15 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.25em] uppercase text-[#D4AF37] font-mono font-semibold">
                <Sparkles size={12} />
                <span>INAUGURAL SALON PRIVILEGE</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-white">
                Enjoy 15% Courtesy on Your Inaugural Order
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans">
                In celebration of our international salon launch, apply privilege code at checkout. Valid across all Permanent and Monograph collections. Complimentary express worldwide courier included.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
              {/* Copy Code Interactive Box */}
              <div className="flex items-center glass-panel border-[#D4AF37]/40 px-4 py-3 justify-between gap-4">
                <span className="font-mono text-sm tracking-widest font-bold text-[#D4AF37]">
                  AUREVA15
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold text-white hover:text-[#D4AF37] transition-colors cursor-pointer"
                  aria-label="Copy launch privilege promo code"
                >
                  {copiedCode ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-400 font-mono">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span className="font-mono">COPY CODE</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action Button */}
              <Button variant="primary" size="md" to="/shop">
                SHOP WITH PRIVILEGE
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: Newsletter Signup in Liquid Glass
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8" aria-label="Atelier Dispatch Newsletter">
        <div className="max-w-4xl mx-auto glass-panel p-8 sm:p-14 space-y-8 text-center rounded-xs border-white/10">
          <div className="space-y-3 max-w-xl mx-auto">
            <span className="tag-overline text-[#D4AF37] font-mono">PRIVATE SALON ACCESS</span>
            <h2 className="editorial-title text-3xl sm:text-4xl font-serif text-white">
              Join The Atelier Dispatch
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              Subscribers receive advance invitations to private monograph presentations, limited edition allocations, and editorial monographs before public release.
            </p>
          </div>

          <NewsletterForm variant="dark" className="max-w-md mx-auto" />
        </div>
      </section>

      {/* Persistent Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </PageTransition>
  )
}
