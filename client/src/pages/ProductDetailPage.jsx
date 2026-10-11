import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Plus,
  Minus,
  Check,
  ChevronRight,
  Truck,
  RotateCcw,
  ChevronDown,
  Ruler,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import productService from '../services/productService'
import { formatCurrency, calculateDiscountPercentage } from '../utils/formatters'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import Button from '../components/ui/Button'
import ProductCard from '../components/product/ProductCard'
import SizeChartModal from '../components/common/SizeChartModal'
import PageTransition from '../components/motion/PageTransition'
import TiltCard from '../components/motion/TiltCard'

function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-pulse text-white">
      <div className="h-4 bg-white/10 w-48 rounded-xs" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 aspect-[3/4] bg-white/5 border border-white/10 rounded-xs" />
        <div className="lg:col-span-5 space-y-6">
          <div className="h-3 bg-[#D4AF37]/30 w-32 rounded-xs" />
          <div className="h-8 bg-white/15 w-4/5 rounded-xs" />
          <div className="h-6 bg-[#D4AF37]/20 w-1/3 rounded-xs" />
          <div className="h-20 bg-white/5 rounded-xs" />
          <div className="h-12 bg-white/10 rounded-xs" />
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart, openCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  // State
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])

  // Purchase controls state
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [sizeError, setSizeError] = useState(false)
  const [colorError, setColorError] = useState(false)
  const [addedSuccess, setAddedSuccess] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  // Accordion state
  const [openAccordions, setOpenAccordions] = useState({
    commentary: true,
    materials: true,
    care: false,
    shipping: false,
  })

  // Fetch product directly from backend REST API using ID or Slug
  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setFetchError(null)

    async function loadProduct() {
      try {
        const found = await productService.getByIdOrSlug(id)
        if (isMounted) {
          setProduct(found)
          // Also fetch real related products
          if (found && found.department) {
            productService
              .getProducts({ department: found.department, limit: 4 })
              .then((res) => {
                if (isMounted && res.items) {
                  setRelatedProducts(res.items.filter((p) => p.id !== found.id).slice(0, 3))
                }
              })
              .catch(() => {})
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('[ProductDetailPage] Failed to fetch product:', err)
          setFetchError(err.message || 'Product not found')
          setProduct(null)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadProduct()
    return () => {
      isMounted = false
    }
  }, [id])

  // Synchronize selection state when product loads
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0)
      const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0].name : ''
      setSelectedColor(defaultColor)

      const isOneSize =
        product.requiresSize === false ||
        (product.sizes && product.sizes.length === 1 && product.sizes[0].toLowerCase() === 'one size')
      setSelectedSize(isOneSize ? 'One Size' : '')

      setQuantity(1)
      setSizeError(false)
      setColorError(false)
      setAddedSuccess(false)
    }
  }, [product])

  if (loading) {
    return <ProductDetailSkeleton />
  }

  // Handle Missing Product or API error
  if (!product || fetchError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-28 text-center space-y-6 text-white">
        <span className="tag-overline text-[#D4AF37] font-mono">ARCHIVAL REPERTOIRE</span>
        <h1 className="editorial-title text-4xl sm:text-5xl font-serif">
          Silhouette Not Found
        </h1>
        <p className="font-serif text-lg text-gray-400 font-light max-w-md mx-auto">
          {fetchError || 'The requested monograph piece may have been retired to our private salon archives or the catalog reference is invalid.'}
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Button variant="primary" size="lg" to="/shop">
            Return to Active Catalog
          </Button>
        </div>
      </div>
    )
  }

  const isOneSize =
    product.requiresSize === false ||
    (product.sizes && product.sizes.length === 1 && product.sizes[0].toLowerCase() === 'one size')

  const discountPercent = calculateDiscountPercentage(product.price, product.originalPrice)
  const inWishlist = isInWishlist(product.id)
  const maxStock = product.stock || 10

  const handleAddToCart = () => {
    let hasValidationError = false

    if (!isOneSize && !selectedSize) {
      setSizeError(true)
      hasValidationError = true
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setColorError(true)
      hasValidationError = true
    }

    if (hasValidationError) return

    const finalColor = selectedColor || 'Default'
    const finalSize = isOneSize ? 'One Size' : selectedSize

    addToCart(product, finalSize, finalColor, quantity)
    setAddedSuccess(true)
    setSizeError(false)
    setColorError(false)

    setTimeout(() => {
      setAddedSuccess(false)
      openCart()
    }, 600)
  }

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85']

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16 text-white">
      {/* Editorial Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 font-mono">
        <Link to="/" className="hover:text-[#D4AF37] transition-colors">
          Atelier Home
        </Link>
        <ChevronRight size={12} className="text-gray-600" />
        <Link to="/shop" className="hover:text-[#D4AF37] transition-colors">
          Catalog
        </Link>
        <ChevronRight size={12} className="text-gray-600" />
        <Link to={`/shop?department=${product.department}`} className="hover:text-[#D4AF37] transition-colors">
          {product.department}
        </Link>
        <ChevronRight size={12} className="text-gray-600" />
        <span className="text-[#D4AF37] font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase: Gallery (Left) + Purchase Controls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column: Product Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Visual Frame */}
          <TiltCard
            maxTilt={5}
            glare={true}
            className="relative aspect-[3/4] bg-[#121522] border border-white/10 overflow-hidden group shadow-2xl"
          >
            <div data-cursor="view" className="w-full h-full relative">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={`${product.name} angle ${activeImageIndex + 1}`}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'
                }}
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-104"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 items-start">
                {discountPercent > 0 && (
                  <span className="bg-[#7E1828] text-white text-[10px] uppercase tracking-[0.22em] px-3 py-1 font-semibold shadow-md">
                    -{discountPercent}% OFF
                  </span>
                )}
                {product.tag && discountPercent === 0 && (
                  <span className="bg-[#D4AF37] text-[#08090D] text-[10px] uppercase tracking-[0.22em] px-3 py-1 font-bold shadow-md">
                    {product.tag}
                  </span>
                )}
              </div>

              {/* Low Stock Indicator */}
              {product.stock && product.stock <= 5 && (
                <div className="absolute bottom-4 right-4 z-10 glass-panel border-white/10 text-white px-3 py-1 text-[9px] uppercase tracking-widest font-mono">
                  Only {product.stock} pieces in atelier batch
                </div>
              )}
            </div>
          </TiltCard>

          {/* Thumbnail Navigation Row */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2" role="tablist" aria-label="Product image thumbnails">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={activeImageIndex === idx}
                  aria-label={`View angle ${idx + 1}`}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 sm:w-24 aspect-[3/4] border transition-all cursor-pointer shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-[#D4AF37] ring-1 ring-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.4)] opacity-100'
                      : 'border-white/15 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Monograph & Purchasing Controls */}
        <div className="lg:col-span-5 space-y-8">
          {/* Header & Pricing */}
          <div className="space-y-3 border-b border-white/10 pb-6">
            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-[#D4AF37] font-mono">
              <span>{product.department}</span>
              <span>•</span>
              <span>{product.category}</span>
            </div>

            <h1 className="editorial-title text-3xl sm:text-4xl lg:text-5xl font-serif text-white leading-tight">
              {product.name}
            </h1>

            {product.subtitle && (
              <p className="font-serif italic text-sm text-gray-400 font-light">
                {product.subtitle}
              </p>
            )}

            <div className="flex items-baseline gap-4 pt-2">
              <span className="font-serif text-2xl sm:text-3xl text-white font-medium">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="font-serif text-lg text-gray-500 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs tracking-wider uppercase font-mono">
                <span className="text-gray-400">Color Palette:</span>
                <span className="text-[#D4AF37] font-semibold">{selectedColor}</span>
              </div>
              <div className="flex gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c.name)
                      setColorError(false)
                    }}
                    className={`h-9 px-3.5 border transition-all cursor-pointer flex items-center gap-2 text-xs font-mono uppercase tracking-wider ${
                      selectedColor === c.name
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                        : 'border-white/15 text-gray-300 hover:border-white/40'
                    }`}
                  >
                    <span>{c.name}</span>
                    {selectedColor === c.name && <Check size={12} className="text-[#D4AF37]" />}
                  </button>
                ))}
              </div>
              {colorError && (
                <div className="flex items-center gap-1.5 text-xs text-[#E57373] font-medium pt-1 font-mono">
                  <AlertCircle size={14} />
                  <span>Please select a color before adding this piece to your bag.</span>
                </div>
              )}
            </div>
          )}

          {/* Size Selector & Size Guide Trigger */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs tracking-wider uppercase font-mono">
              <span className="text-gray-400">
                {isOneSize ? 'Fit Specification:' : 'Select Silhouette Size:'}
              </span>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] text-[#D4AF37] hover:underline cursor-pointer"
              >
                <Ruler size={13} />
                <span>Size Guide</span>
              </button>
            </div>

            {isOneSize ? (
              <div className="p-3 border border-white/15 glass-panel text-xs font-mono uppercase tracking-wider text-gray-200">
                One Size — Universal Sculptural Fit
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2" role="radiogroup" aria-label="Available sizes">
                  {product.sizes?.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      role="radio"
                      aria-checked={selectedSize === sz}
                      onClick={() => {
                        setSelectedSize(sz)
                        setSizeError(false)
                      }}
                      className={`py-3 text-xs uppercase tracking-wider font-mono font-medium border transition-colors cursor-pointer ${
                        selectedSize === sz
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-[#08090D] font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                          : 'bg-white/5 text-gray-300 border-white/15 hover:border-[#D4AF37]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                {sizeError && (
                  <div className="flex items-center gap-1.5 text-xs text-[#E57373] font-medium pt-1 font-mono">
                    <AlertCircle size={14} />
                    <span>Please select a size before adding this piece to your bag.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quantity, Add to Bag & Wishlist Button */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Stepper */}
              <div className="flex items-center border border-white/20 bg-white/5 h-13 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || !product.inStock}
                  aria-label="Decrease quantity"
                  className="px-3.5 hover:bg-white/10 h-full transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-gray-300"
                >
                  <Minus size={14} />
                </button>
                <span className="w-9 text-center text-xs font-mono font-semibold text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                  disabled={quantity >= maxStock || !product.inStock}
                  aria-label="Increase quantity"
                  className="px-3.5 hover:bg-white/10 h-full transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed text-gray-300"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to Bag CTA */}
              <div className="flex-1">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  fullWidth
                  magnetic={true}
                  className="h-13"
                >
                  {addedSuccess ? (
                    <span className="flex items-center gap-2 text-[#08090D] font-bold">
                      <Check size={16} />
                      <span>Added to Bag</span>
                    </span>
                  ) : product.inStock ? (
                    `Add to Bag • ${formatCurrency(product.price * quantity)}`
                  ) : (
                    'Archived / Sold Out'
                  )}
                </Button>
              </div>

              {/* Wishlist Button with Motion */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                className="h-13 w-13 border border-white/20 glass-panel flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors shrink-0 cursor-pointer"
                title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart
                  size={19}
                  className={`transition-colors ${
                    inWishlist ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-300'
                  }`}
                />
              </motion.button>
            </div>

            {product.stock && product.stock <= 5 && (
              <p className="text-[11px] text-[#D4AF37] uppercase tracking-wider font-mono">
                Atelier Allocation Notice: Only {product.stock} pieces remaining.
              </p>
            )}
          </div>

          {/* Service Guarantees Strip */}
          <div className="grid grid-cols-2 gap-4 py-5 border-y border-white/10 text-xs">
            <div className="flex items-start gap-2.5">
              <Truck size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white uppercase tracking-wider text-[10px] font-mono">White-Glove Courier</p>
                <p className="text-gray-400 text-[11px] mt-0.5">Complimentary express shipping on orders over ₹2,999.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <RotateCcw size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white uppercase tracking-wider text-[10px] font-mono">Complimentary Returns</p>
                <p className="text-gray-400 text-[11px] mt-0.5">30-day salon return window and lifetime seam maintenance.</p>
              </div>
            </div>
          </div>

          {/* Accordion Information Sections */}
          <div className="divide-y divide-white/10 text-xs">
            {/* Curatorial Commentary */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('commentary')}
                className="w-full flex items-center justify-between text-left font-mono uppercase tracking-wider text-gray-200 hover:text-white cursor-pointer"
              >
                <span>Curatorial Commentary</span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-300 ${
                    openAccordions.commentary ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openAccordions.commentary && (
                <div className="mt-3 text-gray-300 font-serif leading-relaxed space-y-2">
                  <p>{product.description}</p>
                </div>
              )}
            </div>

            {/* Noble Materials & Construction */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('materials')}
                className="w-full flex items-center justify-between text-left font-mono uppercase tracking-wider text-gray-200 hover:text-white cursor-pointer"
              >
                <span>Noble Materials & Construction</span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-300 ${
                    openAccordions.materials ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openAccordions.materials && (
                <div className="mt-3 text-gray-300 font-serif leading-relaxed space-y-2">
                  <p>{product.materials || 'Constructed from archival grade fibers with hand-finished interior seams.'}</p>
                </div>
              )}
            </div>

            {/* Atelier Care */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('care')}
                className="w-full flex items-center justify-between text-left font-mono uppercase tracking-wider text-gray-200 hover:text-white cursor-pointer"
              >
                <span>Atelier Care</span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-300 ${
                    openAccordions.care ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openAccordions.care && (
                <div className="mt-3 text-gray-300 font-serif leading-relaxed">
                  <p>{product.careInstructions || 'Specialist dry clean only. Store on wide cedar hangers away from direct ultraviolet radiation.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Silhouettes from PostgreSQL Database */}
      {relatedProducts.length > 0 && (
        <section className="space-y-8 pt-8 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <span className="tag-overline text-[#D4AF37] font-mono">HARMONIOUS ENSEMBLE</span>
              <h2 className="editorial-title text-2xl sm:text-3xl font-serif text-white mt-1">
                Complementary Pieces
              </h2>
            </div>
            <Link
              to={`/shop?department=${product.department}`}
              className="text-xs uppercase tracking-wider text-[#D4AF37] hover:underline font-mono hidden sm:inline"
            >
              Explore {product.department} &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        category={product.category}
      />
    </PageTransition>
  )
}
