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
  X,
  Ruler,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { PRODUCTS } from '../data/products'
import productService from '../services/productService'
import { formatCurrency, calculateDiscountPercentage } from '../utils/formatters'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import Button from '../components/ui/Button'
import ProductCard from '../components/product/ProductCard'
import SizeChartModal from '../components/common/SizeChartModal'
import PageTransition from '../components/motion/PageTransition'
import TiltCard from '../components/motion/TiltCard'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart, openCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  // Find product from centralized catalog with live backend fetch
  const [product, setProduct] = useState(() => PRODUCTS.find((p) => p.id === id) || null)

  useEffect(() => {
    let isMounted = true
    productService.getById(id).then((found) => {
      if (isMounted && found) {
        setProduct(found)
      }
    })
    return () => {
      isMounted = false
    }
  }, [id])

  // Local state
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [sizeError, setSizeError] = useState(false)
  const [addedSuccess, setAddedSuccess] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)
  const [sizeGuideUnit, setSizeGuideUnit] = useState('cm')

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
    }
  }, [product, id])


  // Handle Missing Product Route gracefully
  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-28 text-center space-y-6 text-white">
        <span className="tag-overline text-[#D4AF37] font-mono">ARCHIVAL REPERTOIRE</span>
        <h1 className="editorial-title text-4xl sm:text-5xl font-serif">
          Silhouette Not Found
        </h1>
        <p className="font-serif text-lg text-gray-400 font-light max-w-md mx-auto">
          The requested monograph piece may have been retired to our private salon archives or the catalog reference is invalid.
        </p>
        <div className="pt-4">
          <Button variant="primary" size="lg" to="/shop">
            Return to Active Catalog
          </Button>
        </div>
      </div>
    )
  }

  // Related products from the same department/category
  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && (p.department === product.department || p.category === product.category)
  ).slice(0, 3)

  const isOneSize =
    product.requiresSize === false ||
    (product.sizes && product.sizes.length === 1 && product.sizes[0].toLowerCase() === 'one size')

  const discountPercent = calculateDiscountPercentage(product.price, product.originalPrice)
  const isDiscounted = discountPercent > 0
  const inWishlist = isInWishlist(product.id)
  const maxStock = product.stock || 10

  const handleAddToCart = () => {
    if (!isOneSize && !selectedSize) {
      setSizeError(true)
      return
    }

    const finalColor = selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0].name : 'Default')
    const finalSize = isOneSize ? 'One Size' : selectedSize

    addToCart(product, finalSize, finalColor, quantity)
    setAddedSuccess(true)
    setSizeError(false)

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
          {/* Main Visual Frame with 3D Tilt & Custom Cursor */}
          <TiltCard
            maxTilt={5}
            glare={true}
            className="relative aspect-[3/4] bg-[#121522] border border-white/10 overflow-hidden group shadow-2xl"
          >
            <div data-cursor="view" className="w-full h-full relative">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
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

        {/* Right Column: Garment Information & Purchase Controls */}
        <div className="lg:col-span-5 space-y-7">
          {/* Header & Pricing */}
          <div className="space-y-3 border-b border-white/10 pb-6">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gray-400 font-mono">
              <span>{product.category} • {product.department}</span>
              <span className={product.inStock ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                {product.inStock ? 'In Stock • Atelier Ready' : 'Archived / Sold Out'}
              </span>
            </div>

            <h1 className="editorial-title text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight">
              {product.name}
            </h1>

            {product.subtitle && (
              <p className="font-serif italic text-base text-gray-300 font-light leading-relaxed">
                {product.subtitle}
              </p>
            )}

            <div className="pt-2 flex items-baseline gap-3">
              <span className="font-serif text-2xl sm:text-3xl font-medium text-white">
                {formatCurrency(product.price)}
              </span>
              {isDiscounted && (
                <>
                  <span className="text-base text-gray-500 line-through font-serif">
                    {formatCurrency(product.originalPrice)}
                  </span>
                  <span className="text-xs font-semibold text-[#D4AF37] glass-panel border-[#D4AF37]/30 px-2 py-0.5 uppercase tracking-wider font-mono">
                    {`Save ${discountPercent}%`}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Color Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs tracking-wider uppercase font-mono">
                <span className="text-gray-400">Selected Hue:</span>
                <span className="font-semibold text-white">{selectedColor}</span>
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
                      selectedColor === c.name
                        ? 'border-[#D4AF37] scale-110 shadow-[0_0_10px_rgba(212,175,55,0.5)]'
                        : 'border-white/20 hover:scale-105'
                    }`}
                  >
                    <span
                      className="block h-full w-full rounded-full border border-black/30"
                      style={{ backgroundColor: c.hex }}
                    />
                  </button>
                ))}
              </div>
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
                  <div className="flex items-center gap-1.5 text-xs text-[#E57373] font-medium pt-1 animate-in fade-in duration-200 font-mono">
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

          {/* Accordion Sections with Smooth Motion Reveal */}
          <div className="divide-y divide-white/10 text-xs">
            {/* 1. Design Commentary */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('commentary')}
                className="w-full flex items-center justify-between text-left uppercase tracking-wider font-mono font-semibold text-white cursor-pointer"
              >
                <span>Design Commentary & Fit</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${openAccordions.commentary ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {openAccordions.commentary && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{ opacity: 1, height: 'auto', overflow: 'hidden' }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="pt-3 space-y-3 font-serif text-sm leading-relaxed text-gray-300 font-light"
                  >
                    <p>{product.description}</p>
                    {product.details && (
                      <ul className="space-y-1.5 pt-2 text-xs font-sans text-gray-400">
                        {product.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Materials & Composition */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('materials')}
                className="w-full flex items-center justify-between text-left uppercase tracking-wider font-mono font-semibold text-white cursor-pointer"
              >
                <span>Materials & Fiber Provenance</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${openAccordions.materials ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {openAccordions.materials && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{ opacity: 1, height: 'auto', overflow: 'hidden' }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="pt-3 space-y-2 text-xs text-gray-300 leading-relaxed font-sans"
                  >
                    <p>
                      <strong className="text-white block">Material Composition:</strong>
                      {product.materials || '100% Noble natural fibers.'}
                    </p>
                    <p>
                      <strong className="text-white block mt-2">Provenance:</strong>
                      Woven in historic partner mills in Northern Italy and Tuscany. Finished without petroleum-based synthetic blends.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Care & Preservation */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('care')}
                className="w-full flex items-center justify-between text-left uppercase tracking-wider font-mono font-semibold text-white cursor-pointer"
              >
                <span>Preservation & Garment Care</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${openAccordions.care ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {openAccordions.care && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{ opacity: 1, height: 'auto', overflow: 'hidden' }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="pt-3 space-y-2 text-xs text-gray-300 leading-relaxed font-sans"
                  >
                    <p>{product.careInstructions || 'Specialist dry clean only. Steam vertical only.'}</p>
                    <p className="text-[11px] text-gray-400 italic font-serif">
                      All AUREVA garments include complimentary seam and hardware servicing by our atelier repair team.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. Shipping & Returns */}
            <div className="py-4">
              <button
                type="button"
                onClick={() => toggleAccordion('shipping')}
                className="w-full flex items-center justify-between text-left uppercase tracking-wider font-mono font-semibold text-white cursor-pointer"
              >
                <span>Shipping, Duties & Salon Returns</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${openAccordions.shipping ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {openAccordions.shipping && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{ opacity: 1, height: 'auto', overflow: 'hidden' }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="pt-3 space-y-2 text-xs text-gray-300 leading-relaxed font-sans"
                  >
                    <p>
                      Orders placed before 14:00 CET are dispatched same-day via express insured air courier. Delivery to major metropolitan centers takes 2–4 business days.
                    </p>
                    <p>
                      Complimentary 30-day returns in original archival packaging with all serialized seals intact.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-16 border-t border-white/10" aria-label="Complementary wardrobe pieces">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="tag-overline text-[#D4AF37] font-mono">COMPLEMENTARY REPERTOIRE</span>
              <h2 className="editorial-title text-3xl sm:text-4xl font-serif text-white mt-1">
                From The Same Wardrobe
              </h2>
            </div>
            <Link
              to={`/shop?department=${product.department}`}
              className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] hover:text-white border-b border-[#D4AF37]/50 pb-0.5 transition-colors self-start sm:self-auto font-mono"
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

      {/* Interactive Atelier Size Guide Modal */}
      <SizeChartModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        initialDepartment={product?.department || product?.category || 'Women'}
      />
    </PageTransition>
  )
}
