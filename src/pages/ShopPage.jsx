import React, { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, Search, X, SlidersHorizontal, ChevronRight, RotateCcw, Check, ArrowUpDown } from 'lucide-react'
import { PRODUCTS, DEPARTMENTS, CATEGORIES, SIZES, COLORS } from '../data/products'
import ProductCard from '../components/product/ProductCard'
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
  const [priceRange, setPriceRange] = useState(90000) // Max price slider
  const [saleOnly, setSaleOnly] = useState(initialFilter === 'sale')
  const [newOnly, setNewOnly] = useState(initialFilter === 'new' || initialFilter === 'new-arrivals')
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [sortBy, setSortBy] = useState('featured')

  // Mobile filter drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Calculate dynamic catalog price bounds
  const minCatalogPrice = useMemo(() => Math.min(...PRODUCTS.map((p) => p.price)), [])
  const maxCatalogPrice = useMemo(() => Math.max(...PRODUCTS.map((p) => p.price)), [])

  // Synchronize state with URL search parameters
  useEffect(() => {
    const dept = searchParams.get('department')
    const cat = searchParams.get('category')
    const filter = searchParams.get('filter')
    const q = searchParams.get('search')

    if (dept) setSelectedDepartment(dept)
    if (cat) {
      // Check if cat corresponds to department or category
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

  // Cooperative Filtered and Sorted Products
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
      // default: 'featured'
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

  // Count active filters for badge and chips
  const activeFilters = useMemo(() => {
    const list = []
    if (selectedDepartment !== 'All') {
      list.push({ type: 'department', label: `Dept: ${selectedDepartment}`, clear: () => setSelectedDepartment('All') })
    }
    if (selectedCategory !== 'All') {
      list.push({ type: 'category', label: `Category: ${selectedCategory}`, clear: () => setSelectedCategory('All') })
    }
    if (selectedSize !== 'All') {
      list.push({ type: 'size', label: `Size: ${selectedSize}`, clear: () => setSelectedSize('All') })
    }
    if (selectedColor !== 'All') {
      list.push({ type: 'color', label: `Color: ${selectedColor}`, clear: () => setSelectedColor('All') })
    }
    if (priceRange < maxCatalogPrice) {
      list.push({ type: 'price', label: `Under ${formatCurrency(priceRange)}`, clear: () => setPriceRange(maxCatalogPrice) })
    }
    if (saleOnly) {
      list.push({ type: 'sale', label: 'Sale Pieces Only', clear: () => setSaleOnly(false) })
    }
    if (newOnly) {
      list.push({ type: 'new', label: 'New Arrivals Only', clear: () => setNewOnly(false) })
    }
    if (searchQuery.trim()) {
      list.push({ type: 'search', label: `Search: "${searchQuery}"`, clear: () => setSearchQuery('') })
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
    setSortBy('featured')
    setSearchParams({})
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* =========================================================================
          BREADCRUMB NAVIGATION
          ========================================================================= */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#171717]/60">
        <Link to="/" className="hover:text-[#6D202D] transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="text-[#171717]/30" />
        <Link to="/shop" className="hover:text-[#6D202D] transition-colors">
          Shop
        </Link>
        {selectedDepartment !== 'All' && (
          <>
            <ChevronRight size={12} className="text-[#171717]/30" />
            <span className="text-[#171717] font-semibold">{selectedDepartment}</span>
          </>
        )}
        {selectedCategory !== 'All' && (
          <>
            <ChevronRight size={12} className="text-[#171717]/30" />
            <span className="text-[#6D202D] font-semibold">{selectedCategory}</span>
          </>
        )}
      </nav>

      {/* =========================================================================
          EDITORIAL COLLECTION HEADER
          ========================================================================= */}
      <div className="border-b border-[#171717]/15 pb-8 space-y-3">
        <span className="tag-overline text-[#6D202D]">AUTUMN / WINTER 2026 CATALOG</span>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="editorial-title text-4xl sm:text-6xl font-serif text-[#171717]">
              The Collection
            </h1>
            <p className="font-serif text-base sm:text-lg text-[#171717]/70 font-light mt-2 max-w-2xl leading-relaxed">
              Sculpted silhouettes, brutalist tailoring, and raw noble fibers. Designed in Paris, meticulously tailored across our heritage European ateliers.
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#171717]/60 block">
              Showing {filteredProducts.length} of {PRODUCTS.length} Silhouettes
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TOP CONTROL BAR: Search, Mobile Filter Trigger, Sort
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[#171717]/10 pb-4">
        {/* Search Input Bar */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#171717]/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search silhouettes, wools, coats, silks..."
            className="w-full bg-[#FAF8F5] border border-[#171717]/20 pl-9 pr-9 py-2 text-xs tracking-wider uppercase text-[#171717] placeholder:text-[#171717]/40 focus:outline-none focus:border-[#171717]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#171717]/40 hover:text-[#171717] p-1"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Controls: Mobile Filter Drawer Toggle & Sort Dropdown */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          {/* Mobile Filter Drawer Button */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 border border-[#171717] bg-[#F6F2EA] px-4 py-2 text-xs uppercase tracking-wider font-medium hover:bg-[#171717] hover:text-[#F6F2EA] transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {activeFilters.length > 0 && (
              <span className="h-4 w-4 rounded-full bg-[#6D202D] text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilters.length}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-[#171717]/50 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort silhouettes"
              className="bg-[#FAF8F5] border border-[#171717]/20 px-3 py-2 text-xs uppercase tracking-wider text-[#171717] focus:outline-none focus:border-[#171717] cursor-pointer"
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

      {/* =========================================================================
          ACTIVE FILTER CHIPS
          ========================================================================= */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
          <span className="text-[10px] uppercase tracking-widest text-[#171717]/50 font-mono mr-1">
            Active:
          </span>
          {activeFilters.map((f, i) => (
            <button
              key={i}
              type="button"
              onClick={f.clear}
              className="inline-flex items-center gap-1.5 bg-[#171717] text-[#F6F2EA] px-2.5 py-1 text-[10px] uppercase tracking-wider hover:bg-[#6D202D] transition-colors cursor-pointer"
              title="Click to remove filter"
            >
              <span>{f.label}</span>
              <X size={11} />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-[10px] uppercase tracking-widest text-[#6D202D] hover:underline cursor-pointer ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* =========================================================================
          MAIN SHOP BODY: Responsive Desktop Sidebar + Product Grid
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* DESKTOP SIDEBAR FILTERS (Hidden on Mobile) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-8 sticky top-24 border-r border-[#171717]/10 pr-6 text-xs">
          {/* Department Filter */}
          <div className="space-y-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#171717]/60 font-semibold border-b border-[#171717]/10 pb-1.5">
              Department
            </h3>
            <div className="flex flex-col space-y-1.5">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDepartment(dept)}
                  className={`text-left py-1 tracking-wider uppercase transition-colors flex items-center justify-between cursor-pointer ${
                    selectedDepartment.toLowerCase() === dept.toLowerCase()
                      ? 'font-semibold text-[#6D202D]'
                      : 'text-[#171717]/70 hover:text-[#171717]'
                  }`}
                >
                  <span>{dept}</span>
                  {selectedDepartment.toLowerCase() === dept.toLowerCase() && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#6D202D]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Garment Category Filter */}
          <div className="space-y-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#171717]/60 font-semibold border-b border-[#171717]/10 pb-1.5">
              Garment Category
            </h3>
            <div className="flex flex-col space-y-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left py-1 tracking-wider uppercase transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'font-semibold text-[#6D202D]'
                      : 'text-[#171717]/70 hover:text-[#171717]'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory.toLowerCase() === cat.toLowerCase() && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#6D202D]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#171717]/10 pb-1.5">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#171717]/60 font-semibold">
                Max Price
              </h3>
              <span className="font-mono text-xs font-semibold text-[#171717]">
                {formatCurrency(priceRange)}
              </span>
            </div>
            <input
              type="range"
              min={minCatalogPrice}
              max={maxCatalogPrice}
              step={2000}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-[#6D202D] cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-[#171717]/40">
              <span>{formatCurrency(minCatalogPrice)}</span>
              <span>{formatCurrency(maxCatalogPrice)}</span>
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#171717]/60 font-semibold border-b border-[#171717]/10 pb-1.5">
              Available Sizes
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedSize('All')}
                className={`px-2.5 py-1 text-[10px] tracking-wider transition-colors border cursor-pointer ${
                  selectedSize === 'All'
                    ? 'border-[#171717] bg-[#171717] text-[#F6F2EA]'
                    : 'border-[#171717]/20 text-[#171717] hover:border-[#171717]'
                }`}
              >
                All
              </button>
              {SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size === selectedSize ? 'All' : size)}
                  className={`px-2.5 py-1 text-[10px] tracking-wider transition-colors border cursor-pointer ${
                    selectedSize === size
                      ? 'border-[#171717] bg-[#171717] text-[#F6F2EA]'
                      : 'border-[#171717]/20 text-[#171717] hover:border-[#171717]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="space-y-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#171717]/60 font-semibold border-b border-[#171717]/10 pb-1.5">
              Color Palette
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setSelectedColor('All')}
                className={`flex items-center gap-2 text-left py-0.5 tracking-wider uppercase transition-colors cursor-pointer w-full ${
                  selectedColor === 'All' ? 'font-semibold text-[#6D202D]' : 'text-[#171717]/70 hover:text-[#171717]'
                }`}
              >
                <span className="h-3 w-3 rounded-full border border-black/30 bg-gradient-to-r from-gray-200 to-gray-500" />
                <span>All Hues</span>
              </button>
              {COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setSelectedColor(color.name === selectedColor ? 'All' : color.name)}
                  className={`flex items-center justify-between text-left py-0.5 tracking-wider uppercase transition-colors cursor-pointer w-full ${
                    selectedColor === color.name ? 'font-semibold text-[#6D202D]' : 'text-[#171717]/70 hover:text-[#171717]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full border border-black/25 shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </div>
                  {selectedColor === color.name && <Check size={12} className="text-[#6D202D]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Sale & New Only Toggles */}
          <div className="space-y-3 border-t border-[#171717]/10 pt-4">
            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="uppercase tracking-wider text-xs font-medium">Sale Products Only</span>
              <input
                type="checkbox"
                checked={saleOnly}
                onChange={(e) => setSaleOnly(e.target.checked)}
                className="h-4 w-4 accent-[#6D202D] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="uppercase tracking-wider text-xs font-medium">New Arrivals Only</span>
              <input
                type="checkbox"
                checked={newOnly}
                onChange={(e) => setNewOnly(e.target.checked)}
                className="h-4 w-4 accent-[#6D202D] cursor-pointer"
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

        {/* PRODUCT GRID CONTAINER */}
        <main className="lg:col-span-9">
          {filteredProducts.length === 0 ? (
            /* Empty-Results State */
            <div className="text-center py-24 border border-dashed border-[#171717]/20 p-8 sm:p-12 space-y-5 bg-[#FAF8F5]">
              <div className="mx-auto h-12 w-12 rounded-full bg-[#171717]/5 flex items-center justify-center text-[#6D202D]">
                <Filter size={20} />
              </div>
              <h2 className="font-serif text-3xl text-[#171717]">No Silhouettes Match Your Criteria</h2>
              <p className="text-xs text-[#171717]/60 tracking-wider max-w-md mx-auto leading-relaxed">
                We could not find any archived garments that satisfy your current combination of department, category, size, color, or price constraints.
              </p>
              <div className="pt-2 flex justify-center">
                <Button variant="primary" size="md" onClick={clearAllFilters}>
                  Reset All Filters
                </Button>
              </div>
            </div>
          ) : (
            /* Clean Product Grid with carefully aligned cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          SLIDE-IN FILTER DRAWER ON MOBILE
          ========================================================================= */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" role="dialog" aria-modal="true" aria-label="Filters Drawer">
          <div
            className="fixed inset-0 bg-[#171717]/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <aside className="w-screen max-w-md bg-[#F6F2EA] border-l border-[#171717]/15 flex flex-col shadow-2xl text-[#171717] h-full">
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#171717]/10 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-light">Refine Repertoire</h2>
                  <p className="text-[10px] uppercase tracking-widest text-[#171717]/60 font-mono mt-0.5">
                    {filteredProducts.length} Silhouettes Matching
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filter drawer"
                  className="p-2 text-[#171717]/70 hover:text-[#171717] cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Filter Options */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 text-xs">
                {/* Department */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#171717]/60 font-semibold border-b border-[#171717]/10 pb-1.5">
                    Department
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {DEPARTMENTS.map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => setSelectedDepartment(dept)}
                        className={`p-2 text-center text-xs uppercase tracking-wider border cursor-pointer ${
                          selectedDepartment.toLowerCase() === dept.toLowerCase()
                            ? 'bg-[#171717] text-[#F6F2EA] border-[#171717] font-semibold'
                            : 'border-[#171717]/20 text-[#171717]'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Garment Category */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#171717]/60 font-semibold border-b border-[#171717]/10 pb-1.5">
                    Category
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`p-2 text-center text-xs uppercase tracking-wider border cursor-pointer ${
                          selectedCategory.toLowerCase() === cat.toLowerCase()
                            ? 'bg-[#171717] text-[#F6F2EA] border-[#171717] font-semibold'
                            : 'border-[#171717]/20 text-[#171717]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Price */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#171717]/10 pb-1.5">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#171717]/60 font-semibold">
                      Max Price
                    </h3>
                    <span className="font-mono text-xs font-semibold text-[#171717]">
                      {formatCurrency(priceRange)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={minCatalogPrice}
                    max={maxCatalogPrice}
                    step={2000}
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-[#6D202D] cursor-pointer"
                  />
                </div>

                {/* Sizes */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#171717]/60 font-semibold border-b border-[#171717]/10 pb-1.5">
                    Sizes
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedSize('All')}
                      className={`px-3 py-1.5 text-xs tracking-wider border cursor-pointer ${
                        selectedSize === 'All'
                          ? 'border-[#171717] bg-[#171717] text-[#F6F2EA]'
                          : 'border-[#171717]/20 text-[#171717]'
                      }`}
                    >
                      All
                    </button>
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size === selectedSize ? 'All' : size)}
                        className={`px-3 py-1.5 text-xs tracking-wider border cursor-pointer ${
                          selectedSize === size
                            ? 'border-[#171717] bg-[#171717] text-[#F6F2EA]'
                            : 'border-[#171717]/20 text-[#171717]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-3">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#171717]/60 font-semibold border-b border-[#171717]/10 pb-1.5">
                    Colors
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color.name === selectedColor ? 'All' : color.name)}
                        className={`flex items-center gap-2 p-2 border text-xs tracking-wider uppercase cursor-pointer ${
                          selectedColor === color.name
                            ? 'border-[#171717] bg-[#171717] text-[#F6F2EA]'
                            : 'border-[#171717]/20 text-[#171717]'
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="truncate">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sale and New */}
                <div className="space-y-3 border-t border-[#171717]/10 pt-4">
                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="uppercase tracking-wider text-xs font-medium">Sale Pieces Only</span>
                    <input
                      type="checkbox"
                      checked={saleOnly}
                      onChange={(e) => setSaleOnly(e.target.checked)}
                      className="h-4 w-4 accent-[#6D202D] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer select-none">
                    <span className="uppercase tracking-wider text-xs font-medium">New Arrivals Only</span>
                    <input
                      type="checkbox"
                      checked={newOnly}
                      onChange={(e) => setNewOnly(e.target.checked)}
                      className="h-4 w-4 accent-[#6D202D] cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="p-6 border-t border-[#171717]/10 bg-[#FAF8F5] flex items-center gap-3">
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
                  className="px-4 py-3 border border-[#171717]/30 text-xs uppercase tracking-wider hover:bg-[#171717] hover:text-[#F6F2EA] transition-colors cursor-pointer shrink-0"
                  title="Reset all filters"
                >
                  Reset
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  )
}
