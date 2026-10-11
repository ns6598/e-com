import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Plus, Check, AlertCircle, Eye, Sparkles } from 'lucide-react'
import { formatCurrency, calculateDiscountPercentage } from '../../utils/formatters'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import ProductQuickViewModal from './ProductQuickViewModal'

/**
 * Neo-Luxury Liquid Glass Product Card Component
 * Frosted obsidian canvas, gold border glow on hover, multi-angle quick view modal,
 * wishlist toggle, and size-aware rapid add tray
 */
export default function ProductCard({ product, showQuickAdd = true, onQuickView }) {
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const [isHovered, setIsHovered] = useState(false)
  const [selectedSize, setSelectedSize] = useState(null)
  const [sizePromptOpen, setSizePromptOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [internalQuickViewOpen, setInternalQuickViewOpen] = useState(false)

  const inWishlist = isInWishlist(product.id)
  const hasSecondaryImage = product.images && product.images.length > 1
  const displayImage = imgError
    ? 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'
    : isHovered && hasSecondaryImage
    ? product.images[1]
    : product.images[0]

  // Check whether size selection is required
  const isOneSize =
    product.requiresSize === false ||
    (product.sizes && product.sizes.length === 1 && product.sizes[0].toLowerCase() === 'one size')

  // Calculate accurate discount from actual prices
  const discountPercent = calculateDiscountPercentage(product.price, product.originalPrice)

  const handleWishlistClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  const handleOpenQuickView = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onQuickView) {
      onQuickView(product)
    } else {
      setInternalQuickViewOpen(true)
    }
  }

  const handleQuickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isOneSize && !selectedSize) {
      setSizePromptOpen(true)
      return
    }

    const finalSize = isOneSize ? 'One Size' : selectedSize
    const finalColor = product.colors && product.colors.length > 0 ? product.colors[0].name : 'Default'

    addToCart(product, finalSize, finalColor, 1)
    setJustAdded(true)
    setSizePromptOpen(false)

    setTimeout(() => {
      setJustAdded(false)
    }, 1500)
  }

  const handleSelectSize = (e, size) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedSize(size)
    setSizePromptOpen(false)

    const finalColor = product.colors && product.colors.length > 0 ? product.colors[0].name : 'Default'
    addToCart(product, size, finalColor, 1)
    setJustAdded(true)
    setTimeout(() => {
      setJustAdded(false)
    }, 1500)
  }

  return (
    <>
      <article
        className="group relative flex flex-col p-2.5 sm:p-3 glass-card rounded-xs bg-[#0B0D14]/70 border border-white/10 hover:border-[#D4AF37]/40 transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setSizePromptOpen(false)
        }}
      >
        {/* Visual Canvas Container with 3:4 aspect ratio */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#121520] border border-white/5">
          {/* Badges: Accurate Sale % or Tag */}
          <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
            {discountPercent > 0 && (
              <span className="inline-block bg-[#7E1828] text-white text-[9px] uppercase tracking-[0.2em] font-semibold px-2 py-0.5 shadow-md">
                -{discountPercent}% OFF
              </span>
            )}
            {product.tag && discountPercent === 0 && (
              <span className="inline-block bg-[#D4AF37] text-[#08090D] text-[9px] uppercase tracking-[0.2em] font-bold px-2 py-0.5 shadow-md">
                {product.tag}
              </span>
            )}
          </div>

          {/* Quick Action Buttons (Wishlist & Quick View) */}
          <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={handleWishlistClick}
              aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              className="flex h-8 w-8 items-center justify-center bg-[#090A0E]/80 backdrop-blur-md text-gray-300 transition-all duration-200 hover:text-[#D4AF37] hover:bg-[#121522] border border-white/10 cursor-pointer"
            >
              <Heart
                size={14}
                className={`transition-colors duration-200 ${
                  inWishlist ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-current'
                }`}
              />
            </button>

            <button
              type="button"
              onClick={handleOpenQuickView}
              title="Quick inspect garment"
              aria-label={`Quick view ${product.name}`}
              className="opacity-0 group-hover:opacity-100 flex h-8 w-8 items-center justify-center bg-[#090A0E]/80 backdrop-blur-md text-gray-300 transition-all duration-200 hover:text-[#D4AF37] hover:bg-[#121522] border border-white/10 cursor-pointer"
            >
              <Eye size={14} />
            </button>
          </div>

          {/* Product Image Link with secondary image on hover */}
          <Link to={`/product/${product.id}`} className="block h-full w-full">
            <img
              src={displayImage}
              alt={product.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </Link>

          {/* Liquid Glass Quick Add Overlay Tray */}
          {showQuickAdd && product.inStock && (
            <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 bg-[#0B0D14]/95 backdrop-blur-md border-t border-white/15 p-2 sm:p-2.5">
              {/* Size prompt mode */}
              {sizePromptOpen ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#D4AF37] font-mono">
                    <span className="flex items-center gap-1">
                      <AlertCircle size={11} />
                      <span>Choose Size:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSizePromptOpen(false)}
                      className="text-gray-400 hover:text-white text-[9px] uppercase tracking-wider cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {product.sizes?.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={(e) => handleSelectSize(e, size)}
                        className="px-2 py-0.5 text-[9px] font-mono tracking-wider border border-white/20 bg-white/5 text-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37] cursor-pointer"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-1.5">
                  {/* Size buttons */}
                  {!isOneSize ? (
                    <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                      {product.sizes?.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={(e) => handleSelectSize(e, size)}
                          title={`Select size ${size}`}
                          className={`px-1.5 py-0.5 text-[9px] font-mono tracking-wider border transition-colors cursor-pointer ${
                            selectedSize === size
                              ? 'border-[#D4AF37] bg-[#D4AF37] text-[#08090D] font-bold'
                              : 'border-white/15 text-gray-300 hover:border-white/40'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 font-mono">
                      Standard Fit
                    </span>
                  )}

                  {/* Tactile Add Button */}
                  <button
                    type="button"
                    onClick={handleQuickAdd}
                    aria-label={`Add ${product.name} to cart`}
                    className="shrink-0 flex items-center gap-1 gold-gradient-bg text-[#08090D] px-2.5 py-1 text-[9px] uppercase font-bold tracking-widest hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                  >
                    {justAdded ? (
                      <>
                        <Check size={11} />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus size={11} />
                        <span>{isOneSize ? 'Add' : selectedSize ? `+ (${selectedSize})` : 'Size'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Product Meta & Typography */}
        <div className="mt-3 flex flex-col space-y-1">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.22em] text-[#D4AF37] font-mono">
            <span>{product.category}</span>
            <span className="text-gray-400">{product.department}</span>
          </div>

          <Link
            to={`/product/${product.id}`}
            className="font-serif text-base sm:text-lg tracking-normal text-white hover:text-[#D4AF37] transition-colors duration-200 line-clamp-1"
          >
            {product.name}
          </Link>

          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm tracking-wider font-medium text-white">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[11px] text-gray-500 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Color Swatch Dots */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1" title={product.colors.map((c) => c.name).join(', ')}>
                {product.colors.map((c) => (
                  <span
                    key={c.name}
                    className="h-2 w-2 rounded-full border border-white/20"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Internal Modal if no parent handler was passed */}
      {!onQuickView && (
        <ProductQuickViewModal
          product={product}
          isOpen={internalQuickViewOpen}
          onClose={() => setInternalQuickViewOpen(false)}
        />
      )}
    </>
  )
}
