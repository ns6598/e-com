import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Plus, Check, Eye, ShoppingBag } from 'lucide-react'
import { formatCurrency, calculateDiscountPercentage } from '../../utils/formatters'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import ProductQuickViewModal from './ProductQuickViewModal'

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
  const primaryImage = imgError
    ? 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'
    : product.images[0]
  const secondaryImage = hasSecondaryImage ? product.images[1] : primaryImage

  // Check whether size selection is required
  const isOneSize =
    product.requiresSize === false ||
    (product.sizes && product.sizes.length === 1 && product.sizes[0].toLowerCase() === 'one size')

  // Calculate accurate discount from actual prices
  const discountPercent = calculateDiscountPercentage(product.price, product.originalPrice)
  const isSale = product.isSale || (product.originalPrice && product.originalPrice > product.price)

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
        className="group relative flex flex-col h-full bg-[#171717] border border-[#292929] hover:border-[#404040] transition-colors duration-200"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setSizePromptOpen(false)
        }}
        data-cursor="view"
      >
        {/* Top Image Gallery Container with Image 1 -> Image 2 swap */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#111111]">
          <Link
            to={`/product/${product.slug || product.id}`}
            className="block w-full h-full"
            aria-label={`View details for ${product.name}`}
          >
            {/* Primary Product Image */}
            <img
              src={primaryImage}
              alt={product.name}
              loading="lazy"
              onError={() => setImgError(true)}
              className={`w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 ${
                hasSecondaryImage && isHovered ? 'opacity-0' : 'opacity-100'
              }`}
            />

            {/* Secondary Product Image (Hover State) */}
            {hasSecondaryImage && (
              <img
                src={secondaryImage}
                alt={`${product.name} alternate view`}
                loading="lazy"
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 ${
                  isHovered ? 'opacity-100 scale-105' : 'opacity-0'
                }`}
              />
            )}
          </Link>

          {/* Badges Container (Top Left) */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
            {isSale && (
              <span className="alt-badge-crimson">
                {discountPercent > 0 ? `-${discountPercent}%` : 'SALE'}
              </span>
            )}
            {product.isNew && (
              <span className="font-condensed text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#090909] text-[#B8FF00] border border-[#B8FF00]/60">
                NEW DROP
              </span>
            )}
          </div>

          {/* Wishlist Button (Top Right) */}
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
              inWishlist
                ? 'bg-[#B8FF00] border-[#B8FF00] text-[#090909]'
                : 'bg-[#090909]/80 backdrop-blur-sm border-[#292929] text-[#F5F5F5] hover:text-[#B8FF00] hover:border-[#B8FF00]'
            }`}
          >
            <Heart size={14} className={inWishlist ? 'fill-current' : ''} />
          </button>

          {/* Desktop Hover Quick View Action Button */}
          <div className="hidden lg:flex absolute bottom-2.5 inset-x-2.5 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              type="button"
              onClick={handleOpenQuickView}
              className="flex-1 py-2 bg-[#090909]/90 hover:bg-[#111111] text-[#F5F5F5] hover:text-[#B8FF00] border border-[#292929] hover:border-[#B8FF00] text-xs font-condensed uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Eye size={13} />
              <span>QUICK VIEW</span>
            </button>
          </div>

          {/* Quick Add Size Selection Drawer Overlay */}
          {sizePromptOpen && product.sizes && product.sizes.length > 0 && (
            <div className="absolute inset-x-0 bottom-0 bg-[#090909]/95 border-t border-[#292929] p-3 z-20 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#A6A6A6] mb-2">
                <span>SELECT SIZE</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSizePromptOpen(false)
                  }}
                  className="hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={(e) => handleSelectSize(e, sz)}
                    className="flex-1 min-w-[36px] py-1 text-xs font-mono border border-[#292929] bg-[#171717] text-[#F5F5F5] hover:border-[#B8FF00] hover:text-[#B8FF00] transition-colors cursor-pointer"
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#737373]">
                {product.category || 'Apparel'}
              </span>
              {/* Optional Color indicator */}
              {product.colors && product.colors.length > 0 && (
                <div className="flex items-center gap-1" title={`${product.colors.length} color available`}>
                  {product.colors.slice(0, 3).map((col, idx) => (
                    <span
                      key={idx}
                      className="w-2 h-2 rounded-full border border-[#404040]"
                      style={{ backgroundColor: col.hex || '#171717' }}
                    />
                  ))}
                </div>
              )}
            </div>

            <Link
              to={`/product/${product.slug || product.id}`}
              className="block group/link"
            >
              <h3 className="font-condensed font-bold text-sm sm:text-base uppercase tracking-wider text-[#F5F5F5] group-hover/link:text-[#B8FF00] transition-colors line-clamp-1">
                {product.name}
              </h3>
            </Link>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#292929]/70">
            {/* Price Presentation */}
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-sm sm:text-base font-bold text-[#F5F5F5]">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="font-mono text-xs text-[#737373] line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Quick Add Button */}
            {showQuickAdd && (
              <button
                type="button"
                onClick={handleQuickAdd}
                aria-label={`Add ${product.name} to bag`}
                className={`px-3 py-1.5 text-xs font-condensed font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 border ${
                  justAdded
                    ? 'bg-[#B8FF00] border-[#B8FF00] text-[#090909]'
                    : 'bg-[#111111] hover:bg-[#B8FF00] text-[#F5F5F5] hover:text-[#090909] border-[#292929] hover:border-[#B8FF00]'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check size={12} />
                    <span>ADDED</span>
                  </>
                ) : (
                  <>
                    <Plus size={12} />
                    <span className="hidden sm:inline">ADD</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </article>

      {/* Internal Quick View Modal if not handled externally */}
      {internalQuickViewOpen && (
        <ProductQuickViewModal
          product={product}
          isOpen={internalQuickViewOpen}
          onClose={() => setInternalQuickViewOpen(false)}
        />
      )}
    </>
  )
}
