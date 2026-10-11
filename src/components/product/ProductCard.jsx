import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Plus, Check, AlertCircle } from 'lucide-react'
import { formatCurrency, calculateDiscountPercentage } from '../../utils/formatters'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'

/**
 * Editorial Luxury Product Card Component
 * Consistent aspect ratio, hover secondary image, dynamic discount % badges,
 * wishlist toggle, and intelligent size-aware quick-add
 */
export default function ProductCard({ product, showQuickAdd = true }) {
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const [isHovered, setIsHovered] = useState(false)
  const [selectedSize, setSelectedSize] = useState(null)
  const [sizePromptOpen, setSizePromptOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [imgError, setImgError] = useState(false)

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

  const handleQuickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()

    // If size selection is required and no size is chosen yet, ask user to select a size
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

    // Immediate tactile add once size is actively chosen via prompt or tray
    const finalColor = product.colors && product.colors.length > 0 ? product.colors[0].name : 'Default'
    addToCart(product, size, finalColor, 1)
    setJustAdded(true)
    setTimeout(() => {
      setJustAdded(false)
    }, 1500)
  }

  return (
    <article
      className="group relative flex flex-col bg-transparent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setSizePromptOpen(false)
      }}
    >
      {/* Visual Canvas Container with strictly consistent 3:4 aspect ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#ECE5D8] border border-[#171717]/10">
        {/* Badges: Accurate Sale % or Tag */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          {discountPercent > 0 && (
            <span className="inline-block bg-[#6D202D] text-[#FFFFFF] text-[9px] uppercase tracking-[0.2em] font-semibold px-2 py-0.5 shadow-xs">
              -{discountPercent}% OFF
            </span>
          )}
          {product.tag && discountPercent === 0 && (
            <span className="inline-block bg-[#171717] text-[#F6F2EA] text-[9px] uppercase tracking-[0.2em] font-medium px-2 py-0.5 shadow-xs">
              {product.tag}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center bg-[#F6F2EA]/90 backdrop-blur-sm text-[#171717] transition-all duration-300 hover:bg-[#171717] hover:text-[#F6F2EA] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6D202D] cursor-pointer"
        >
          <Heart
            size={15}
            className={`transition-colors duration-200 ${
              inWishlist ? 'fill-[#6D202D] text-[#6D202D]' : 'text-current'
            }`}
          />
        </button>

        {/* Product Image Link with secondary image on hover */}
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          <img
            src={displayImage}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-104"
          />
        </Link>

        {/* Quick Add Overlay Tray */}
        {showQuickAdd && product.inStock && (
          <div className="absolute inset-x-0 bottom-0 z-20 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 bg-[#F6F2EA]/98 backdrop-blur-md border-t border-[#171717]/15 p-2.5 sm:p-3">
            {/* If size selection is required and user triggered size prompt */}
            {sizePromptOpen ? (
              <div className="space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#6D202D] font-medium">
                  <span className="flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>Choose Size to Add:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSizePromptOpen(false)}
                    className="text-[#171717]/50 hover:text-[#171717] text-[9px] uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {product.sizes?.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={(e) => handleSelectSize(e, size)}
                      className="px-2.5 py-1 text-[10px] tracking-wider transition-colors border border-[#171717] bg-[#171717] text-[#F6F2EA] hover:bg-[#6D202D] hover:border-[#6D202D] cursor-pointer"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                {/* Available Size Pills or One-Size Indicator */}
                {!isOneSize ? (
                  <div className="flex items-center gap-1 overflow-x-auto py-0.5">
                    {product.sizes?.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={(e) => handleSelectSize(e, size)}
                        title={`Add size ${size} to bag`}
                        className={`px-2 py-1 text-[9px] sm:text-[10px] tracking-wider transition-colors border cursor-pointer ${
                          selectedSize === size
                            ? 'border-[#171717] bg-[#171717] text-[#F6F2EA]'
                            : 'border-[#171717]/25 text-[#171717] hover:border-[#171717] hover:bg-[#171717]/5'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider text-[#171717]/60 font-mono">
                    Standard Fit
                  </span>
                )}

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  aria-label={`Add ${product.name} to cart`}
                  className="shrink-0 flex items-center gap-1.5 bg-[#171717] text-[#F6F2EA] px-3 py-1.5 text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-[#6D202D] transition-colors cursor-pointer"
                >
                  {justAdded ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus size={12} />
                      <span>{isOneSize ? 'Add to Bag' : selectedSize ? `Add (${selectedSize})` : 'Choose Size'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Meta & Typography */}
      <div className="mt-3.5 flex flex-col space-y-1">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#171717]/60 font-mono">
          <span>{product.category}</span>
          <span>{product.department}</span>
        </div>

        <Link
          to={`/product/${product.id}`}
          className="group/title font-serif text-lg tracking-normal text-[#171717] hover:text-[#6D202D] transition-colors duration-200 line-clamp-1"
        >
          {product.name}
        </Link>

        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs tracking-wider font-semibold text-[#171717]">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[11px] text-[#171717]/40 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Color Indicators */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1" title={product.colors.map((c) => c.name).join(', ')}>
              {product.colors.map((c) => (
                <span
                  key={c.name}
                  className="h-2.5 w-2.5 rounded-full border border-black/20"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
