import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, Check, AlertCircle, Tag, Sparkles } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatters'
import Button from '../components/ui/Button'

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    shipping,
    freeShippingThreshold,
    remainingForFreeShipping,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    grandTotal,
  } = useCart()

  const [couponInput, setCouponInput] = useState('')
  const [couponFeedback, setCouponFeedback] = useState({ type: null, message: '' })

  const handleApplyCoupon = (e) => {
    e.preventDefault()
    if (!couponInput.trim()) {
      setCouponFeedback({ type: 'error', message: 'Please enter a coupon code.' })
      return
    }

    const res = applyCoupon(couponInput)
    if (res.success) {
      setCouponFeedback({ type: 'success', message: res.message })
      setCouponInput('')
    } else {
      setCouponFeedback({ type: 'error', message: res.message })
    }
  }

  const handleRemoveCoupon = () => {
    removeCoupon()
    setCouponFeedback({ type: 'info', message: 'Coupon removed from your bag.' })
  }

  // Empty-Cart View
  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 sm:py-32 text-center space-y-6 text-white">
        <div className="inline-flex p-4 rounded-full glass-panel mb-2">
          <ShoppingBag size={48} className="text-gray-500 stroke-[1.2]" />
        </div>
        <span className="tag-overline text-[#D4AF37] block font-mono">SELECTION EMPTY</span>
        <h1 className="editorial-title text-3xl sm:text-5xl font-serif text-white">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-xs text-gray-400 tracking-wider max-w-md mx-auto leading-relaxed font-mono">
          Your curated selection is currently empty. Explore our seasonal monographs and permanent atelier archetypes to begin your selection.
        </p>
        <div className="pt-6">
          <Button variant="primary" size="lg" to="/shop">
            Explore Collection
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 text-white">
      {/* Editorial Page Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="tag-overline text-[#D4AF37] font-mono">SALON SELECTION</span>
          <h1 className="editorial-title text-3xl sm:text-5xl font-serif text-white mt-1">
            Shopping Bag
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs uppercase tracking-widest text-gray-400 font-mono">
            {totalItems} {totalItems === 1 ? 'Piece' : 'Pieces'} Curated
          </span>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs uppercase tracking-widest text-[#D4AF37] hover:underline cursor-pointer font-mono"
          >
            Clear Entire Bag
          </button>
        </div>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="glass-panel p-4 sm:p-5 text-xs rounded-xs border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-[#D4AF37]" />
            <span className="font-semibold uppercase tracking-wider text-[11px] text-white font-mono">
              White-Glove Courier Delivery
            </span>
          </div>
          <span className="font-mono text-[11px] text-gray-300">
            {remainingForFreeShipping > 0
              ? `Add ${formatCurrency(remainingForFreeShipping)} for complimentary shipping`
              : 'Complimentary white-glove shipping unlocked'}
          </span>
        </div>
        <div className="w-full bg-white/10 h-1.5 overflow-hidden rounded-full">
          <div
            className="gold-gradient-bg h-full transition-all duration-500 shadow-[0_0_8px_rgba(212,175,55,0.6)]"
            style={{
              width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="divide-y divide-white/10 border-y border-white/10">
            {cart.map((item) => {
              const lineTotal = item.product.price * item.quantity
              const maxStock = item.product.stock || 15

              return (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="py-6 flex flex-col sm:flex-row gap-6 items-start"
                >
                  {/* Product Image Thumbnail */}
                  <Link
                    to={`/product/${item.product.id}`}
                    className="w-24 sm:w-28 aspect-[3/4] bg-[#121522] border border-white/10 overflow-hidden shrink-0 group"
                  >
                    <img
                      src={item.product.images ? item.product.images[0] : ''}
                      alt={item.product.name}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'
                      }}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Item Meta & Controls */}
                  <div className="flex-1 flex flex-col justify-between self-stretch space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-mono block">
                          {item.product.category}
                        </span>
                        <Link
                          to={`/product/${item.product.id}`}
                          className="font-serif text-lg sm:text-xl text-white hover:text-[#D4AF37] transition-colors line-clamp-1 mt-0.5"
                        >
                          {item.product.name}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-400 font-mono">
                          <span>Size: <strong className="text-white">{item.size}</strong></span>
                          <span>•</span>
                          <span>Color: <strong className="text-white">{item.color}</strong></span>
                        </div>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right">
                        <span className="font-serif text-base sm:text-lg font-medium text-white block">
                          {formatCurrency(lineTotal)}
                        </span>
                        <span className="text-[11px] text-gray-500 font-mono">
                          {formatCurrency(item.product.price)} each
                        </span>
                      </div>
                    </div>

                    {/* Quantity Stepper & Remove Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <div className="flex items-center border border-white/20 bg-white/5 h-9">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                          aria-label={`Decrease quantity for ${item.product.name}`}
                          className="px-2.5 h-full hover:bg-white/10 text-gray-300 transition-colors cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-medium text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                          disabled={item.quantity >= maxStock}
                          aria-label={`Increase quantity for ${item.product.name}`}
                          className="px-2.5 h-full hover:bg-white/10 text-gray-300 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                        aria-label={`Remove ${item.product.name} from bag`}
                        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#A3283E] transition-colors cursor-pointer font-mono"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#D4AF37] hover:text-white transition-colors border-b border-[#D4AF37]/50 pb-0.5 font-mono"
            >
              <span>← Continue Browsing Collection</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel-gold bg-[#0E1018]/90 p-6 sm:p-8 space-y-6 rounded-xs border border-white/15">
            <h2 className="font-serif text-2xl text-white border-b border-white/10 pb-4">
              Bag Summary
            </h2>

            {/* Financial Breakdown */}
            <div className="space-y-3.5 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Merchandise Subtotal</span>
                <span className="font-serif text-base font-semibold text-white">{formatCurrency(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[#D4AF37] font-medium font-mono">
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    <span>Privilege Discount ({appliedCoupon?.code})</span>
                  </span>
                  <span className="text-sm">-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>White-Glove Courier Delivery</span>
                <span className="font-mono text-xs">
                  {shipping === 0 ? (
                    <span className="text-emerald-400 font-semibold uppercase text-[11px]">Complimentary</span>
                  ) : (
                    formatCurrency(shipping)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline text-base font-semibold text-white">
                <span>Total Estimated</span>
                <span className="font-serif text-2xl text-white">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <label className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block font-mono">
                Privilege / Promo Code
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between glass-panel border-[#D4AF37]/50 p-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-[#D4AF37] tracking-wider block">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-[10px] text-gray-400 block font-mono">
                      {appliedCoupon.discountPercent}% courtesy discount active
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-gray-400 hover:text-white underline cursor-pointer font-mono"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex border border-white/20 bg-[#121522] focus-within:border-[#D4AF37]">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value)
                        if (couponFeedback.type) setCouponFeedback({ type: null, message: '' })
                      }}
                      placeholder="e.g. AUREVA15 or AUREVA10"
                      aria-label="Enter promotional coupon code"
                      className="w-full bg-transparent px-3 py-2 text-xs font-mono uppercase tracking-wider focus:outline-none placeholder:text-gray-500 text-white"
                    />
                    <button
                      type="submit"
                      className="gold-gradient-bg text-[#08090D] px-4 text-[10px] uppercase tracking-widest font-bold hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  </div>

                  {couponFeedback.message && (
                    <div
                      className={`text-[11px] flex items-center gap-1.5 font-mono ${
                        couponFeedback.type === 'error'
                          ? 'text-[#E57373]'
                          : couponFeedback.type === 'success'
                          ? 'text-emerald-400'
                          : 'text-gray-300'
                      }`}
                    >
                      {couponFeedback.type === 'error' ? (
                        <AlertCircle size={12} className="shrink-0" />
                      ) : (
                        <Check size={12} className="shrink-0" />
                      )}
                      <span>{couponFeedback.message}</span>
                    </div>
                  )}

                  <p className="text-[10px] text-gray-400 leading-relaxed font-mono">
                    Privilege code: <strong className="text-[#D4AF37]">AUREVA15</strong> (15% inaugural courtesy discount).
                  </p>
                </form>
              )}
            </div>

            {/* Checkout Action CTA */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                to="/checkout"
                icon={ArrowRight}
                iconPosition="right"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
