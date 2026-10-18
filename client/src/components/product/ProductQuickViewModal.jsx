import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X, Heart, Plus, Minus, Check, ArrowRight, Ruler, Eye } from 'lucide-react'
import { formatCurrency, calculateDiscountPercentage } from '../../utils/formatters'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import SizeChartModal from '../common/SizeChartModal'

export default function ProductQuickViewModal({ product, isOpen, onClose }) {
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [addedSuccess, setAddedSuccess] = useState(false)
  const [sizeChartOpen, setSizeChartOpen] = useState(false)

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
  const isSale = product.isSale || (product.originalPrice && product.originalPrice > product.price)

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
      {/* Dark Alternative Backdrop */}
      <div
        className="fixed inset-0 bg-[#090909]/85 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Quick View ${product.name}`}
        className="relative w-full max-w-4xl bg-[#111111] border border-[#292929] text-[#F5F5F5] overflow-hidden z-10 shadow-2xl transition-all duration-300"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#292929] bg-[#171717]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#B8FF00]">
              QUICK VIEW // {product.category || 'PIECE'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#A6A6A6] hover:text-[#B8FF00] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          {/* Gallery Column */}
          <div className="md:col-span-6 space-y-3">
            <div className="relative aspect-[3/4] bg-[#090909] border border-[#292929] overflow-hidden">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              {isSale && (
                <div className="absolute top-3 left-3">
                  <span className="alt-badge-crimson">
                    {discountPercent > 0 ? `-${discountPercent}%` : 'SALE'}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-18 shrink-0 border overflow-hidden transition-colors cursor-pointer ${
                      activeImageIndex === idx ? 'border-[#B8FF00]' : 'border-[#292929] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#737373]">
                  {product.category}
                </span>
                <h3 className="font-condensed font-bold text-2xl uppercase tracking-wider text-[#F5F5F5] mt-1">
                  {product.name}
                </h3>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-2xl font-bold text-[#F5F5F5]">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="font-mono text-sm text-[#737373] line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-[#A6A6A6] font-light leading-relaxed line-clamp-3">
                {product.description || 'Crafted with premium materials, architectural tailoring, and subcultural rebellion.'}
              </p>

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#A6A6A6] uppercase tracking-wider">SIZE: {selectedSize}</span>
                    <button
                      type="button"
                      onClick={() => setSizeChartOpen(true)}
                      className="text-[#B8FF00] hover:underline flex items-center gap-1 cursor-pointer"
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
                        onClick={() => setSelectedSize(sz)}
                        className={`min-w-[42px] py-1.5 px-3 text-xs font-mono uppercase font-bold border transition-colors cursor-pointer ${
                          selectedSize === sz
                            ? 'border-[#B8FF00] bg-[#B8FF00] text-[#090909]'
                            : 'border-[#292929] bg-[#171717] text-[#F5F5F5] hover:border-[#404040]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-2">
                <span className="font-mono text-xs uppercase tracking-wider text-[#A6A6A6] block">
                  QUANTITY
                </span>
                <div className="flex items-center border border-[#292929] w-max bg-[#171717]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-[#A6A6A6] hover:text-[#F5F5F5] cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-mono text-xs font-bold px-4 text-[#F5F5F5]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-[#A6A6A6] hover:text-[#F5F5F5] cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#292929] space-y-3">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 alt-btn-accent"
                >
                  {addedSuccess ? (
                    <>
                      <Check size={16} />
                      <span>ADDED TO BAG</span>
                    </>
                  ) : (
                    <span>ADD TO BAG</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 border transition-colors cursor-pointer flex items-center justify-center ${
                    inWishlist
                      ? 'bg-[#B8FF00] border-[#B8FF00] text-[#090909]'
                      : 'border-[#292929] bg-[#171717] text-[#F5F5F5] hover:border-[#B8FF00] hover:text-[#B8FF00]'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart size={18} className={inWishlist ? 'fill-current' : ''} />
                </button>
              </div>

              <Link
                to={`/product/${product.slug || product.id}`}
                onClick={onClose}
                className="w-full text-center block text-xs font-mono uppercase tracking-widest text-[#A6A6A6] hover:text-[#B8FF00] transition-colors py-1"
              >
                VIEW FULL SILHOUETTE DOSSIER →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Size Guide Modal */}
      <SizeChartModal isOpen={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
    </div>
  )
}
