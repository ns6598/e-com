import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, Check, AlertCircle, Tag } from 'lucide-react'
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
      <div className="max-w-4xl mx-auto px-4 py-24 sm:py-32 text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-[#171717]/5 mb-2">
          <ShoppingBag size={48} className="text-[#171717]/40 stroke-[1.2]" />
        </div>
        <span className="tag-overline text-[#6D202D] block">BAG EMPTY</span>
        <h1 className="editorial-title text-3xl sm:text-5xl font-serif text-[#171717]">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-xs text-[#171717]/60 tracking-wider max-w-md mx-auto leading-relaxed">
          Your curated selection is currently empty. Explore our seasonal monographs and permanent atelier archetypes to begin your selection.
        </p>
        <div className="pt-6">
          <Button variant="primary" size="lg" to="/shop">
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Editorial Page Header */}
      <div className="border-b border-[#171717]/15 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="tag-overline text-[#6D202D]">SALON SELECTION</span>
          <h1 className="editorial-title text-3xl sm:text-5xl font-serif text-[#171717] mt-1">
            Shopping Bag
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs uppercase tracking-widest text-[#171717]/60 font-mono">
            {totalItems} {totalItems === 1 ? 'Piece' : 'Pieces'} Curated
          </span>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs uppercase tracking-widest text-[#6D202D] hover:underline cursor-pointer"
          >
            Clear Entire Bag
          </button>
        </div>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="bg-[#FAF8F5] border border-[#171717]/10 p-4 sm:p-5 text-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-[#6D202D]" />
            <span className="font-semibold uppercase tracking-wider text-[11px] text-[#171717]">
              White-Glove Courier Delivery
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#171717]/70">
            {remainingForFreeShipping > 0
              ? `Add ${formatCurrency(remainingForFreeShipping)} for complimentary shipping`
              : 'Complimentary shipping unlocked'}
          </span>
        </div>
        <div className="w-full bg-[#171717]/10 h-1.5 overflow-hidden">
          <div
            className="bg-[#6D202D] h-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="divide-y divide-[#171717]/15 border-y border-[#171717]/15">
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
                    className="w-24 sm:w-28 aspect-[3/4] bg-[#ECE5D8] border border-[#171717]/10 overflow-hidden shrink-0 group"
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
                        <span className="text-[10px] uppercase tracking-widest text-[#171717]/50 font-mono block">
                          {item.product.category}
                        </span>
                        <Link
                          to={`/product/${item.product.id}`}
                          className="font-serif text-lg sm:text-xl text-[#171717] hover:text-[#6D202D] transition-colors line-clamp-1 mt-0.5"
                        >
                          {item.product.name}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#171717]/70 font-mono">
                          <span>Size: <strong className="text-[#171717]">{item.size}</strong></span>
                          <span>•</span>
                          <span>Color: <strong className="text-[#171717]">{item.color}</strong></span>
                        </div>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right">
                        <span className="font-sans text-base sm:text-lg font-semibold text-[#171717] block">
                          {formatCurrency(lineTotal)}
                        </span>
                        <span className="text-[11px] text-[#171717]/50 font-mono">
                          {formatCurrency(item.product.price)} each
                        </span>
                      </div>
                    </div>

                    {/* Quantity Stepper & Remove Action */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#171717]/10">
                      <div className="flex items-center border border-[#171717]/20 bg-[#FAF8F5] h-9">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                          aria-label={`Decrease quantity for ${item.product.name}`}
                          className="px-2.5 h-full hover:bg-[#171717]/10 transition-colors cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                          disabled={item.quantity >= maxStock}
                          aria-label={`Increase quantity for ${item.product.name}`}
                          className="px-2.5 h-full hover:bg-[#171717]/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                        aria-label={`Remove ${item.product.name} from bag`}
                        className="inline-flex items-center gap-1.5 text-xs text-[#171717]/50 hover:text-[#6D202D] transition-colors cursor-pointer"
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
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#171717] hover:text-[#6D202D] transition-colors border-b border-[#171717] pb-0.5"
            >
              <span>← Continue Browsing Collection</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-[#171717]/20 bg-[#FAF8F5] p-6 sm:p-8 space-y-6">
            <h2 className="font-serif text-2xl text-[#171717] border-b border-[#171717]/15 pb-4">
              Bag Summary
            </h2>

            {/* Financial Breakdown */}
            <div className="space-y-3.5 text-xs text-[#171717]/80">
              <div className="flex justify-between">
                <span>Merchandise Subtotal</span>
                <span className="font-mono text-sm font-semibold text-[#171717]">{formatCurrency(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[#6D202D] font-medium">
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    <span>Privilege Discount ({appliedCoupon?.code})</span>
                  </span>
                  <span className="font-mono text-sm">-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>White-Glove Courier Delivery</span>
                <span className="font-mono text-sm">
                  {shipping === 0 ? (
                    <span className="text-emerald-700 font-semibold uppercase text-[11px]">Complimentary</span>
                  ) : (
                    formatCurrency(shipping)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-[#171717]/15 flex justify-between items-baseline text-base font-semibold text-[#171717]">
                <span>Total Estimated</span>
                <span className="font-mono text-xl">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="pt-2 border-t border-[#171717]/15 space-y-3">
              <label className="text-[11px] uppercase tracking-wider text-[#171717]/70 font-semibold block">
                Privilege / Promo Code
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-[#F6F2EA] border border-[#6D202D] p-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-[#6D202D] tracking-wider block">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-[10px] text-[#171717]/60 block">
                      {appliedCoupon.discountPercent}% courtesy discount active
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-[#171717]/60 hover:text-[#6D202D] underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex border border-[#171717]/30 bg-[#F6F2EA] focus-within:border-[#171717]">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value)
                        if (couponFeedback.type) setCouponFeedback({ type: null, message: '' })
                      }}
                      placeholder="e.g. AUREVA10 or WELCOME15"
                      aria-label="Enter promotional coupon code"
                      className="w-full bg-transparent px-3 py-2 text-xs font-mono uppercase tracking-wider focus:outline-none placeholder:text-[#171717]/40"
                    />
                    <button
                      type="submit"
                      className="bg-[#171717] text-[#F6F2EA] px-4 text-[10px] uppercase tracking-widest font-semibold hover:bg-[#6D202D] transition-colors cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  </div>

                  {couponFeedback.message && (
                    <div
                      className={`text-[11px] flex items-center gap-1.5 ${
                        couponFeedback.type === 'error'
                          ? 'text-[#6D202D]'
                          : couponFeedback.type === 'success'
                          ? 'text-emerald-700'
                          : 'text-[#171717]/70'
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

                  <p className="text-[10px] text-[#171717]/50 leading-relaxed">
                    Demo codes: <strong className="text-[#171717]">AUREVA10</strong> (10% off) or <strong className="text-[#171717]">WELCOME15</strong> (15% off).
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
