import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowRight, Check, Copy } from 'lucide-react'
import { PRODUCTS } from '../data/products'
import ProductCard from '../components/product/ProductCard'
import Button from '../components/ui/Button'
import NewsletterForm from '../components/common/NewsletterForm'

export default function HomePage() {
  // Products segregation
  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 4)
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 4)

  // Launch offer interactive copy state
  const [copiedCode, setCopiedCode] = useState(false)

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('AUREVA15')
    }
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2500)
  }

  return (
    <div className="space-y-24 sm:space-y-36">
      {/* =========================================================================
          HERO SECTION: Cinematic Editorial Fashion Campaign
          Monumental typography, controlled negative space, restrained burgundy accent
          ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8" aria-label="Hero Campaign">
        <div className="max-w-7xl mx-auto">
          {/* Top Overline and Paris Studio Coordinates */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#171717]/15 pb-4 mb-8 sm:mb-12 gap-2">
            <div>
              <span className="tag-overline text-[#6D202D]">AUTUMN / WINTER 2026</span>
              <p className="text-xs uppercase tracking-[0.25em] text-[#171717]/60 mt-1 font-mono">
                STUDIO CAMPAIGN — MONOGRAPH NO. 04
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[11px] font-mono tracking-widest text-[#171717]/50">
                48.8566° N, 2.3522° E (PARIS ATELIER)
              </span>
            </div>
          </div>

          {/* Hero Main Grid: Asymmetrical editorial composition */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-5 space-y-7 sm:space-y-9 order-2 lg:order-1">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#6D202D] text-[#FFFFFF] text-[10px] tracking-[0.28em] uppercase px-3 py-1 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  <span>RUNWAY MONOGRAPH</span>
                </div>
                <h1 className="editorial-title text-4xl sm:text-6xl xl:text-7xl font-serif text-[#171717] tracking-tight leading-[0.95]">
                  STYLE WITHOUT <br />
                  <span className="italic font-light text-[#6D202D]">BOUNDARIES.</span>
                </h1>
              </div>

              <p className="font-serif text-lg sm:text-xl text-[#171717]/80 leading-relaxed font-light max-w-lg">
                An architectural dialogue between sculpted structure and effortless drape — handcrafted for individuals who inhabit space with quiet intention.
              </p>

              <div className="pt-2 flex flex-wrap gap-4 items-center">
                <Button variant="primary" size="lg" to="/shop">
                  DISCOVER THE COLLECTION
                </Button>
                <Button variant="secondary" size="lg" to="/about">
                  THE MANIFESTO
                </Button>
              </div>

              {/* Atelier Specs & Provenance */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#171717]/15">
                <div>
                  <span className="block font-serif text-xl sm:text-2xl text-[#171717]">100%</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#171717]/60 block mt-0.5">Virgin Merino</span>
                </div>
                <div>
                  <span className="block font-serif text-xl sm:text-2xl text-[#171717]">04</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#171717]/60 block mt-0.5">Monograph Edit</span>
                </div>
                <div>
                  <span className="block font-serif text-xl sm:text-2xl text-[#171717]">Ltd</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#171717]/60 block mt-0.5">Numbered Batches</span>
                </div>
              </div>
            </div>

            {/* Right Monumental Visual Column */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="relative">
                {/* Main Hero Photograph with deliberate crop & subtle hover effect */}
                <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] overflow-hidden bg-[#ECE5D8] border border-[#171717]/20 group">
                  <img
                    src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=88"
                    alt="AUREVA Runway Campaign Look 01 Editorial Silhouette"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1400&q=85'
                    }}
                    className="w-full h-full object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-103"
                  />

                  {/* Overlaid Look Information Plate */}
                  <div className="absolute bottom-4 left-4 right-4 bg-[#171717]/90 backdrop-blur-md p-4 text-[#F6F2EA] flex items-center justify-between border border-[#F6F2EA]/15">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.24em] text-[#D8D0C4]">LOOK 01 / AUTUMN 2026</p>
                      <p className="font-serif text-sm sm:text-base tracking-wide mt-0.5">Sculptural Cocoon Silhouette in Biella Wool</p>
                    </div>
                    <Link
                      to="/product/aur-01"
                      className="p-2.5 bg-[#F6F2EA]/10 hover:bg-[#6D202D] text-[#F6F2EA] transition-colors"
                      aria-label="Inspect look details for Sculptural Wool Cocoon Coat"
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </div>
                </div>

                {/* Overlaid Floating Batch Tag */}
                <div className="hidden sm:block absolute -top-4 -right-4 bg-[#F6F2EA] border border-[#171717] px-4 py-2 text-[10px] tracking-[0.25em] uppercase font-mono shadow-sm">
                  EDITION: 42 PIECES WORLDWIDE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: New Season Campaign with Distinctive Editorial Layout
          Asymmetrical diptych, studio monograph notes, textile study
          ========================================================================= */}
      <section id="campaign" className="px-4 sm:px-6 lg:px-8" aria-label="New Season Campaign">
        <div className="max-w-7xl mx-auto border-t border-[#171717]/15 pt-16 sm:pt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="tag-overline text-[#6D202D]">CAMPAIGN 04 MONOGRAPH</span>
              <h2 className="editorial-title text-3xl sm:text-5xl font-serif text-[#171717] mt-1">
                Brutal Poetics
              </h2>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#171717]/60 max-w-sm">
              An exploration of architectural weight contrasted with fragile human motion.
            </p>
          </div>

          {/* Distinctive Asymmetric Editorial Diptych */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left Large Portrait Campaign Visual */}
            <div className="lg:col-span-7 relative group">
              <div className="aspect-[3/4] sm:aspect-[4/3] lg:aspect-[3/4] overflow-hidden bg-[#ECE5D8] border border-[#171717]/20">
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1400&q=85"
                  alt="AUREVA Brutal Poetics Campaign Study"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85'
                  }}
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-104"
                />
              </div>
              <div className="absolute top-6 left-6 bg-[#171717] text-[#F6F2EA] px-3 py-1.5 text-[9px] uppercase tracking-[0.25em] font-mono">
                FIG. 01 — ARCHITECTURAL DRAPE
              </div>
            </div>

            {/* Right Detailed Editorial Panel */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
              {/* Secondary Texture & Detail Photograph */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#2B2B2B] border border-[#171717]/20 group">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85"
                  alt="AUREVA Material Detail and Poplin Structure"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-104"
                />
                <div className="absolute bottom-3 right-3 bg-[#F6F2EA] text-[#171717] px-3 py-1 text-[9px] uppercase tracking-[0.2em] font-mono">
                  BIELLA WEAVE / 720 GSM
                </div>
              </div>

              {/* Editorial Critique & Craft Notes */}
              <div className="space-y-5 bg-[#FAF8F5] border border-[#171717]/15 p-6 sm:p-8">
                <span className="text-[10px] tracking-[0.25em] uppercase text-[#6D202D] font-mono block">
                  ATELIER MONOGRAPH EXCERPT
                </span>
                <p className="font-serif text-lg sm:text-xl text-[#171717] leading-relaxed italic">
                  "Cloth is not simply covering; it is a portable monument that reshapes how one navigates space."
                </p>
                <p className="text-xs text-[#171717]/70 leading-relaxed font-sans">
                  Cut from double-faced virgin wool and crisp poplins, Collection 04 abandons ornamental distraction in favor of monumental lines, sharp single-breasted wraps, and raw-finished hems.
                </p>
                <div className="pt-2 flex items-center gap-4">
                  <Button variant="primary" size="md" to="/shop?filter=collections">
                    EXPLORE MONOGRAPH
                  </Button>
                  <Button variant="text" size="sm" to="/product/aur-01">
                    VIEW LOOK 01
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: Shop by Category: Women, Men and Accessories
          3 distinct panels with subtle zoom transitions and structured links
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8" aria-label="Shop by Category">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#171717]/15 pb-6 mb-12 gap-4">
            <div>
              <span className="tag-overline text-[#6D202D]">CURATED DEPARTMENTS</span>
              <h2 className="editorial-title text-3xl sm:text-5xl font-serif text-[#171717] mt-1">
                Shop By Category
              </h2>
            </div>
            <p className="text-xs text-[#171717]/60 tracking-wider uppercase font-mono">
              THREE DISCIPLINARY STUDIES IN READY-TO-WEAR
            </p>
          </div>

          {/* 3 Structured Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Category 1: Women */}
            <Link
              to="/shop?category=Women"
              className="group relative flex flex-col bg-[#ECE5D8] border border-[#171717]/20 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D202D]"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85"
                  alt="AUREVA Women Ready-to-Wear Category"
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-106"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute bottom-6 left-6 right-6 text-[#F6F2EA] space-y-2">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-[#D8D0C4] font-mono block">
                    DEPARTMENT 01
                  </span>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-3xl sm:text-4xl tracking-wide">Women</h3>
                    <div className="h-8 w-8 rounded-full bg-[#F6F2EA]/20 flex items-center justify-center group-hover:bg-[#6D202D] transition-colors">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                  <p className="text-xs text-[#D8D0C4] font-sans">
                    Sculpted tailoring, cocoon outerwear & fluid column dresses.
                  </p>
                </div>
              </div>
            </Link>

            {/* Category 2: Men */}
            <Link
              to="/shop?category=Men"
              className="group relative flex flex-col bg-[#ECE5D8] border border-[#171717]/20 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D202D]"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85"
                  alt="AUREVA Men Ready-to-Wear Category"
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-106"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute bottom-6 left-6 right-6 text-[#F6F2EA] space-y-2">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-[#D8D0C4] font-mono block">
                    DEPARTMENT 02
                  </span>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-3xl sm:text-4xl tracking-wide">Men</h3>
                    <div className="h-8 w-8 rounded-full bg-[#F6F2EA]/20 flex items-center justify-center group-hover:bg-[#6D202D] transition-colors">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                  <p className="text-xs text-[#D8D0C4] font-sans">
                    Drop-shoulder car coats, architectural trousers & raw cashmere.
                  </p>
                </div>
              </div>
            </Link>

            {/* Category 3: Accessories */}
            <Link
              to="/shop?category=Accessories"
              className="group relative flex flex-col bg-[#ECE5D8] border border-[#171717]/20 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D202D]"
            >
              <div className="aspect-[4/5] overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85"
                  alt="AUREVA Accessories and Leather Objects"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171717]/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute bottom-6 left-6 right-6 text-[#F6F2EA] space-y-2">
                  <span className="text-[10px] tracking-[0.25em] uppercase text-[#D8D0C4] font-mono block">
                    DEPARTMENT 03
                  </span>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-3xl sm:text-4xl tracking-wide">Accessories</h3>
                    <div className="h-8 w-8 rounded-full bg-[#F6F2EA]/20 flex items-center justify-center group-hover:bg-[#6D202D] transition-colors">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                  <p className="text-xs text-[#D8D0C4] font-sans">
                    Vegetal-tanned Tuscan leather totes, pouches & chisel derbies.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: New Arrivals Product Grid with Working Product Links
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8" aria-label="New Arrivals">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#171717]/15 pb-6 mb-12 gap-4">
            <div>
              <span className="tag-overline text-[#6D202D]">AUTUMN / WINTER 2026</span>
              <h2 className="editorial-title text-3xl sm:text-5xl font-serif text-[#171717] mt-1">
                New Arrivals
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <p className="text-xs text-[#171717]/60 max-w-xs font-sans hidden md:block">
                Latest cuts forged in our Northern Italy, Porto, and Florence partner ateliers.
              </p>
              <Button variant="text" to="/shop?filter=new" size="sm">
                View All New Arrivals
              </Button>
            </div>
          </div>

          {/* Product Cards Grid: 4 New Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: Featured Best Sellers
          Permanent Atelier icons that anchor the wardrobe
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8" aria-label="Featured Best Sellers">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#171717]/15 pb-6 mb-12 gap-4">
            <div>
              <span className="tag-overline text-[#6D202D]">PERMANENT ATELIER ICONS</span>
              <h2 className="editorial-title text-3xl sm:text-5xl font-serif text-[#171717] mt-1">
                Featured Best Sellers
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <p className="text-xs text-[#171717]/60 max-w-xs font-sans hidden md:block">
                Archetypes perfected over hundreds of hours of live fitting revisions.
              </p>
              <Button variant="text" to="/shop" size="sm">
                View All Best Sellers
              </Button>
            </div>
          </div>

          {/* Product Cards Grid: 4 Permanent Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: Large Visual Campaign: "LESS ORDINARY. MORE YOU."
          Monumental full-bleed editorial aesthetic with authentic fashion photograph
          ========================================================================= */}
      <section className="relative px-4 sm:px-6 lg:px-8" aria-label="Campaign Statement">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden bg-[#171717] text-[#F6F2EA] border border-[#171717] min-h-[520px] sm:min-h-[640px] flex items-center">
            {/* Background Campaign Visual */}
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2000&q=90"
              alt="AUREVA Less Ordinary More You Campaign Editorial"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-luminosity hover:scale-102 transition-transform duration-1000"
            />
            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#171717] via-[#171717]/80 to-transparent" />

            {/* Campaign Statement Content */}
            <div className="relative z-10 p-8 sm:p-16 lg:p-20 max-w-2xl space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#6D202D] text-[#FFFFFF] px-3.5 py-1 text-[10px] tracking-[0.28em] uppercase font-semibold">
                EDITORIAL MANIFESTO
              </div>

              <h2 className="editorial-title text-4xl sm:text-6xl lg:text-7xl font-serif text-[#F6F2EA] tracking-tight leading-[0.98]">
                LESS ORDINARY. <br />
                <span className="italic font-light text-[#D8D0C4]">MORE YOU.</span>
              </h2>

              <p className="font-serif text-lg sm:text-xl text-[#F6F2EA]/85 font-light leading-relaxed">
                True luxury is neither ostentatious nor conformist. It is the quiet sovereignty of wearing garments sculpted with unyielding conviction and noble, unadorned materials.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <Button variant="primary" size="lg" to="/shop" className="bg-[#F6F2EA] text-[#171717] border-[#F6F2EA] hover:bg-[#6D202D] hover:text-[#FFFFFF] hover:border-[#6D202D]">
                  EXPLORE THE EDITORIAL
                </Button>
                <Button variant="secondary" size="lg" to="/contact" className="text-[#F6F2EA] border-[#F6F2EA]/40 hover:bg-[#F6F2EA] hover:text-[#171717]">
                  PRIVATE APPOINTMENT
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: Brand Philosophy Section Introducing AUREVA
          Alternating dark section for dramatic visual cadence
          ========================================================================= */}
      <section className="bg-[#171717] text-[#F6F2EA] py-24 sm:py-32" aria-label="Brand Philosophy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Visual Craft Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[3/4] overflow-hidden border border-[#F6F2EA]/20 bg-[#2B2B2B]">
                <img
                  src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85"
                  alt="AUREVA Pattern Cutting Precision and Fiber Selection"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-4 sm:right-6 bg-[#6D202D] text-[#FFFFFF] p-6 max-w-xs border border-[#F6F2EA]/20 hidden sm:block">
                <span className="tag-overline text-[#D8D0C4]">ATELIER ARCHIVE</span>
                <p className="font-serif text-sm mt-1">
                  180 fitting revisions to achieve the exact shoulder balance.
                </p>
              </div>
            </div>

            {/* Narrative & Three Pillars Column */}
            <div className="lg:col-span-7 space-y-8 lg:pl-6">
              <div className="space-y-3">
                <span className="tag-overline text-[#D8D0C4]">INTRODUCING AUREVA</span>
                <h2 className="editorial-title text-3xl sm:text-5xl font-serif text-[#F6F2EA]">
                  The Architecture <br />
                  <span className="italic text-[#D8D0C4]">of Modern Garments.</span>
                </h2>
              </div>

              <p className="font-serif text-base sm:text-lg text-[#F6F2EA]/80 font-light leading-relaxed">
                Founded in Paris and informed by brutalist architectural theory, AUREVA crafts ready-to-wear silhouettes that treat cloth as spatial structure. We reject ephemeral fashion cycles in pursuit of garments engineered to outlive the season.
              </p>

              {/* Three Pillars */}
              <div className="space-y-6 pt-4 border-t border-[#F6F2EA]/15">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#6D202D] font-bold">01</span>
                    <h3 className="font-serif text-lg text-[#F6F2EA]">Sculptural Volume & Drape</h3>
                  </div>
                  <p className="text-xs text-[#F6F2EA]/65 leading-relaxed pl-7">
                    Engineered drop shoulders, concealed fastenings, and generous pleats designed to create kinetic volume when in motion.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#6D202D] font-bold">02</span>
                    <h3 className="font-serif text-lg text-[#F6F2EA]">Noble Provenance & Raw Fibers</h3>
                  </div>
                  <p className="text-xs text-[#F6F2EA]/65 leading-relaxed pl-7">
                    Virgin merino wool from Biella, organic GOTS cotton poplin, and vegetable-tanned Tuscan bridle leather with zero synthetic additives.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#6D202D] font-bold">03</span>
                    <h3 className="font-serif text-lg text-[#F6F2EA]">Numbered Editions & Permanent Care</h3>
                  </div>
                  <p className="text-xs text-[#F6F2EA]/65 leading-relaxed pl-7">
                    Crafted in limited serialized batches with lifetime seam maintenance, offering permanence over planned obsolescence.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Button variant="oxblood" size="md" to="/about">
                  READ OUR STORY & MANIFESTO
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  to="/shop"
                  className="text-[#F6F2EA] border-[#F6F2EA] hover:bg-[#F6F2EA] hover:text-[#171717]"
                >
                  VIEW ALL SILHOUETTES
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: Promotional Strip for a Launch Offer
          Interactive code copy button with tactile visual confirmation
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8" aria-label="Inaugural Launch Privilege">
        <div className="max-w-7xl mx-auto border border-[#171717]/20 bg-[#FAF8F5] p-8 sm:p-12 relative overflow-hidden">
          {/* Subtle Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#6D202D]" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#6D202D] font-mono font-semibold">
                INAUGURAL SALON PRIVILEGE
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#171717]">
                Enjoy 15% Courtesy on Your Inaugural Order
              </h3>
              <p className="text-xs text-[#171717]/70 leading-relaxed font-sans">
                In celebration of our international salon launch, apply privilege code at checkout. Valid across all Permanent and Monograph collections. Complimentary express worldwide courier included.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
              {/* Copy Code Interactive Box */}
              <div className="flex items-center border border-[#171717] bg-[#F6F2EA] px-4 py-3 justify-between gap-4">
                <span className="font-mono text-sm tracking-widest font-bold text-[#171717]">
                  AUREVA15
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold text-[#6D202D] hover:text-[#171717] transition-colors cursor-pointer"
                  aria-label="Copy launch privilege promo code"
                >
                  {copiedCode ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span className="text-emerald-600">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>COPY CODE</span>
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
          SECTION 8: Newsletter Signup with Validation & Visible Feedback
          The Atelier Dispatch: rigorous syntax checks, instant state feedback
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8" aria-label="Atelier Dispatch Newsletter">
        <div className="max-w-4xl mx-auto border border-[#171717]/20 bg-[#FAF8F5] p-8 sm:p-14 space-y-8 text-center">
          <div className="space-y-3 max-w-xl mx-auto">
            <span className="tag-overline text-[#6D202D]">PRIVATE SALON ACCESS</span>
            <h2 className="editorial-title text-3xl sm:text-4xl font-serif text-[#171717]">
              Join The Atelier Dispatch
            </h2>
            <p className="text-xs text-[#171717]/70 leading-relaxed">
              Subscribers receive advance invitations to private monograph presentations, limited edition allocations, and editorial monographs before public release.
            </p>
          </div>

          {/* Shared NewsletterForm with consistent validation and demo feedback */}
          <NewsletterForm variant="light" className="max-w-md mx-auto" />
        </div>
      </section>
    </div>
  )
}
