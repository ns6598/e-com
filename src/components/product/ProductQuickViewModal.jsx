import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X, Heart, Plus, Minus, Check, Sparkles, ZoomIn, Eye, ArrowRight, ShieldCheck } from 'lucide-react'
import { formatCurrency, calculateDiscountPercentage } from '../../utils/formatters'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import Button from '../ui/Button'

export default function ProductQuickViewModal({ product, isOpen, onClose }) {
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isZooming, setIsZooming] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [addedSuccess, setAddedSuccess] = useState(false)

  const imageContainerRef = useRef(null)

  // Initialize selections when product changes
  useEffect(() => {
    if (product) {
      setActiveImageIndex(0)
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0].name : 'Default')
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'One Size')
      setQuantity(1)
      setAddedSuccess(false)
    }
  }, [product])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  const images = product.images && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'
  ]

  const activeImage = images[activeImageIndex] || images[0]
  const discountPercent = calculateDiscountPercentage(product.price, product.originalPrice)
  const inWishlist = isInWishlist(product.id)

  const handleMouseMove = (e) => {
    if (!imageContainerRef.current) return
    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }

  const handleAddToCart = () => {
    const finalSize = selectedSize || 'One Size'
    const finalColor = selectedColor || 'Default'
    addToCart(product, finalSize, finalColor, quantity)
    setAddedSuccess(true)
    setTimeout(() => {
      setAddedSuccess(false)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 md:p-8">
      {/* Frosted Liquid Glass Backdrop */}
      <div
        className="fixed inset-0 bg-[#06070A]/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Quick View ${product.name}`}
        className="relative w-full max-w-4xl glass-panel-gold bg-[#0E1017]/95 rounded-sm overflow-hidden z-10 shadow-2xl transition-all duration-300 border border-white/10"
      >
        {/* Top Bar with Editorial Monograph & Close Button */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-[#121520]/80">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#D4AF37]">
              ATELIER QUICK-INSPECT • {product.id.toUpperCase()}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-sm cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Interactive Image Gallery with Zoom Magnifier */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-white/10 bg-[#08090E]/60">
            {/* Main Interactive Zoom Canvas */}
            <div
              ref={imageContainerRef}
              className="relative aspect-[3/4] w-full overflow-hidden bg-[#121520] border border-white/10 cursor-crosshair group rounded-xs"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={activeImage}
                alt={`${product.name} view ${activeImageIndex + 1}`}
                className={`w-full h-full object-cover object-top transition-transform duration-200 ${
                  isZooming ? 'scale-[2.2]' : 'scale-100'
                }`}
                style={
                  isZooming
                    ? {
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      }
                    : undefined
                }
              />

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
                {discountPercent > 0 && (
                  <span className="bg-[#7E1828] text-white text-[9px] uppercase tracking-[0.2em] font-semibold px-2 py-0.5">
                    -{discountPercent}% OFF
                  </span>
                )}
                {product.tag && (
                  <span className="bg-[#D4AF37] text-[#08090D] text-[9px] uppercase tracking-[0.2em] font-bold px-2 py-0.5">
                    {product.tag}
                  </span>
                )}
              </div>

              {/* Interactive Zoom Indicator Pill */}
              <div className="absolute bottom-3 right-3 bg-[#08090D]/80 backdrop-blur-md border border-white/10 px-2.5 py-1 flex items-center gap-1.5 text-[9px] uppercase font-mono tracking-wider text-gray-300 pointer-events-none">
                <ZoomIn size={11} className="text-[#D4AF37]" />
                <span>{isZooming ? 'Fabric Lens Active' : 'Hover to Inspect Weave'}</span>
              </div>
            </div>

            {/* Multi-Angle Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-[3/4] w-14 shrink-0 overflow-hidden border transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.3)] ring-1 ring-[#D4AF37]'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover object-top" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-center font-mono py-0.5 text-gray-300">
                      0{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Garment Information & Purchase Controls */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-5">
              {/* Overline & Collection */}
              <div className="space-y-1">
                <span className="tag-overline text-[#D4AF37] block">
                  {product.collection || 'AUREVA ATELIER COLLECTION'}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white tracking-tight leading-tight">
                  {product.name}
                </h3>
                {product.subtitle && (
                  <p className="font-serif italic text-sm text-gray-400 font-light">
                    {product.subtitle}
                  </p>
                )}
              </div>

              {/* Price & Availability */}
              <div className="flex items-baseline gap-3 pt-1 border-b border-white/10 pb-4">
                <span className="font-serif text-2xl text-white font-medium">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="font-serif text-base text-gray-500 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
                <span className="ml-auto text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                  {product.stock ? `${product.stock} pieces remaining` : 'In Atelier'}
                </span>
              </div>

              {/* Editorial Description */}
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
                {product.description}
              </p>

              {/* Color Swatch Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="uppercase tracking-widest text-gray-400 font-mono text-[10px]">
                      COLORWAY: <span className="text-white font-semibold">{selectedColor}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`h-7 w-7 rounded-full border-2 transition-transform cursor-pointer relative ${
                          selectedColor === c.name
                            ? 'border-[#D4AF37] scale-110 shadow-[0_0_8px_rgba(212,175,55,0.5)]'
                            : 'border-white/20 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {selectedColor === c.name && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Check size={11} className="text-white drop-shadow" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && product.requiresSize !== false && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="uppercase tracking-widest text-gray-400 font-mono text-[10px]">
                      ATELIER SIZING: <span className="text-white font-semibold">{selectedSize}</span>
                    </span>
                    <span className="text-[10px] text-gray-400 tracking-wider">True to European fit</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`px-3.5 py-1.5 text-xs font-mono tracking-widest border transition-all cursor-pointer ${
                          selectedSize === s
                            ? 'border-[#D4AF37] bg-[#D4AF37] text-[#08090D] font-bold shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                            : 'border-white/15 bg-white/5 text-gray-300 hover:border-white/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 pt-1">
                <span className="uppercase tracking-widest text-gray-400 font-mono text-[10px]">QUANTITY:</span>
                <div className="flex items-center border border-white/20 bg-white/5">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-2.5 py-1 text-gray-300 hover:text-white disabled:opacity-30 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="px-3 font-mono text-xs font-semibold text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-2.5 py-1 text-gray-300 hover:text-white cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions & Atelier Guarantees */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 px-6 font-sans text-xs uppercase font-semibold tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'gold-gradient-bg text-[#08090D] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-[0.99]'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check size={14} />
                      <span>ADDED TO SELECTION</span>
                    </>
                  ) : (
                    <>
                      <span>ADD TO SELECTION</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 border transition-all cursor-pointer ${
                    inWishlist
                      ? 'border-[#7E1828] bg-[#7E1828]/20 text-[#D4AF37]'
                      : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:text-white'
                  }`}
                  aria-label="Save to Wishlist"
                  title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart size={16} fill={inWishlist ? '#D4AF37' : 'none'} />
                </button>
              </div>

              {/* Full Product Detail Link & Guarantee */}
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono tracking-wider pt-1">
                <div className="flex items-center gap-1.5 text-gray-300">
                  <ShieldCheck size={13} className="text-[#D4AF37]" />
                  <span>Complimentary Insured Courier & Returns</span>
                </div>
                <Link
                  to={`/product/${product.id}`}
                  onClick={onClose}
                  className="text-[#D4AF37] hover:underline flex items-center gap-1"
                >
                  <span>FULL MONOGRAPH</span>
                  <ArrowRight size={10} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
