import React, { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, Search, X, SlidersHorizontal, ChevronRight, RotateCcw, Check, ArrowUpDown, Sparkles } from 'lucide-react'
import { PRODUCTS, DEPARTMENTS, CATEGORIES, SIZES, COLORS } from '../data/products'
import ProductCard from '../components/product/ProductCard'
import ProductQuickViewModal from '../components/product/ProductQuickViewModal'
import Button from '../components/ui/Button'
import { formatCurrency } from '../utils/formatters'

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Extract URL parameters
  const initialDepartment = searchParams.get('department') || 'All'
  const initialCategory = searchParams.get('category') || 'All'
  const initialFilter = searchParams.get('filter') || ''
  const initialSearch = searchParams.get('search') || ''

  // Filter States
  const [selectedDepartment, setSelectedDepartment] = useState(initialDepartment)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedSize, setSelectedSize] = useState('All')
  const [selectedColor, setSelectedColor] = useState('All')
  // Calculate dynamic catalog price bounds
  const minCatalogPrice = useMemo(() => Math.min(...PRODUCTS.map((p) => p.price)), [])
  const maxCatalogPrice = useMemo(() => Math.max(...PRODUCTS.map((p) => p.price)), [])

  const [priceRange, setPriceRange] = useState(maxCatalogPrice)
  const [saleOnly, setSaleOnly] = useState(initialFilter === 'sale')
  const [newOnly, setNewOnly] = useState(initialFilter === 'new' || initialFilter === 'new-arrivals')
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [sortBy, setSortBy] = useState('featured')

  // Mobile filter drawer state & Quick View state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  // Synchronize state with URL search parameters
  useEffect(() => {
    const dept = searchParams.get('department')
    const cat = searchParams.get('category')
    const filter = searchParams.get('filter')
    const q = searchParams.get('search')

    if (dept) setSelectedDepartment(dept)
    if (cat) {
      if (['Women', 'Men', 'Accessories'].includes(cat)) {
        setSelectedDepartment(cat)
        setSelectedCategory('All')
      } else {
        setSelectedCategory(cat)
      }
    }
    if (filter === 'new' || filter === 'new-arrivals') {
      setNewOnly(true)
    }
    if (filter === 'sale') {
      setSaleOnly(true)
    }
    if (q) setSearchQuery(q)
  }, [searchParams])

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((item) => {
      // 1. Department Filter
      if (selectedDepartment !== 'All') {
        if (item.department.toLowerCase() !== selectedDepartment.toLowerCase()) {
          return false
        }
      }

      // 2. Category / Subcategory Filter
      if (selectedCategory !== 'All') {
        const catMatch =
          item.category.toLowerCase() === selectedCategory.toLowerCase() ||
          item.subcategory.toLowerCase() === selectedCategory.toLowerCase()
        if (!catMatch) return false
      }

      // 3. Size Filter
      if (selectedSize !== 'All') {
        if (!item.sizes || !item.sizes.includes(selectedSize)) {
          return false
        }
      }

      // 4. Color Filter
      if (selectedColor !== 'All') {
        if (!item.colors || !item.colors.some((c) => c.name.toLowerCase() === selectedColor.toLowerCase())) {
          return false
        }
      }

      // 5. Price Filter
      if (item.price > priceRange) {
        return false
      }

      // 6. Sale Products Only
      if (saleOnly) {
        if (!item.originalPrice || item.originalPrice <= item.price) {
          return false
        }
      }

      // 7. New Arrivals Only
      if (newOnly) {
        if (!item.isNew) {
          return false
        }
      }

      // 8. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = item.name.toLowerCase().includes(q)
        const matchesCat = item.category.toLowerCase().includes(q) || item.subcategory.toLowerCase().includes(q)
        const matchesDept = item.department.toLowerCase().includes(q)
        const matchesDesc = item.description.toLowerCase().includes(q)
        const matchesMat = item.materials && item.materials.toLowerCase().includes(q)
        const matchesCol = item.collection && item.collection.toLowerCase().includes(q)

        if (!matchesName && !matchesCat && !matchesDept && !matchesDesc && !matchesMat && !matchesCol) {
          return false
        }
      }

      return true
    }).sort((a, b) => {
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
    })
  }, [
    selectedDepartment,
    selectedCategory,
    selectedSize,
    selectedColor,
    priceRange,
    saleOnly,
    newOnly,
    searchQuery,
    sortBy,
  ])

  // Active filters list
  const activeFilters = useMemo(() => {
    const list = []
    if (selectedDepartment !== 'All') {
      list.push({ label: `Dept: ${selectedDepartment}`, clear: () => setSelectedDepartment('All') })
    }
    if (selectedCategory !== 'All') {
      list.push({ label: `Category: ${selectedCategory}`, clear: () => setSelectedCategory('All') })
    }
    if (selectedSize !== 'All') {
      list.push({ label: `Size: ${selectedSize}`, clear: () => setSelectedSize('All') })
    }
    if (selectedColor !== 'All') {
      list.push({ label: `Hue: ${selectedColor}`, clear: () => setSelectedColor('All') })
    }
    if (priceRange < maxCatalogPrice) {
      list.push({ label: `Under ${formatCurrency(priceRange)}`, clear: () => setPriceRange(maxCatalogPrice) })
    }
    if (saleOnly) {
      list.push({ label: 'Sale Pieces', clear: () => setSaleOnly(false) })
    }
    if (newOnly) {
      list.push({ label: 'New Allocations', clear: () => setNewOnly(false) })
    }
    if (searchQuery.trim()) {
      list.push({ label: `Search: "${searchQuery}"`, clear: () => setSearchQuery('') })
    }
    return list
  }, [selectedDepartment, selectedCategory, selectedSize, selectedColor, priceRange, saleOnly, newOnly, searchQuery, maxCatalogPrice])

  const clearAllFilters = () => {
    setSelectedDepartment('All')
    setSelectedCategory('All')
    setSelectedSize('All')
    setSelectedColor('All')
    setPriceRange(maxCatalogPrice)
    setSaleOnly(false)
    setNewOnly(false)
    setSearchQuery('')
    setSearchParams({})
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-white">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 font-mono">
        <Link to="/" className="hover:text-[#D4AF37] transition-colors">
          Atelier Home
        </Link>
        <ChevronRight size={12} className="text-gray-600" />
        <Link to="/shop" className="hover:text-[#D4AF37] transition-colors">
          Catalog
        </Link>
        {selectedDepartment !== 'All' && (
          <>
            <ChevronRight size={12} className="text-gray-600" />
            <span className="text-white font-semibold">{selectedDepartment}</span>
          </>
        )}
        {selectedCategory !== 'All' && (
          <>
            <ChevronRight size={12} className="text-gray-600" />
            <span className="text-[#D4AF37] font-semibold">{selectedCategory}</span>
          </>
        )}
      </nav>

      {/* Editorial Catalog Header */}
      <div className="border-b border-white/10 pb-8 space-y-3">
        <span className="tag-overline text-[#D4AF37] font-mono">AUTUMN / WINTER 2026 REPERTOIRE</span>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="editorial-title text-4xl sm:text-6xl font-serif text-white">
              The Collection
            </h1>
            <p className="font-serif text-base sm:text-lg text-gray-300 font-light mt-2 max-w-2xl leading-relaxed">
              Sculpted silhouettes, brutalist tailoring, and raw noble fibers. Designed in Paris, meticulously tailored across our heritage European ateliers.
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#D4AF37] block">
              Showing {filteredProducts.length} of {PRODUCTS.length} Silhouettes
            </span>
          </div>
        </div>
      </div>

      {/* Top Controls: Search, Filter Toggle, Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        {/* Search Input Bar in Liquid Glass */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search silhouettes, wools, coats, silks..."
            className="w-full bg-[#121522] border border-white/15 pl-9 pr-9 py-2.5 text-xs tracking-wider uppercase text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37] font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Controls: Mobile Filter Toggle & Sort Dropdown */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          {/* Mobile Filter Drawer Button */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 border border-white/20 glass-panel px-4 py-2 text-xs uppercase tracking-wider font-medium text-white hover:border-[#D4AF37] transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {activeFilters.length > 0 && (
              <span className="h-4 w-4 rounded-full bg-[#7E1828] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilters.length}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-gray-400 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort silhouettes"
              className="bg-[#121522] border border-white/15 px-3 py-2 text-xs uppercase tracking-wider text-gray-200 focus:outline-none focus:border-[#D4AF37] cursor-pointer font-mono"
            >
              <option value="featured">Sort: Curated / Featured</option>
              <option value="newest">Sort: Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-mono mr-1">
            Active:
          </span>
          {activeFilters.map((f, i) => (
            <button
              key={i}
              type="button"
              onClick={f.clear}
              className="inline-flex items-center gap-1.5 glass-panel border-[#D4AF37]/40 text-[#D4AF37] px-2.5 py-1 text-[10px] uppercase tracking-wider hover:bg-[#D4AF37] hover:text-[#08090D] transition-colors cursor-pointer font-mono"
              title="Click to remove filter"
            >
              <span>{f.label}</span>
              <X size={11} />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-[10px] uppercase tracking-widest text-[#D4AF37] hover:underline cursor-pointer ml-2 font-mono"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Shop Body: Desktop Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 space-y-8 sticky top-24 border-r border-white/10 pr-6 text-xs">
          {/* Department Filter */}
          <div className="space-y-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold border-b border-white/10 pb-1.5">
              Department
            </h3>
            <div className="flex flex-col space-y-1.5">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDepartment(dept)}
                  className={`text-left py-1 tracking-wider uppercase transition-colors flex items-center justify-between cursor-pointer font-mono ${
                    selectedDepartment.toLowerCase() === dept.toLowerCase()
                      ? 'font-bold text-[#D4AF37]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{dept}</span>
                  {selectedDepartment.toLowerCase() === dept.toLowerCase() && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Garment Category Filter */}
          <div className="space-y-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold border-b border-white/10 pb-1.5">
              Garment Category
            </h3>
            <div className="flex flex-col space-y-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left py-1 tracking-wider uppercase transition-colors flex items-center justify-between cursor-pointer font-mono ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'font-bold text-[#D4AF37]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory.toLowerCase() === cat.toLowerCase() && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                Max Price
              </h3>
              <span className="font-mono text-xs font-semibold text-white">
                {formatCurrency(priceRange)}
              </span>
            </div>
            <input
              type="range"
              min={minCatalogPrice}
              max={maxCatalogPrice}
              step={100}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span>{formatCurrency(minCatalogPrice)}</span>
              <span>{formatCurrency(maxCatalogPrice)}</span>
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold border-b border-white/10 pb-1.5">
              Available Sizes
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedSize('All')}
                className={`px-2.5 py-1 text-[10px] tracking-wider transition-colors border cursor-pointer font-mono ${
                  selectedSize === 'All'
                    ? 'border-[#D4AF37] bg-[#D4AF37] text-[#08090D] font-bold'
                    : 'border-white/15 text-gray-300 hover:border-white/40'
                }`}
              >
                All
              </button>
              {SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size === selectedSize ? 'All' : size)}
                  className={`px-2.5 py-1 text-[10px] tracking-wider transition-colors border cursor-pointer font-mono ${
                    selectedSize === size
                      ? 'border-[#D4AF37] bg-[#D4AF37] text-[#08090D] font-bold'
                      : 'border-white/15 text-gray-300 hover:border-white/40'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="space-y-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold border-b border-white/10 pb-1.5">
              Color Palette
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedColor('All')}
                className={`flex items-center gap-2 text-left py-0.5 tracking-wider uppercase transition-colors cursor-pointer w-full font-mono ${
                  selectedColor === 'All' ? 'font-bold text-[#D4AF37]' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="h-3 w-3 rounded-full border border-white/30 bg-gradient-to-r from-gray-400 to-gray-700" />
                <span>All Hues</span>
              </button>
              {COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color.name === selectedColor ? 'All' : color.name)}
                  className={`flex items-center justify-between text-left py-0.5 tracking-wider uppercase transition-colors cursor-pointer w-full font-mono ${
                    selectedColor === color.name ? 'font-bold text-[#D4AF37]' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full border border-white/25 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </div>
                  {selectedColor === color.name && <Check size={12} className="text-[#D4AF37]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Sale & New Only Toggles */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="uppercase tracking-wider text-xs font-mono text-gray-300">Sale Pieces Only</span>
              <input
                type="checkbox"
                checked={saleOnly}
                onChange={(e) => setSaleOnly(e.target.checked)}
                className="h-4 w-4 accent-[#D4AF37] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="uppercase tracking-wider text-xs font-mono text-gray-300">New Arrivals Only</span>
              <input
                type="checkbox"
                checked={newOnly}
                onChange={(e) => setNewOnly(e.target.checked)}
                className="h-4 w-4 accent-[#D4AF37] cursor-pointer"
              />
            </label>
          </div>

          {/* Reset All Action */}
          {activeFilters.length > 0 && (
            <div className="pt-2">
              <Button variant="secondary" size="sm" fullWidth onClick={clearAllFilters} icon={RotateCcw} iconPosition="left">
                Reset All Filters
              </Button>
            </div>
          )}
        </aside>

        {/* Product Grid Container */}
        <main className="lg:col-span-9">
          {filteredProducts.length === 0 ? (
            /* Empty Results State */
            <div className="text-center py-24 glass-panel border border-dashed border-white/20 p-8 sm:p-12 space-y-5 rounded-xs">
              <div className="mx-auto h-12 w-12 rounded-full glass-panel-gold flex items-center justify-center text-[#D4AF37]">
                <Filter size={20} />
              </div>
              <h2 className="font-serif text-3xl text-white">No Silhouettes Match Your Criteria</h2>
              <p className="text-xs text-gray-400 tracking-wider max-w-md mx-auto leading-relaxed font-mono">
                We could not find any archived garments that satisfy your current combination of department, category, size, color, or price constraints.
              </p>
              <div className="pt-2 flex justify-center">
                <Button variant="primary" size="md" onClick={clearAllFilters}>
                  Reset All Filters
                </Button>
              </div>
            </div>
          ) : (
            /* Product Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Slide-in Filter Drawer on Mobile */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" role="dialog" aria-modal="true" aria-label="Filters Drawer">
          <div
            className="fixed inset-0 bg-[#06070A]/85 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
            <aside className="w-screen max-w-md bg-[#0C0E16] border-l border-white/10 flex flex-col shadow-2xl text-white h-full">
              {/* Drawer Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#10131E]/60">
                <div>
                  <h2 className="font-serif text-2xl font-light text-white">Refine Repertoire</h2>
                  <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-mono mt-0.5">
                    {filteredProducts.length} Silhouettes Matching
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filter drawer"
                  className="p-2 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Filter Options */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 text-xs">
                {/* Department */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold border-b border-white/10 pb-1.5">
                    Department
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {DEPARTMENTS.map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => setSelectedDepartment(dept)}
                        className={`p-2 text-center text-xs uppercase tracking-wider border cursor-pointer font-mono ${
                          selectedDepartment.toLowerCase() === dept.toLowerCase()
                            ? 'gold-gradient-bg text-[#08090D] font-bold border-[#D4AF37]'
                            : 'border-white/15 text-gray-300'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Garment Category */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold border-b border-white/10 pb-1.5">
                    Category
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`p-2 text-center text-xs uppercase tracking-wider border cursor-pointer font-mono ${
                          selectedCategory.toLowerCase() === cat.toLowerCase()
                            ? 'gold-gradient-bg text-[#08090D] font-bold border-[#D4AF37]'
                            : 'border-white/15 text-gray-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Price */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold">
                      Max Price
                    </h3>
                    <span className="font-mono text-xs font-semibold text-white">
                      {formatCurrency(priceRange)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={minCatalogPrice}
                    max={maxCatalogPrice}
                    step={100}
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-[#D4AF37] cursor-pointer"
                  />
                </div>

                {/* Sizes */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold border-b border-white/10 pb-1.5">
                    Sizes
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedSize('All')}
                      className={`px-3 py-1.5 text-xs tracking-wider border cursor-pointer font-mono ${
                        selectedSize === 'All'
                          ? 'gold-gradient-bg text-[#08090D] font-bold border-[#D4AF37]'
                          : 'border-white/15 text-gray-300'
                      }`}
                    >
                      All
                    </button>
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size === selectedSize ? 'All' : size)}
                        className={`px-3 py-1.5 text-xs tracking-wider border cursor-pointer font-mono ${
                          selectedSize === size
                            ? 'gold-gradient-bg text-[#08090D] font-bold border-[#D4AF37]'
                            : 'border-white/15 text-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sale and New */}
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="uppercase tracking-wider text-xs font-mono text-gray-300">Sale Pieces Only</span>
                    <input
                      type="checkbox"
                      checked={saleOnly}
                      onChange={(e) => setSaleOnly(e.target.checked)}
                      className="h-4 w-4 accent-[#D4AF37] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="uppercase tracking-wider text-xs font-mono text-gray-300">New Arrivals Only</span>
                    <input
                      type="checkbox"
                      checked={newOnly}
                      onChange={(e) => setNewOnly(e.target.checked)}
                      className="h-4 w-4 accent-[#D4AF37] cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="p-6 border-t border-white/10 bg-[#10131E]/80 flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  View {filteredProducts.length} Silhouettes
                </Button>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-4 py-3 border border-white/20 text-xs uppercase tracking-wider hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors cursor-pointer shrink-0 font-mono"
                  title="Reset all filters"
                >
                  Reset
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* Persistent Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  )
}
