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
  Ruler,
  AlertCircle,
  ShieldCheck,
  PackageCheck,
} from 'lucide-react'
import productService from '../services/productService'
import { formatCurrency, calculateDiscountPercentage } from '../utils/formatters'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import ProductCard from '../components/product/ProductCard'
import SizeChartModal from '../components/common/SizeChartModal'
import PageTransition from '../components/motion/PageTransition'

function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-12 space-y-12 animate-pulse text-[#F5F5F5]">
      <div className="h-4 bg-[#292929] w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 aspect-[3/4] bg-[#171717] border border-[#292929]" />
        <div className="lg:col-span-5 space-y-6">
          <div className="h-3 bg-[#B8FF00]/20 w-32" />
          <div className="h-8 bg-[#292929] w-4/5" />
          <div className="h-6 bg-[#B8FF00]/30 w-1/3" />
          <div className="h-24 bg-[#171717]" />
          <div className="h-12 bg-[#292929]" />
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
    details: true,
    material: true,
    shipping: false,
    returns: false,
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
          if (found && found.department) {
            productService
              .getProducts({ department: found.department, limit: 4 })
              .then((res) => {
                if (isMounted && res.items) {
                  setRelatedProducts(res.items.filter((p) => p.id !== found.id).slice(0, 4))
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

  // Set default size and color when product loads
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0)
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0])
      }
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0].name)
      }
    }
  }, [product])

  if (loading) return <ProductDetailSkeleton />

  if (fetchError || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-28 text-center space-y-6 text-[#F5F5F5]">
        <div className="inline-flex p-4 bg-[#171717] border border-[#292929] mb-2">
          <AlertCircle size={40} className="text-[#8B0000]" />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] font-mono text-[#B8FF00] block">
          ARCHIVE NOT DISCOVERED
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-bold uppercase tracking-tight text-[#F5F5F5]">
          Silhouette Unavailable
        </h1>
        <p className="text-sm text-[#A6A6A6] tracking-wider max-w-md mx-auto leading-relaxed">
          {fetchError || 'The garment or archive record you are looking for has been retired or does not exist.'}
        </p>
        <div className="pt-4">
          <Link
            to="/shop"
            className="alt-btn-accent"
          >
            <span>RETURN TO ARCHIVE</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85']

  const activeImage = images[activeImageIndex] || images[0]
  const discountPercent = calculateDiscountPercentage(product.price, product.originalPrice)
  const inWishlist = isInWishlist(product.id)
  const isSale = product.isSale || (product.originalPrice && product.originalPrice > product.price)

  const toggleAccordion = (section) => {
    setOpenAccordions((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleAddToCart = () => {
    let hasError = false
    if (product.sizes && product.sizes.length > 1 && !selectedSize) {
      setSizeError(true)
      hasError = true
    } else {
      setSizeError(false)
    }

    if (hasError) return

    addToCart(product, selectedSize || 'One Size', selectedColor || 'Default', quantity)
    setAddedSuccess(true)
    setTimeout(() => setAddedSuccess(false), 2000)
    openCart()
  }

  return (
    <PageTransition className="w-full bg-[#090909] text-[#F5F5F5] min-h-screen pb-24">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="border-b border-[#292929] bg-[#111111] py-3.5 px-4 sm:px-8 md:px-12 lg:px-16 text-xs font-mono text-[#A6A6A6]">
        <div className="max-w-7xl mx-auto flex items-center space-x-2">
          <Link to="/" className="hover:text-[#B8FF00] transition-colors">
            AUREVA
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#B8FF00] transition-colors">
            SHOP
          </Link>
          <span>/</span>
          <Link
            to={`/shop?category=${encodeURIComponent(product.category || '')}`}
            className="hover:text-[#B8FF00] transition-colors uppercase"
          >
            {product.category || 'APPAREL'}
          </Link>
          <span>/</span>
          <span className="text-[#F5F5F5] uppercase line-clamp-1 font-semibold">{product.name}</span>
        </div>
      </nav>

      {/* Main Product Presentation Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-16 pt-10 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT: Large Product Gallery */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24">
            {/* Primary Large Image Frame */}
            <div className="relative aspect-[3/4] bg-[#111111] border border-[#292929] overflow-hidden">
              <img
                src={activeImage}
                alt={`${product.name} - view ${activeImageIndex + 1}`}
                className="w-full h-full object-cover object-center"
              />

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {isSale && (
                  <span className="alt-badge-crimson">
                    {discountPercent > 0 ? `-${discountPercent}%` : 'SALE'}
                  </span>
                )}
                {product.isNew && (
                  <span className="font-condensed text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-[#090909] text-[#B8FF00] border border-[#B8FF00]/60">
                    NEW DROP
                  </span>
                )}
              </div>

              {/* Wishlist Button Overlay */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
                  inWishlist
                    ? 'bg-[#B8FF00] border-[#B8FF00] text-[#090909]'
                    : 'bg-[#090909]/80 backdrop-blur-sm border-[#292929] text-[#F5F5F5] hover:text-[#B8FF00] hover:border-[#B8FF00]'
                }`}
              >
                <Heart size={18} className={inWishlist ? 'fill-current' : ''} />
              </button>
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 sm:w-24 aspect-[3/4] shrink-0 border overflow-hidden transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#B8FF00] ring-1 ring-[#B8FF00]'
                        : 'border-[#292929] opacity-60 hover:opacity-100 hover:border-[#404040]'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Information, Purchase Controls & Details */}
          <div className="lg:col-span-5 space-y-7">
            {/* Title, Category & Price */}
            <div className="space-y-3 pb-6 border-b border-[#292929]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-[#B8FF00] font-bold">
                  {product.category} // {product.department || 'APPAREL'}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#737373]">
                  SKU: {product.sku || 'AUR-ALT-MMXXVI'}
                </span>
              </div>

              <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#F5F5F5] leading-tight">
                {product.name}
              </h1>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="font-mono text-3xl font-bold text-[#F5F5F5]">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="font-mono text-lg text-[#737373] line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Stock Status Indicator */}
              <div className="pt-2 flex items-center gap-2 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-[#B8FF00] inline-block shadow-[0_0_6px_#B8FF00]" />
                <span className="text-[#A6A6A6] uppercase tracking-wider">
                  {product.stock && product.stock < 5
                    ? `LIMITED STOCK // ONLY ${product.stock} PIECES REMAIN`
                    : 'IN STOCK // READY FOR EXPRESS DISPATCH'}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-[#A6A6A6] font-light leading-relaxed">
              {product.description ||
                'Sculptural architecture, heavy double-faced wool, raw hardware, and dark subversive tailored drape.'}
            </p>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#A6A6A6] uppercase tracking-wider">
                    COLOR: <strong className="text-[#F5F5F5]">{selectedColor}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {product.colors.map((col) => (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => setSelectedColor(col.name)}
                      className={`p-1 border transition-colors cursor-pointer ${
                        selectedColor === col.name ? 'border-[#B8FF00]' : 'border-[#292929] hover:border-[#404040]'
                      }`}
                      title={col.name}
                    >
                      <span
                        className="w-5 h-5 block border border-[#404040]"
                        style={{ backgroundColor: col.hex || '#111111' }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#A6A6A6] uppercase tracking-wider">
                    SIZE: <strong className="text-[#F5F5F5]">{selectedSize}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-[#B8FF00] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Ruler size={12} />
                    <span>SIZE GUIDE</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        setSelectedSize(sz)
                        setSizeError(false)
                      }}
                      className={`min-w-[48px] py-2.5 px-3.5 text-xs font-mono font-bold uppercase border transition-colors cursor-pointer ${
                        selectedSize === sz
                          ? 'border-[#B8FF00] bg-[#B8FF00] text-[#090909]'
                          : 'border-[#292929] bg-[#171717] text-[#F5F5F5] hover:border-[#404040]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                {sizeError && (
                  <p className="text-xs text-[#8B0000] font-mono">Please select your silhouette size.</p>
                )}
              </div>
            )}

            {/* Quantity Selector & Add To Bag */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-[#292929] bg-[#171717]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-3 text-[#A6A6A6] hover:text-[#F5F5F5] cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-mono text-xs font-bold px-4 text-[#F5F5F5]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-3 text-[#A6A6A6] hover:text-[#F5F5F5] cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Main ADD TO BAG Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 alt-btn-accent text-sm"
                >
                  {addedSuccess ? (
                    <>
                      <Check size={18} />
                      <span>ADDED TO BAG</span>
                    </>
                  ) : (
                    <span>ADD TO BAG</span>
                  )}
                </button>
              </div>

              {/* Free Courier Notice */}
              <div className="p-3.5 bg-[#111111] border border-[#292929] flex items-center gap-3 text-xs font-mono text-[#A6A6A6]">
                <Truck size={16} className="text-[#B8FF00] shrink-0" />
                <span>COMPLIMENTARY EXPRESS COURIER ON ALL ORDERS OVER ₹2,999</span>
              </div>
            </div>

            {/* Accordions: Details, Material, Size Guide, Shipping, Returns */}
            <div className="border-t border-[#292929] divide-y divide-[#292929] pt-2">
              {/* DETAILS Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion('details')}
                  className="w-full py-4 flex items-center justify-between text-left font-condensed font-bold text-sm uppercase tracking-wider text-[#F5F5F5] hover:text-[#B8FF00] transition-colors cursor-pointer"
                >
                  <span>PRODUCT DETAILS</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordions.details ? 'rotate-180 text-[#B8FF00]' : ''
                    }`}
                  />
                </button>
                {openAccordions.details && (
                  <div className="pb-4 text-xs font-sans text-[#A6A6A6] space-y-2 leading-relaxed">
                    <ul className="list-disc list-inside space-y-1">
                      {product.details && product.details.length > 0 ? (
                        product.details.map((d, idx) => <li key={idx}>{d}</li>)
                      ) : (
                        <>
                          <li>Subversive tailored construction with articulated darts</li>
                          <li>Deep reinforced welt pockets and concealed closures</li>
                          <li>Designed in Paris; crafted in limited capsule runs</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* MATERIAL Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion('material')}
                  className="w-full py-4 flex items-center justify-between text-left font-condensed font-bold text-sm uppercase tracking-wider text-[#F5F5F5] hover:text-[#B8FF00] transition-colors cursor-pointer"
                >
                  <span>MATERIAL & COMPOSITION</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordions.material ? 'rotate-180 text-[#B8FF00]' : ''
                    }`}
                  />
                </button>
                {openAccordions.material && (
                  <div className="pb-4 text-xs font-sans text-[#A6A6A6] space-y-2 leading-relaxed">
                    <p>
                      <strong className="text-[#F5F5F5]">Fabrication:</strong> {product.materials || '720 GSM Double-Faced Virgin Wool & Mulberry Silk'}.
                    </p>
                    <p>
                      <strong className="text-[#F5F5F5]">Care:</strong> {product.careInstructions || 'Specialist dry clean only. Store in breathable garment cover.'}
                    </p>
                  </div>
                )}
              </div>

              {/* SHIPPING Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full py-4 flex items-center justify-between text-left font-condensed font-bold text-sm uppercase tracking-wider text-[#F5F5F5] hover:text-[#B8FF00] transition-colors cursor-pointer"
                >
                  <span>SHIPPING & DELIVERY</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordions.shipping ? 'rotate-180 text-[#B8FF00]' : ''
                    }`}
                  />
                </button>
                {openAccordions.shipping && (
                  <div className="pb-4 text-xs font-sans text-[#A6A6A6] space-y-1.5 leading-relaxed">
                    <p>
                      Orders dispatched within 24–48 hours via tracked signature express courier. Standard metropolitan delivery takes 3 to 5 business days.
                    </p>
                  </div>
                )}
              </div>

              {/* RETURNS Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => toggleAccordion('returns')}
                  className="w-full py-4 flex items-center justify-between text-left font-condensed font-bold text-sm uppercase tracking-wider text-[#F5F5F5] hover:text-[#B8FF00] transition-colors cursor-pointer"
                >
                  <span>RETURNS & EXCHANGES</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      openAccordions.returns ? 'rotate-180 text-[#B8FF00]' : ''
                    }`}
                  />
                </button>
                {openAccordions.returns && (
                  <div className="pb-4 text-xs font-sans text-[#A6A6A6] space-y-1.5 leading-relaxed">
                    <p>
                      14-day return and exchange window from delivery date. Garments must remain unworn with original atelier seals intact.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RELATED SILHOUETTES SECTION */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-[#292929]">
            <div className="mb-10">
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-[#B8FF00] block mb-1">
                COMPATIBLE ARCHIVES
              </span>
              <h2 className="font-display font-bold text-3xl uppercase tracking-tight text-[#F5F5F5]">
                RELATED SILHOUETTES
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} showQuickAdd={true} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Persistent Size Guide Modal */}
      <SizeChartModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </PageTransition>
  )
}
