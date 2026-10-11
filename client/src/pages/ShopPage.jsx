import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Filter,
  Search,
  X,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Check,
  ArrowUpDown,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import productService from '../services/productService'
import categoryService from '../services/categoryService'
import ProductCard from '../components/product/ProductCard'
import ProductQuickViewModal from '../components/product/ProductQuickViewModal'
import Button from '../components/ui/Button'
import { formatCurrency } from '../utils/formatters'
import PageTransition from '../components/motion/PageTransition'

const DEPARTMENTS = ['All', 'Women', 'Men', 'Accessories']
const SIZES = ['XS', 'S', 'M', 'L', 'XL']
const COLORS = [
  { name: 'Noir', hex: '#111111' },
  { name: 'Ivory', hex: '#FDFBF7' },
  { name: 'Burgundy', hex: '#651C26' },
  { name: 'Camel', hex: '#B89778' },
  { name: 'Charcoal', hex: '#2C2E35' },
]

function ProductCardSkeleton() {
  return (
    <div className="glass-card rounded-xs bg-[#0B0D14]/75 border border-white/10 p-3 h-full animate-pulse flex flex-col space-y-3">
      <div className="aspect-[3/4] bg-white/5 rounded-xs" />
      <div className="space-y-2 pt-2">
        <div className="h-2.5 bg-white/10 w-1/3 rounded-xs" />
        <div className="h-4 bg-white/15 w-4/5 rounded-xs" />
        <div className="h-3.5 bg-[#D4AF37]/20 w-1/4 rounded-xs" />
      </div>
    </div>
  )
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Dynamic categories from backend
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Products and pagination state
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filter States initialized from URL
  const [selectedDepartment, setSelectedDepartment] = useState(() => searchParams.get('department') || 'All')
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'All')
  const [selectedSize, setSelectedSize] = useState('All')
  const [selectedColor, setSelectedColor] = useState('All')
  const [priceRange, setPriceRange] = useState(50000)
  const [saleOnly, setSaleOnly] = useState(() => searchParams.get('filter') === 'sale')
  const [newOnly, setNewOnly] = useState(() => searchParams.get('filter') === 'new' || searchParams.get('filter') === 'new-arrivals')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [sortBy, setSortBy] = useState('featured')
  const [currentPage, setCurrentPage] = useState(1)

  // UI Drawer & Quick View
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  // Load categories from PostgreSQL via REST API
  useEffect(() => {
    let isMounted = true
    async function loadTaxonomy() {
      try {
        const catData = await categoryService.getCategories()
        if (isMounted && Array.isArray(catData)) {
          setCategories(catData)
        }
      } catch (err) {
        console.warn('[ShopPage] Categories API note:', err.message)
      } finally {
        if (isMounted) setLoadingCategories(false)
      }
    }
    loadTaxonomy()
    return () => {
      isMounted = false
    }
  }, [])

  // Sync state when URL params change externally
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
    if (filter === 'new' || filter === 'new-arrivals') setNewOnly(true)
    if (filter === 'sale') setSaleOnly(true)
    if (q !== null && q !== undefined) setSearchQuery(q)
  }, [searchParams])

  // Fetch products from real Express REST API
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = {
        page: currentPage,
        limit: 9,
        department: selectedDepartment !== 'All' ? selectedDepartment : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined,
        size: selectedSize !== 'All' ? selectedSize : undefined,
        color: selectedColor !== 'All' ? selectedColor : undefined,
        maxPrice: priceRange < 50000 ? priceRange : undefined,
        isSale: saleOnly ? true : undefined,
        isNew: newOnly ? true : undefined,
        sort: sortBy,
      }

      const result = await productService.getProducts(queryParams)
      setProducts(result.items || [])
      setPagination(
        result.pagination || {
          page: currentPage,
          limit: 9,
          total: result.items?.length || 0,
          totalPages: 1,
        }
      )
    } catch (err) {
      console.error('[ShopPage] Failed to fetch products:', err)
      setError(err.message || 'Unable to retrieve current atelier silhouettes. Please check API connection.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [
    currentPage,
    selectedDepartment,
    selectedCategory,
    searchQuery,
    selectedSize,
    selectedColor,
    priceRange,
    saleOnly,
    newOnly,
    sortBy,
  ])

  // Trigger fetch whenever filters, sorting or page change
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Reset to page 1 whenever any filter condition changes
  const handleFilterChange = (setter, value) => {
    setter(value)
    setCurrentPage(1)
  }

  // Active filter tags for quick removal
  const activeFilters = useMemo(() => {
    const list = []
    if (selectedDepartment !== 'All') {
      list.push({ label: `Dept: ${selectedDepartment}`, clear: () => handleFilterChange(setSelectedDepartment, 'All') })
    }
    if (selectedCategory !== 'All') {
      list.push({ label: `Category: ${selectedCategory}`, clear: () => handleFilterChange(setSelectedCategory, 'All') })
    }
    if (selectedSize !== 'All') {
      list.push({ label: `Size: ${selectedSize}`, clear: () => handleFilterChange(setSelectedSize, 'All') })
    }
    if (selectedColor !== 'All') {
      list.push({ label: `Hue: ${selectedColor}`, clear: () => handleFilterChange(setSelectedColor, 'All') })
    }
    if (priceRange < 50000) {
      list.push({ label: `Under ${formatCurrency(priceRange)}`, clear: () => handleFilterChange(setPriceRange, 50000) })
    }
    if (saleOnly) {
      list.push({ label: 'Sale Pieces', clear: () => handleFilterChange(setSaleOnly, false) })
    }
    if (newOnly) {
      list.push({ label: 'New Allocations', clear: () => handleFilterChange(setNewOnly, false) })
    }
    if (searchQuery.trim()) {
      list.push({ label: `Search: "${searchQuery}"`, clear: () => handleFilterChange(setSearchQuery, '') })
    }
    return list
  }, [selectedDepartment, selectedCategory, selectedSize, selectedColor, priceRange, saleOnly, newOnly, searchQuery])

  const clearAllFilters = () => {
    setSelectedDepartment('All')
    setSelectedCategory('All')
    setSelectedSize('All')
    setSelectedColor('All')
    setPriceRange(50000)
    setSaleOnly(false)
    setNewOnly(false)
    setSearchQuery('')
    setCurrentPage(1)
    setSearchParams({})
  }

  // Category labels derived from backend or fallback list
  const displayCategories = useMemo(() => {
    if (categories.length > 0) {
      const names = categories.map((c) => c.name)
      return ['All', ...new Set(names)]
    }
    return ['All', 'Tailoring', 'Dresses', 'Knitwear', 'Outerwear', 'Leather', 'Accessories']
  }, [categories])

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-white">
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
              Sculpted silhouettes, brutalist tailoring, and raw noble fibers. Sourced directly from our PostgreSQL-backed atelier inventory.
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#D4AF37] block">
              {loading
                ? 'Querying Atelier Database...'
                : `Displaying ${pagination.total} Silhouettes`}
            </span>
          </div>
        </div>
      </div>

      {/* Top Controls: Search, Filter Drawer Toggle, Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        {/* Search Input Bar */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
            placeholder="Search silhouettes, wools, coats, silks..."
            className="w-full bg-[#121522] border border-white/15 pl-9 pr-9 py-2.5 text-xs tracking-wider uppercase text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37] font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleFilterChange(setSearchQuery, '')}
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
              onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
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
          <AnimatePresence mode="popLayout">
            {activeFilters.map((f) => (
              <motion.button
                key={f.label}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.18 }}
                type="button"
                onClick={f.clear}
                className="inline-flex items-center gap-1.5 glass-panel border-[#D4AF37]/40 text-[#D4AF37] px-2.5 py-1 text-[10px] uppercase tracking-wider hover:bg-[#D4AF37] hover:text-[#08090D] transition-colors cursor-pointer font-mono"
                title="Click to remove filter"
              >
                <span>{f.label}</span>
                <X size={11} />
              </motion.button>
            ))}
          </AnimatePresence>
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
                  onClick={() => handleFilterChange(setSelectedDepartment, dept)}
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
              {displayCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleFilterChange(setSelectedCategory, cat)}
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
                {priceRange >= 50000 ? 'All Prices' : formatCurrency(priceRange)}
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={50000}
              step={1000}
              value={priceRange}
              onChange={(e) => handleFilterChange(setPriceRange, Number(e.target.value))}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span>₹1,000</span>
              <span>₹50,000+</span>
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
                onClick={() => handleFilterChange(setSelectedSize, 'All')}
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
                  onClick={() => handleFilterChange(setSelectedSize, size === selectedSize ? 'All' : size)}
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
                onClick={() => handleFilterChange(setSelectedColor, 'All')}
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
                  onClick={() => handleFilterChange(setSelectedColor, color.name === selectedColor ? 'All' : color.name)}
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
                onChange={(e) => handleFilterChange(setSaleOnly, e.target.checked)}
                className="h-4 w-4 accent-[#D4AF37] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="uppercase tracking-wider text-xs font-mono text-gray-300">New Arrivals Only</span>
              <input
                type="checkbox"
                checked={newOnly}
                onChange={(e) => handleFilterChange(setNewOnly, e.target.checked)}
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
          {/* Error State Banner with Retry */}
          {error && (
            <div className="mb-8 p-6 glass-panel border border-red-500/40 bg-[#160D12]/90 rounded-xs space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 text-red-400 font-mono text-xs uppercase tracking-widest font-semibold">
                <AlertCircle size={16} />
                <span>Backend Catalog API Error</span>
              </div>
              <p className="text-sm font-serif text-gray-300 max-w-lg mx-auto">
                {error}
              </p>
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={fetchProducts}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#08090D] transition-all text-xs font-mono uppercase tracking-wider font-semibold cursor-pointer"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span>Retry API Connection</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty Results State */
            <div className="text-center py-24 glass-panel border border-dashed border-white/20 p-8 sm:p-12 space-y-5 rounded-xs">
              <div className="mx-auto h-12 w-12 rounded-full glass-panel-gold flex items-center justify-center text-[#D4AF37]">
                <Filter size={20} />
              </div>
              <h2 className="font-serif text-3xl text-white">No Silhouettes Match Your Criteria</h2>
              <p className="text-xs text-gray-400 tracking-wider max-w-md mx-auto leading-relaxed font-mono">
                No archived garments in the PostgreSQL database satisfied your combination of department, category, size, color, or price constraints.
              </p>
              <div className="pt-2 flex justify-center">
                <Button variant="primary" size="md" onClick={clearAllFilters}>
                  Reset All Filters
                </Button>
              </div>
            </div>
          ) : (
            /* Product Grid */
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.3) }}
                  >
                    <ProductCard
                      product={product}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Server-Controlled Pagination */}
              {pagination.totalPages > 1 && (
                <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs font-mono text-gray-400">
                    Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} Silhouettes
                  </span>

                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <button
                      type="button"
                      disabled={pagination.page <= 1}
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1))
                        window.scrollTo({ top: 300, behavior: 'smooth' })
                      }}
                      className="px-3 py-2 border border-white/15 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <ChevronLeft size={14} />
                      <span className="hidden sm:inline">Prev</span>
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => {
                          setCurrentPage(page)
                          window.scrollTo({ top: 300, behavior: 'smooth' })
                        }}
                        className={`h-9 w-9 border transition-all cursor-pointer flex items-center justify-center font-bold ${
                          pagination.page === page
                            ? 'gold-gradient-bg text-[#08090D] border-[#D4AF37]'
                            : 'border-white/15 text-gray-300 hover:border-white/40'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => {
                        setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                        window.scrollTo({ top: 300, behavior: 'smooth' })
                      }}
                      className="px-3 py-2 border border-white/15 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#0B0D14] border-l border-white/10 z-50 p-6 overflow-y-auto space-y-6 text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="font-serif text-lg font-bold">Catalog Refinement</span>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <h4 className="font-mono text-xs uppercase tracking-widest text-[#D4AF37]">Department</h4>
                <div className="flex flex-wrap gap-2">
                  {DEPARTMENTS.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => handleFilterChange(setSelectedDepartment, dept)}
                      className={`px-3 py-1.5 text-xs font-mono tracking-wider border cursor-pointer ${
                        selectedDepartment.toLowerCase() === dept.toLowerCase()
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-[#08090D] font-bold'
                          : 'border-white/15 text-gray-300'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <h4 className="font-mono text-xs uppercase tracking-widest text-[#D4AF37]">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {displayCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleFilterChange(setSelectedCategory, cat)}
                      className={`px-3 py-1.5 text-xs font-mono tracking-wider border cursor-pointer ${
                        selectedCategory.toLowerCase() === cat.toLowerCase()
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-[#08090D] font-bold'
                          : 'border-white/15 text-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply & Close */}
              <div className="pt-4 space-y-2">
                <Button variant="primary" size="md" fullWidth onClick={() => setMobileFiltersOpen(false)}>
                  Apply Refinements
                </Button>
                <Button variant="secondary" size="md" fullWidth onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          isOpen={Boolean(quickViewProduct)}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </PageTransition>
  )
}
