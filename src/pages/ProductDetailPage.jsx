import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Heart,
  Plus,
  Minus,
  Check,
  ChevronRight,
  Truck,
  RotateCcw,
  ChevronDown,
  X,
  Ruler,
  AlertCircle,
} from 'lucide-react'
import { PRODUCTS } from '../data/products'
import { formatCurrency, calculateDiscountPercentage } from '../utils/formatters'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import Button from '../components/ui/Button'
import ProductCard from '../components/product/ProductCard'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart, openCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  // Find product from centralized catalog
  const product = PRODUCTS.find((p) => p.id === id)

  // Local state
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [sizeError, setSizeError] = useState(false)
  const [addedSuccess, setAddedSuccess] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [sizeGuideUnit, setSizeGuideUnit] = useState('cm') // 'cm' | 'in'

  // Accordion state: toggle open sections
  const [openAccordions, setOpenAccordions] = useState({
    commentary: true,
    materials: true,
    care: false,
    shipping: false,
  })

  // Synchronize state when product ID in URL changes
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0)
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0].name : '')
      const isOneSize =
        product.requiresSize === false ||
        (product.sizes && product.sizes.length === 1 && product.sizes[0].toLowerCase() === 'one size')
      setSelectedSize(isOneSize ? 'One Size' : '')
      setQuantity(1)
      setSizeError(false)
      setAddedSuccess(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [id, product])

  // Proper Not-Found State for unknown product IDs
  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center space-y-6">
        <span className="tag-overline text-[#6D202D]">ERROR 404</span>
        <h1 className="editorial-title text-4xl sm:text-5xl font-serif text-[#171717]">
          Silhouette Not Found in Archive
        </h1>
        <p className="text-xs text-[#171717]/60 tracking-wider max-w-md mx-auto leading-relaxed">
          The requested garment identifier does not exist or has concluded its limited salon edition run.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Button variant="primary" size="md" to="/shop">
            Return to Collection
          </Button>
          <Button variant="secondary" size="md" to="/">
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const inWishlist = isInWishlist(product.id)
  const isOneSize =
    product.requiresSize === false ||
    (product.sizes && product.sizes.length === 1 && product.sizes[0].toLowerCase() === 'one size')

  const maxStock = product.stock || 10
  const isDiscounted = product.originalPrice && product.originalPrice > product.price
  const discountPercent = calculateDiscountPercentage(product.price, product.originalPrice)

  // Related products from the same department or category (excluding current)
  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.department === product.department)
  ).slice(0, 3)

  const toggleAccordion = (section) => {
    setOpenAccordions((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleAddToCart = () => {
    // Validate size selection
    if (!isOneSize && !selectedSize) {
      setSizeError(true)
      return
    }

    setSizeError(false)
    const finalSize = isOneSize ? 'One Size' : selectedSize
    const finalColor = selectedColor || (product.colors && product.colors[0] ? product.colors[0].name : 'Default')

    addToCart(product, finalSize, finalColor, quantity)
    setAddedSuccess(true)

    setTimeout(() => {
      setAddedSuccess(false)
      openCart()
    }, 1200)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-16 sm:space-y-24">
      {/* =========================================================================
          BREADCRUMB NAVIGATION
          ========================================================================= */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#171717]/60 overflow-x-auto pb-1">
        <Link to="/" className="hover:text-[#6D202D] transition-colors shrink-0">
          Home
        </Link>
        <ChevronRight size={12} className="text-[#171717]/30 shrink-0" />
        <Link to="/shop" className="hover:text-[#6D202D] transition-colors shrink-0">
          Shop
        </Link>
        <ChevronRight size={12} className="text-[#171717]/30 shrink-0" />
        <Link
          to={`/shop?department=${product.department}`}
          className="hover:text-[#6D202D] transition-colors shrink-0"
        >
          {product.department}
        </Link>
        <ChevronRight size={12} className="text-[#171717]/30 shrink-0" />
        <span className="text-[#171717] font-semibold truncate">{product.name}</span>
      </nav>

      {/* =========================================================================
          MAIN PRODUCT SHOWCASE: Gallery (Left) + Purchase Controls (Right)
          Two-column wide desktop layout, stacked mobile layout
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* LEFT COLUMN: LARGE PRODUCT IMAGE GALLERY */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Visual Frame with deliberate crop & zoom */}
          <div className="relative aspect-[3/4] bg-[#ECE5D8] border border-[#171717]/15 overflow-hidden group">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={`${product.name} editorial angle ${activeImageIndex + 1}`}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'
              }}
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-103"
            />

            {/* Badges: Sale % or Tag */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 items-start">
              {discountPercent > 0 && (
                <span className="bg-[#6D202D] text-[#FFFFFF] text-[10px] uppercase tracking-[0.22em] px-3 py-1 font-semibold shadow-xs">
                  -{discountPercent}% OFF
                </span>
              )}
              {product.tag && discountPercent === 0 && (
                <span className="bg-[#171717] text-[#F6F2EA] text-[10px] uppercase tracking-[0.22em] px-3 py-1 font-semibold shadow-xs">
                  {product.tag}
                </span>
              )}
            </div>

            {/* Stock indicator badge if low */}
            {product.stock && product.stock <= 5 && (
              <div className="absolute bottom-4 right-4 z-10 bg-[#171717]/90 text-[#F6F2EA] px-3 py-1 text-[9px] uppercase tracking-widest font-mono backdrop-blur-xs">
                Only {product.stock} pieces in stock
              </div>
            )}
          </div>

          {/* Thumbnail Navigation Row */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2" role="tablist" aria-label="Product image thumbnails">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={activeImageIndex === idx}
                  aria-label={`View angle ${idx + 1}`}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 sm:w-24 aspect-[3/4] border transition-all cursor-pointer shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-[#171717] ring-1 ring-[#171717] opacity-100'
                      : 'border-[#171717]/20 opacity-60 hover:opacity-100'
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

        {/* RIGHT COLUMN: PRODUCT SPECIFICATION & PURCHASE FLOW */}
        <div className="lg:col-span-5 space-y-7">
          {/* Header & Pricing */}
          <div className="space-y-3 border-b border-[#171717]/15 pb-6">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#171717]/60 font-mono">
              <span>{product.category} • {product.department}</span>
              <span className={product.inStock ? 'text-emerald-700 font-medium' : 'text-red-700 font-medium'}>
                {product.inStock ? 'In Stock • Atelier Ready' : 'Archived / Sold Out'}
              </span>
            </div>

            <h1 className="editorial-title text-3xl sm:text-4xl lg:text-5xl font-serif text-[#171717] tracking-tight">
              {product.name}
            </h1>

            {product.subtitle && (
              <p className="font-serif italic text-base text-[#171717]/75 font-light leading-relaxed">
                {product.subtitle}
              </p>
            )}

            <div className="pt-2 flex items-baseline gap-3">
              <span className="font-sans text-2xl sm:text-3xl font-semibold text-[#171717]">
                {formatCurrency(product.price)}
              </span>
              {isDiscounted && (
                <>
                  <span className="text-base text-[#171717]/40 line-through font-sans">
                    {formatCurrency(product.originalPrice)}
                  </span>
                  <span className="text-xs font-semibold text-[#6D202D] bg-[#6D202D]/10 px-2 py-0.5 uppercase tracking-wider">
                    {`Save ${discountPercent}%`}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Color Swatches with accessible labels */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs tracking-wider uppercase">
                <span className="text-[#171717]/60">Selected Hue:</span>
                <span className="font-semibold text-[#171717]">{selectedColor}</span>
              </div>
              <div className="flex items-center gap-2.5" role="radiogroup" aria-label="Color tones">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    role="radio"
                    aria-checked={selectedColor === c.name}
                    aria-label={`Color: ${c.name}`}
                    title={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`h-8 w-8 rounded-full border-2 transition-all p-0.5 cursor-pointer ${
                      selectedColor === c.name ? 'border-[#171717] scale-110 ring-1 ring-[#171717]' : 'border-transparent hover:scale-105'
                    }`}
                  >
                    <span
                      className="block h-full w-full rounded-full border border-black/20"
                      style={{ backgroundColor: c.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selector & Size Guide Trigger */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs tracking-wider uppercase">
              <span className="text-[#171717]/60">
                {isOneSize ? 'Fit Specification:' : 'Select Silhouette Size:'}
              </span>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] text-[#6D202D] hover:underline cursor-pointer"
              >
                <Ruler size={13} />
                <span>Size Guide</span>
              </button>
            </div>

            {isOneSize ? (
              <div className="p-3 border border-[#171717]/20 bg-[#FAF8F5] text-xs font-mono uppercase tracking-wider text-[#171717]">
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
                      className={`py-3 text-xs uppercase tracking-wider font-medium border transition-colors cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-[#171717] text-[#F6F2EA] border-[#171717]'
                          : 'bg-transparent text-[#171717] border-[#171717]/25 hover:border-[#171717] hover:bg-[#171717]/5'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                {sizeError && (
                  <div className="flex items-center gap-1.5 text-xs text-[#6D202D] font-medium pt-1 animate-in fade-in duration-200">
                    <AlertCircle size={14} />
                    <span>Please select a size before adding this piece to your bag.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quantity Selector, Add to Bag & Wishlist Button */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Stepper (constrained strictly between 1 and maxStock) */}
              <div className="flex items-center border border-[#171717]/20 bg-[#FAF8F5] h-13 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || !product.inStock}
                  aria-label="Decrease quantity"
                  className="px-3.5 hover:bg-[#171717]/5 h-full transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus size={14} />
                </button>
                <span className="w-9 text-center text-xs font-mono font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                  disabled={quantity >= maxStock || !product.inStock}
                  aria-label="Increase quantity"
                  className="px-3.5 hover:bg-[#171717]/5 h-full transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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
                  className="h-13"
                >
                  {addedSuccess ? (
                    <span className="flex items-center gap-2 text-emerald-300">
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

              {/* Wishlist Toggle Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                className="h-13 w-13 border border-[#171717]/20 bg-[#FAF8F5] flex items-center justify-center hover:bg-[#171717] hover:text-[#F6F2EA] transition-colors shrink-0 cursor-pointer"
                title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart
                  size={19}
                  className={`transition-colors ${
                    inWishlist ? 'fill-[#6D202D] text-[#6D202D]' : 'text-current'
                  }`}
                />
              </button>
            </div>

            {/* Inventory Warning Notice if under 5 items */}
            {product.stock && product.stock <= 5 && (
              <p className="text-[11px] text-[#6D202D] uppercase tracking-wider font-mono">
                Atelier Allocation Notice: Only {product.stock} pieces remaining.
              </p>
            )}
          </div>

          {/* Service Guarantees Strip */}
          <div className="grid grid-cols-2 gap-4 py-5 border-y border-[#171717]/15 text-xs">
            <div className="flex items-start gap-2.5">
              <Truck size={16} className="text-[#6D202D] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#171717] uppercase tracking-wider text-[10px]">White-Glove Courier</p>
                <p className="text-[#171717]/60 text-[11px] mt-0.5">Complimentary express shipping on orders over ₹25,000.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <RotateCcw size={16} className="text-[#6D202D] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#171717] uppercase tracking-wider text-[10px]">Complimentary Returns</p>
                <p className="text-[#171717]/60 text-[11px] mt-0.5">30-day salon return window and lifetime seam maintenance.</p>
              </div>
            </div>
          </div>

          {/* =========================================================================
              ACCORDION: Design Commentary, Materials, Care & Shipping
              ========================================================================= */}
          <div className="divide-y divide-[#171717]/15 text-xs">
            {/* 1. Design Commentary */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('commentary')}
                className="w-full flex items-center justify-between text-left uppercase tracking-wider font-mono font-semibold text-[#171717] cursor-pointer"
              >
                <span>Design Commentary & Fit</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${openAccordions.commentary ? 'rotate-180' : ''}`}
                />
              </button>
              {openAccordions.commentary && (
                <div className="pt-3 space-y-3 font-serif text-sm leading-relaxed text-[#171717]/80 font-light">
                  <p>{product.description}</p>
                  {product.details && (
                    <ul className="space-y-1.5 pt-2 text-xs font-sans text-[#171717]/70">
                      {product.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#6D202D] mt-1.5 shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* 2. Materials & Composition */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('materials')}
                className="w-full flex items-center justify-between text-left uppercase tracking-wider font-mono font-semibold text-[#171717] cursor-pointer"
              >
                <span>Materials & Fiber Provenance</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${openAccordions.materials ? 'rotate-180' : ''}`}
                />
              </button>
              {openAccordions.materials && (
                <div className="pt-3 space-y-2 text-xs text-[#171717]/75 leading-relaxed font-sans">
                  <p>
                    <strong className="text-[#171717] block">Material Composition:</strong>
                    {product.materials || '100% Noble natural fibers.'}
                  </p>
                  <p>
                    <strong className="text-[#171717] block mt-2">Provenance:</strong>
                    Woven in historic partner mills in Northern Italy and Tuscany. Finished without petroleum-based synthetic blends.
                  </p>
                </div>
              )}
            </div>

            {/* 3. Care & Preservation */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('care')}
                className="w-full flex items-center justify-between text-left uppercase tracking-wider font-mono font-semibold text-[#171717] cursor-pointer"
              >
                <span>Preservation & Garment Care</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${openAccordions.care ? 'rotate-180' : ''}`}
                />
              </button>
              {openAccordions.care && (
                <div className="pt-3 space-y-2 text-xs text-[#171717]/75 leading-relaxed font-sans">
                  <p>{product.careInstructions || 'Specialist dry clean only. Steam vertical only.'}</p>
                  <p className="text-[11px] text-[#171717]/60 italic font-serif">
                    All AUREVA garments include complimentary seam and hardware servicing by our atelier repair team.
                  </p>
                </div>
              )}
            </div>

            {/* 4. Shipping & Returns */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('shipping')}
                className="w-full flex items-center justify-between text-left uppercase tracking-wider font-mono font-semibold text-[#171717] cursor-pointer"
              >
                <span>Shipping, Duties & Salon Returns</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${openAccordions.shipping ? 'rotate-180' : ''}`}
                />
              </button>
              {openAccordions.shipping && (
                <div className="pt-3 space-y-2 text-xs text-[#171717]/75 leading-relaxed font-sans">
                  <p>
                    Orders placed before 14:00 CET are dispatched same-day via express insured air courier. Delivery to major metropolitan centers takes 2–4 business days.
                  </p>
                  <p>
                    Complimentary 30-day returns in original archival packaging with all serialized seals intact.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RELATED PRODUCTS: From The Same Wardrobe / Category
          ========================================================================= */}
      {relatedProducts.length > 0 && (
        <section className="pt-16 border-t border-[#171717]/15" aria-label="Complementary wardrobe pieces">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="tag-overline text-[#6D202D]">COMPLEMENTARY REPERTOIRE</span>
              <h2 className="editorial-title text-3xl sm:text-4xl font-serif text-[#171717] mt-1">
                From The Same Wardrobe
              </h2>
            </div>
            <Link
              to={`/shop?department=${product.department}`}
              className="text-xs uppercase tracking-[0.2em] hover:text-[#6D202D] border-b border-[#171717] pb-0.5 transition-colors self-start sm:self-auto"
            >
              Explore {product.department} Collection →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          SIZE GUIDE MODAL
          ========================================================================= */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Size Guide Chart">
          <div
            className="fixed inset-0 bg-[#171717]/70 backdrop-blur-xs transition-opacity"
            onClick={() => setSizeGuideOpen(false)}
            aria-hidden="true"
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative bg-[#F6F2EA] border border-[#171717]/20 max-w-2xl w-full p-6 sm:p-10 shadow-2xl space-y-6 text-[#171717]">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-[#171717]/10 pb-4">
                <div>
                  <span className="text-[10px] tracking-[0.25em] uppercase text-[#6D202D] font-mono">
                    ATELIER MEASUREMENTS
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-light mt-0.5">
                    Silhouette Size Guide
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(false)}
                  className="p-2 text-[#171717]/60 hover:text-[#171717] cursor-pointer"
                  aria-label="Close size guide"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Unit Toggle */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#171717]/60">Measurement Units:</span>
                <div className="inline-flex border border-[#171717]/20 p-0.5 bg-[#FAF8F5]">
                  <button
                    type="button"
                    onClick={() => setSizeGuideUnit('cm')}
                    className={`px-3 py-1 font-mono uppercase tracking-wider text-[11px] cursor-pointer ${
                      sizeGuideUnit === 'cm'
                        ? 'bg-[#171717] text-[#F6F2EA]'
                        : 'text-[#171717]/60 hover:text-[#171717]'
                    }`}
                  >
                    Centimeters (cm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizeGuideUnit('in')}
                    className={`px-3 py-1 font-mono uppercase tracking-wider text-[11px] cursor-pointer ${
                      sizeGuideUnit === 'in'
                        ? 'bg-[#171717] text-[#F6F2EA]'
                        : 'text-[#171717]/60 hover:text-[#171717]'
                    }`}
                  >
                    Inches (in)
                  </button>
                </div>
              </div>

              {/* Size Measurements Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#171717] text-[#171717]/60">
                      <th className="py-2.5 font-medium">Size</th>
                      <th className="py-2.5 font-medium">Bust/Chest</th>
                      <th className="py-2.5 font-medium">Waist</th>
                      <th className="py-2.5 font-medium">Hips</th>
                      <th className="py-2.5 font-medium">Sleeve</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#171717]/10">
                    {sizeGuideUnit === 'cm' ? (
                      <>
                        <tr>
                          <td className="py-2.5 font-bold">XS</td>
                          <td className="py-2.5">84–88</td>
                          <td className="py-2.5">66–70</td>
                          <td className="py-2.5">90–94</td>
                          <td className="py-2.5">81</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold">S</td>
                          <td className="py-2.5">88–94</td>
                          <td className="py-2.5">70–76</td>
                          <td className="py-2.5">94–100</td>
                          <td className="py-2.5">83</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold">M</td>
                          <td className="py-2.5">94–102</td>
                          <td className="py-2.5">76–84</td>
                          <td className="py-2.5">100–108</td>
                          <td className="py-2.5">85</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold">L</td>
                          <td className="py-2.5">102–110</td>
                          <td className="py-2.5">84–92</td>
                          <td className="py-2.5">108–116</td>
                          <td className="py-2.5">87</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold">XL</td>
                          <td className="py-2.5">110–118</td>
                          <td className="py-2.5">92–100</td>
                          <td className="py-2.5">116–124</td>
                          <td className="py-2.5">89</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <td className="py-2.5 font-bold">XS</td>
                          <td className="py-2.5">33–34.5</td>
                          <td className="py-2.5">26–27.5</td>
                          <td className="py-2.5">35.5–37</td>
                          <td className="py-2.5">31.8</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold">S</td>
                          <td className="py-2.5">34.5–37</td>
                          <td className="py-2.5">27.5–30</td>
                          <td className="py-2.5">37–39.5</td>
                          <td className="py-2.5">32.6</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold">M</td>
                          <td className="py-2.5">37–40</td>
                          <td className="py-2.5">30–33</td>
                          <td className="py-2.5">39.5–42.5</td>
                          <td className="py-2.5">33.4</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold">L</td>
                          <td className="py-2.5">40–43.5</td>
                          <td className="py-2.5">33–36</td>
                          <td className="py-2.5">42.5–45.5</td>
                          <td className="py-2.5">34.2</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 font-bold">XL</td>
                          <td className="py-2.5">43.5–46.5</td>
                          <td className="py-2.5">36–39.5</td>
                          <td className="py-2.5">45.5–48.8</td>
                          <td className="py-2.5">35.0</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Fitting Philosophy Note */}
              <div className="bg-[#FAF8F5] p-4 border border-[#171717]/10 text-xs font-serif leading-relaxed text-[#171717]/75">
                <p>
                  <strong>Atelier Fitting Guidance:</strong> AUREVA garments are cut with deliberate architectural ease. For an oversized runway drape, order your true size. For a tailored, closer silhouette, we advise taking one size down.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
