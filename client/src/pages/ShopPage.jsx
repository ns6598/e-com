import React, { useState, useEffect, useCallback } from 'react'
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
import { formatCurrency } from '../utils/formatters'
import PageTransition from '../components/motion/PageTransition'

const CATEGORY_TABS = ['ALL', 'WOMEN', 'MEN', 'ACCESSORIES', 'NEW ARRIVALS', 'SALE']
const SIZES = ['XS', 'S', 'M', 'L', 'XL']
const COLORS = [
  { name: 'Noir', hex: '#090909' },
  { name: 'Acid Lime', hex: '#B8FF00' },
  { name: 'Blood Crimson', hex: '#8B0000' },
  { name: 'Dark Ash', hex: '#292929' },
  { name: 'Bone White', hex: '#E5E5E5' },
]

function ProductCardSkeleton() {
  return (
    <div className="bg-[#171717] border border-[#292929] p-3 h-full animate-pulse flex flex-col space-y-3">
      <div className="aspect-[3/4] bg-[#111111]" />
      <div className="space-y-2 pt-2">
        <div className="h-2.5 bg-[#292929] w-1/3" />
        <div className="h-4 bg-[#292929] w-4/5" />
        <div className="h-3.5 bg-[#B8FF00]/20 w-1/4" />
      </div>
    </div>
  )
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Dynamic garment categories from backend API
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Products and server pagination state
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State initialized from URL query params
  const urlCategoryParam = (searchParams.get('category') || 'ALL').toUpperCase()
  const [activeTab, setActiveTab] = useState(
    searchParams.get('filter') === 'sale'
      ? 'SALE'
      : searchParams.get('filter') === 'new' || searchParams.get('filter') === 'new-arrivals' || searchParams.get('sort') === 'newest'
      ? 'NEW ARRIVALS'
      : CATEGORY_TABS.includes(urlCategoryParam)
      ? urlCategoryParam
      : 'ALL'
  )

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [selectedSubCategory, setSelectedSubCategory] = useState('All')
  const [selectedSize, setSelectedSize] = useState(() => searchParams.get('size') || 'All')
  const [selectedColor, setSelectedColor] = useState(() => searchParams.get('color') || 'All')
  const [priceRange, setPriceRange] = useState(() => Number(searchParams.get('maxPrice')) || 50000)
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'featured')
  const [inStockOnly, setInStockOnly] = useState(() => searchParams.get('inStock') === 'true')
  const [currentPage, setCurrentPage] = useState(1)

  // UI state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  // Load categories from database via REST API
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

  // Sync state with URL changes
  useEffect(() => {
    const cat = (searchParams.get('category') || 'ALL').toUpperCase()
    if (searchParams.get('filter') === 'sale') {
      setActiveTab('SALE')
    } else if (searchParams.get('filter') === 'new' || searchParams.get('sort') === 'newest') {
      setActiveTab('NEW ARRIVALS')
    } else if (CATEGORY_TABS.includes(cat)) {
      setActiveTab(cat)
    }

    if (searchParams.has('search')) setSearchQuery(searchParams.get('search') || '')
    if (searchParams.has('size')) setSelectedSize(searchParams.get('size') || 'All')
    if (searchParams.has('color')) setSelectedColor(searchParams.get('color') || 'All')
    if (searchParams.has('sort')) setSortBy(searchParams.get('sort') || 'featured')
    if (searchParams.has('maxPrice')) setPriceRange(Number(searchParams.get('maxPrice')) || 50000)
    if (searchParams.has('inStock')) setInStockOnly(searchParams.get('inStock') === 'true')
  }, [searchParams])

  // Fetch products from backend Express API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const apiParams = {
        page: currentPage,
        limit: 12,
        search: searchQuery.trim() || undefined,
        size: selectedSize !== 'All' ? selectedSize : undefined,
        color: selectedColor !== 'All' ? selectedColor : undefined,
        maxPrice: priceRange < 50000 ? priceRange : undefined,
        inStock: inStockOnly ? 'true' : undefined,
        sort: sortBy,
      }

      if (activeTab === 'WOMEN') apiParams.department = 'Women'
      else if (activeTab === 'MEN') apiParams.department = 'Men'
      else if (activeTab === 'ACCESSORIES') apiParams.category = 'Accessories'
      else if (activeTab === 'SALE') apiParams.sale = 'true'
      else if (activeTab === 'NEW ARRIVALS') apiParams.isNew = 'true'

      if (selectedSubCategory !== 'All') {
        apiParams.category = selectedSubCategory
      }

      const res = await productService.getProducts(apiParams)

      if (res && Array.isArray(res.items)) {
        setProducts(res.items)
        if (res.pagination) {
          setPagination(res.pagination)
        }
      } else {
        setProducts([])
      }
    } catch (err) {
      console.error('[ShopPage] Fetch Error:', err)
      setError('Unable to retrieve collection from atelier server. Please check connection.')
    } finally {
      setLoading(false)
    }
  }, [
    currentPage,
    searchQuery,
    selectedSize,
    selectedColor,
    priceRange,
    inStockOnly,
    sortBy,
    activeTab,
    selectedSubCategory,
  ])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Update URL search parameters
  const updateUrlParams = (newFilters = {}) => {
    const current = new URLSearchParams(searchParams)

    Object.entries(newFilters).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '' || val === 'All' || val === false) {
        current.delete(key)
      } else {
        current.set(key, val)
      }
    })

    setSearchParams(current, { replace: true })
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSelectedSubCategory('All')
    setCurrentPage(1)

    const params = { page: 1 }
    if (tab === 'ALL') {
      params.category = null
      params.filter = null
    } else if (tab === 'SALE') {
      params.filter = 'sale'
      params.category = null
    } else if (tab === 'NEW ARRIVALS') {
      params.filter = 'new'
      params.category = null
    } else {
      params.category = tab.toLowerCase()
      params.filter = null
    }

    updateUrlParams(params)
  }

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchQuery(val)
    setCurrentPage(1)
    updateUrlParams({ search: val || null, page: 1 })
  }

  const handleSortChange = (e) => {
    const val = e.target.value
    setSortBy(val)
    setCurrentPage(1)
    updateUrlParams({ sort: val, page: 1 })
  }

  const handleSizeChange = (sz) => {
    const next = selectedSize === sz ? 'All' : sz
    setSelectedSize(next)
    setCurrentPage(1)
    updateUrlParams({ size: next !== 'All' ? next : null, page: 1 })
  }

  const handleColorChange = (colName) => {
    const next = selectedColor === colName ? 'All' : colName
    setSelectedColor(next)
    setCurrentPage(1)
    updateUrlParams({ color: next !== 'All' ? next : null, page: 1 })
  }

  const handleResetFilters = () => {
    setActiveTab('ALL')
    setSearchQuery('')
    setSelectedSubCategory('All')
    setSelectedSize('All')
    setSelectedColor('All')
    setPriceRange(50000)
    setSortBy('featured')
    setInStockOnly(false)
    setCurrentPage(1)
    setSearchParams({}, { replace: true })
  }

  const hasActiveFilters =
    activeTab !== 'ALL' ||
    searchQuery.trim() !== '' ||
    selectedSubCategory !== 'All' ||
    selectedSize !== 'All' ||
    selectedColor !== 'All' ||
    priceRange < 50000 ||
    inStockOnly ||
    sortBy !== 'featured'

  return (
    <PageTransition className="w-full bg-[#090909] text-[#F5F5F5] min-h-screen">
      {/* Header Banner */}
      <section className="border-b border-[#292929] bg-[#111111] py-12 px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#B8FF00] font-mono block mb-2">
              CATALOGUE ARCHIVE // STYLE WITHOUT BOUNDARIES
            </span>
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl uppercase tracking-tight text-[#F5F5F5]">
              SHOP AUREVA
            </h1>
            <p className="mt-2 text-sm text-[#A6A6A6] font-light max-w-xl">
              Subversive darkwear, sculptural overcoats, occult minimal jewelry, and cyber grunge silhouettes crafted for permanent presence.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-[#A6A6A6]">
            <span>TOTAL: {pagination.total || products.length} PIECES</span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[#B8FF00] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>RESET FILTERS</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-8">
        {/* Category Tabs & Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#292929]">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none font-condensed text-xs uppercase font-bold tracking-wider">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 border transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-[#B8FF00] border-[#B8FF00] text-[#090909]'
                    : 'bg-[#171717] border-[#292929] text-[#A6A6A6] hover:text-[#F5F5F5] hover:border-[#404040]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search, Sort, Mobile Filter Button */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="SEARCH APPAREL..."
                className="w-full bg-[#171717] border border-[#292929] focus:border-[#B8FF00] text-[#F5F5F5] text-xs font-mono pl-8 pr-3 py-2 uppercase placeholder-[#737373] focus:outline-none"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={handleSortChange}
                aria-label="Sort products"
                className="bg-[#171717] border border-[#292929] text-[#F5F5F5] text-xs font-condensed uppercase tracking-wider font-bold px-3 py-2 pr-8 focus:border-[#B8FF00] focus:outline-none cursor-pointer"
              >
                <option value="featured">SORT: FEATURED</option>
                <option value="newest">SORT: NEWEST</option>
                <option value="price-low">PRICE: LOW → HIGH</option>
                <option value="price-high">PRICE: HIGH → LOW</option>
              </select>
            </div>

            {/* Mobile Filters Drawer Button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-[#171717] border border-[#292929] text-xs font-condensed uppercase font-bold text-[#F5F5F5] hover:border-[#B8FF00] cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              <span>FILTERS</span>
            </button>
          </div>
        </div>

        {/* Content Area: Persistent Desktop Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          {/* Desktop Persistent Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8 pr-4">
            {/* Sub-Category Filter */}
            {categories.length > 0 && (
              <div className="space-y-3">
                <span className="font-mono text-xs uppercase tracking-widest text-[#B8FF00] font-bold block border-b border-[#292929] pb-1.5">
                  GARMENT ARCHIVES
                </span>
                <div className="space-y-1.5 font-condensed uppercase text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubCategory('All')
                      updateUrlParams({ category: null })
                    }}
                    className={`block w-full text-left py-1 transition-colors cursor-pointer ${
                      selectedSubCategory === 'All' ? 'text-[#B8FF00] font-bold' : 'text-[#A6A6A6] hover:text-[#F5F5F5]'
                    }`}
                  >
                    ALL SILHOUETTES
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedSubCategory(cat.name)
                        updateUrlParams({ category: cat.slug || cat.name })
                      }}
                      className={`block w-full text-left py-1 transition-colors cursor-pointer flex justify-between items-center ${
                        selectedSubCategory === cat.name ? 'text-[#B8FF00] font-bold' : 'text-[#A6A6A6] hover:text-[#F5F5F5]'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {cat._count?.products !== undefined && (
                        <span className="font-mono text-[10px] text-[#737373]">
                          ({cat._count.products})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Filter */}
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#B8FF00] font-bold block border-b border-[#292929] pb-1.5">
                SIZE
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleSizeChange(sz)}
                    className={`min-w-[40px] py-1.5 px-2 text-xs font-mono uppercase font-bold border transition-colors cursor-pointer ${
                      selectedSize === sz
                        ? 'border-[#B8FF00] bg-[#B8FF00] text-[#090909]'
                        : 'border-[#292929] bg-[#171717] text-[#A6A6A6] hover:text-[#F5F5F5] hover:border-[#404040]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="space-y-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#B8FF00] font-bold block border-b border-[#292929] pb-1.5">
                COLOR PALETTE
              </span>
              <div className="space-y-2">
                {COLORS.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => handleColorChange(col.name)}
                    className={`flex items-center gap-2.5 w-full text-left py-1 text-xs font-mono uppercase transition-colors cursor-pointer ${
                      selectedColor === col.name ? 'text-[#B8FF00] font-bold' : 'text-[#A6A6A6] hover:text-[#F5F5F5]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-[#404040]"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono text-xs uppercase border-b border-[#292929] pb-1.5">
                <span className="text-[#B8FF00] font-bold">MAX PRICE</span>
                <span className="text-[#F5F5F5]">{formatCurrency(priceRange)}</span>
              </div>
              <input
                type="range"
                min={2000}
                max={50000}
                step={1000}
                value={priceRange}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setPriceRange(val)
                  updateUrlParams({ maxPrice: val < 50000 ? val : null })
                }}
                className="w-full accent-[#B8FF00] cursor-pointer"
              />
            </div>

            {/* In Stock Toggle */}
            <div className="pt-2 border-t border-[#292929]">
              <label className="flex items-center gap-2.5 text-xs font-mono uppercase text-[#A6A6A6] hover:text-[#F5F5F5] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setInStockOnly(checked)
                    updateUrlParams({ inStock: checked ? 'true' : null })
                  }}
                  className="w-4 h-4 accent-[#B8FF00] rounded-xs"
                />
                <span>IN STOCK ONLY</span>
              </label>
            </div>
          </aside>

          {/* Main Product Grid Area */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="py-20 text-center space-y-4">
                <AlertCircle size={32} className="mx-auto text-[#8B0000]" />
                <p className="font-mono text-xs text-[#A6A6A6]">{error}</p>
                <button
                  type="button"
                  onClick={fetchProducts}
                  className="alt-btn-secondary"
                >
                  <RefreshCw size={14} />
                  <span>RETRY FETCH</span>
                </button>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showQuickAdd={true}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>

                {/* Server Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-2 font-mono text-xs">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => {
                        const p = Math.max(1, currentPage - 1)
                        setCurrentPage(p)
                        window.scrollTo({ top: 300, behavior: 'smooth' })
                      }}
                      className="p-2 border border-[#292929] bg-[#171717] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#B8FF00] transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                      const pageNum = idx + 1
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => {
                            setCurrentPage(pageNum)
                            window.scrollTo({ top: 300, behavior: 'smooth' })
                          }}
                          className={`w-9 h-9 border font-bold transition-colors ${
                            currentPage === pageNum
                              ? 'bg-[#B8FF00] border-[#B8FF00] text-[#090909]'
                              : 'bg-[#171717] border-[#292929] text-[#F5F5F5] hover:border-[#404040]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    <button
                      type="button"
                      disabled={currentPage >= pagination.totalPages}
                      onClick={() => {
                        const p = Math.min(pagination.totalPages, currentPage + 1)
                        setCurrentPage(p)
                        window.scrollTo({ top: 300, behavior: 'smooth' })
                      }}
                      className="p-2 border border-[#292929] bg-[#171717] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#B8FF00] transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-24 text-center space-y-4 bg-[#111111] border border-[#292929] p-8">
                <span className="font-mono text-xs uppercase tracking-widest text-[#B8FF00] block">
                  ZERO SILHOUETTES DISCOVERED
                </span>
                <h3 className="font-display font-bold text-2xl uppercase text-[#F5F5F5]">
                  No Pieces Match Your Parameters
                </h3>
                <p className="text-xs text-[#A6A6A6] max-w-sm mx-auto font-light">
                  Try clearing active filters or searching for alternate keywords.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="alt-btn-accent"
                  >
                    RESET ALL FILTERS
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#090909]/80 backdrop-blur-sm lg:hidden flex justify-end"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xs bg-[#111111] border-l border-[#292929] h-full p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#292929]">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#B8FF00] font-bold">
                    FILTER ARCHIVE
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1 text-[#A6A6A6] hover:text-[#F5F5F5]"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Mobile Sizes */}
                <div className="space-y-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#F5F5F5] block">
                    SIZES
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SIZES.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleSizeChange(sz)}
                        className={`min-w-[40px] py-1.5 px-2 text-xs font-mono uppercase font-bold border transition-colors ${
                          selectedSize === sz
                            ? 'border-[#B8FF00] bg-[#B8FF00] text-[#090909]'
                            : 'border-[#292929] bg-[#171717] text-[#A6A6A6]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Colors */}
                <div className="space-y-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#F5F5F5] block">
                    COLOR PALETTE
                  </span>
                  <div className="space-y-1.5">
                    {COLORS.map((col) => (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => handleColorChange(col.name)}
                        className={`flex items-center gap-2 w-full text-left py-1 text-xs font-mono uppercase ${
                          selectedColor === col.name ? 'text-[#B8FF00] font-bold' : 'text-[#A6A6A6]'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-[#404040]"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Price */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-xs uppercase">
                    <span className="text-[#F5F5F5]">MAX PRICE</span>
                    <span className="text-[#B8FF00]">{formatCurrency(priceRange)}</span>
                  </div>
                  <input
                    type="range"
                    min={2000}
                    max={50000}
                    step={1000}
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-[#B8FF00]"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-[#292929] space-y-2">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full alt-btn-accent"
                >
                  APPLY FILTERS
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full alt-btn-secondary text-xs py-2.5"
                >
                  RESET
                </button>
              </div>
            </motion.div>
          </motion.div>
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
