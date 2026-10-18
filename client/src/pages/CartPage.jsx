import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, Check, AlertCircle, Tag, ShieldCheck } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/formatters'
import PageTransition from '../components/motion/PageTransition'

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
      setCouponFeedback({ type: 'error', message: 'Enter a promotion or voucher code.' })
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
    setCouponFeedback({ type: 'info', message: 'Code removed from your selection.' })
  }

  // Empty-Cart View
  if (cart.length === 0) {
    return (
      <PageTransition className="min-h-[75vh] flex items-center justify-center px-4 py-20 text-[#F5F5F5]">
        <div className="max-w-md w-full text-center space-y-6 p-8 border border-[#292929] bg-[#111111]/80 backdrop-blur-sm">
          <div className="inline-flex p-5 rounded-full bg-[#171717] border border-[#292929]">
            <ShoppingBag size={42} className="text-[#A6A6A6] stroke-[1.2]" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-[#B8FF00] block mb-2">
              BAG IS EMPTY
            </span>
            <h1 className="font-['Syne'] text-3xl sm:text-4xl uppercase tracking-wider font-bold text-[#F5F5F5]">
              NO ITEMS SELECTED
            </h1>
          </div>
          <p className="text-xs text-[#A6A6A6] tracking-wide leading-relaxed font-sans">
            Your shopping bag is currently unoccupied. Explore our latest darkwear drops, occult tailoring, and ritual hardware.
          </p>
          <div className="pt-4">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#B8FF00] hover:bg-[#cbfb27] text-[#090909] font-['Oswald'] text-sm uppercase tracking-[0.18em] font-bold transition-all shadow-[0_0_20px_rgba(184,255,0,0.2)]"
            >
              <span>EXPLORE ALL DROPS</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10 text-[#F5F5F5]">
      {/* Header */}
      <div className="border-b border-[#292929] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#B8FF00] block">
            AUREVA SHOPPING BAG
          </span>
          <h1 className="font-['Syne'] text-3xl sm:text-5xl uppercase font-extrabold tracking-wider text-[#F5F5F5] mt-1">
            BAG REVIEW
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs uppercase tracking-widest text-[#A6A6A6] font-mono">
            {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'}
          </span>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs uppercase tracking-widest text-[#A6A6A6] hover:text-[#8B0000] cursor-pointer font-mono transition-colors"
          >
            CLEAR BAG
          </button>
        </div>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="p-4 sm:p-5 bg-[#171717] border border-[#292929] text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-[#B8FF00]" />
            <span className="font-['Oswald'] uppercase tracking-wider text-xs text-[#F5F5F5]">
              DISPATCH COURIER
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#A6A6A6]">
            {remainingForFreeShipping > 0
              ? `Add ${formatCurrency(remainingForFreeShipping)} more for FREE standard shipping`
              : 'FREE standard express shipping unlocked'}
          </span>
        </div>
        <div className="w-full bg-[#111111] h-1.5 overflow-hidden border border-[#292929]">
          <div
            className="h-full bg-[#B8FF00] transition-all duration-500 shadow-[0_0_12px_rgba(184,255,0,0.6)]"
            style={{
              width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="divide-y divide-[#292929] border-y border-[#292929]">
            {cart.map((item) => {
              const lineTotal = item.product.price * item.quantity
              const maxStock = item.product.stock || 15

              return (
                <div
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  className="py-6 flex flex-col sm:flex-row gap-5 items-start bg-transparent"
                >
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${item.product.id}`}
                    className="w-24 sm:w-28 aspect-[3/4] bg-[#111111] border border-[#292929] overflow-hidden shrink-0 group relative block"
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

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col justify-between self-stretch space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#B8FF00] font-mono block">
                          {item.product.category}
                        </span>
                        <Link
                          to={`/product/${item.product.id}`}
                          className="font-['Syne'] text-base sm:text-lg font-bold uppercase text-[#F5F5F5] hover:text-[#B8FF00] transition-colors line-clamp-1 mt-0.5"
                        >
                          {item.product.name}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#A6A6A6] font-mono">
                          <span>SIZE: <strong className="text-[#F5F5F5]">{item.size}</strong></span>
                          <span className="text-[#292929]">•</span>
                          <span>COLOR: <strong className="text-[#F5F5F5]">{item.color}</strong></span>
                        </div>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right">
                        <span className="font-mono text-base font-bold text-[#F5F5F5] block">
                          {formatCurrency(lineTotal)}
                        </span>
                        <span className="text-[11px] text-[#A6A6A6] font-mono">
                          {formatCurrency(item.product.price)} ea
                        </span>
                      </div>
                    </div>

                    {/* Stepper & Remove */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#292929]">
                      <div className="flex items-center border border-[#292929] bg-[#111111] h-8">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                          aria-label={`Decrease quantity for ${item.product.name}`}
                          className="px-2.5 h-full hover:bg-[#171717] text-[#A6A6A6] hover:text-[#F5F5F5] transition-colors cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-mono font-medium text-[#F5F5F5]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                          disabled={item.quantity >= maxStock}
                          aria-label={`Increase quantity for ${item.product.name}`}
                          className="px-2.5 h-full hover:bg-[#171717] text-[#A6A6A6] hover:text-[#F5F5F5] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                        aria-label={`Remove ${item.product.name} from bag`}
                        className="inline-flex items-center gap-1.5 text-xs text-[#A6A6A6] hover:text-[#8B0000] transition-colors cursor-pointer font-mono"
                      >
                        <Trash2 size={13} />
                        <span>REMOVE</span>
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
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#B8FF00] hover:text-white transition-colors border-b border-[#B8FF00]/40 pb-0.5 font-mono"
            >
              <span>← CONTINUE SHOPPING</span>
            </Link>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#171717] p-6 sm:p-7 space-y-6 border border-[#292929]">
            <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5] border-b border-[#292929] pb-4">
              ORDER SUMMARY
            </h2>

            {/* Financial Breakdown */}
            <div className="space-y-3.5 text-xs text-[#A6A6A6]">
              <div className="flex justify-between">
                <span>SUBTOTAL</span>
                <span className="font-mono text-sm font-semibold text-[#F5F5F5]">{formatCurrency(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[#B8FF00] font-mono font-medium">
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    <span>DISCOUNT ({appliedCoupon?.code})</span>
                  </span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>ESTIMATED SHIPPING</span>
                <span className="font-mono text-[#F5F5F5]">
                  {shipping === 0 ? (
                    <span className="text-[#B8FF00] font-mono uppercase">FREE</span>
                  ) : (
                    formatCurrency(shipping)
                  )}
                </span>
              </div>

              <div className="border-t border-[#292929] pt-3.5 flex justify-between items-baseline">
                <span className="font-['Oswald'] text-sm uppercase tracking-wider text-[#F5F5F5] font-bold">TOTAL</span>
                <div className="text-right">
                  <span className="font-mono text-xl sm:text-2xl font-bold text-[#F5F5F5]">
                    {formatCurrency(grandTotal)}
                  </span>
                  <p className="text-[10px] text-[#A6A6A6] font-mono mt-0.5">TAX INCLUDED</p>
                </div>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="pt-2 border-t border-[#292929]">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-[#111111] border border-[#B8FF00]/40 text-xs">
                  <div className="flex items-center gap-2">
                    <Tag size={13} className="text-[#B8FF00]" />
                    <div>
                      <p className="font-mono uppercase text-[#F5F5F5] font-semibold">{appliedCoupon.code}</p>
                      <p className="text-[10px] text-[#A6A6A6]">
                        {appliedCoupon.type === 'PERCENTAGE'
                          ? `${appliedCoupon.value}% OFF APPLIED`
                          : `${formatCurrency(appliedCoupon.value)} OFF`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] font-mono text-[#8B0000] hover:underline cursor-pointer"
                  >
                    REMOVE
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-widest font-mono text-[#A6A6A6]">
                    DISCOUNT / PROMO CODE
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. AUREVA15"
                      className="flex-1 bg-[#111111] border border-[#292929] px-3 py-2 text-xs font-mono text-[#F5F5F5] placeholder:text-[#A6A6A6]/60 focus:outline-none focus:border-[#B8FF00] uppercase"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#292929] hover:bg-[#B8FF00] text-[#F5F5F5] hover:text-[#090909] font-['Oswald'] text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                </form>
              )}

              {couponFeedback.message && (
                <p
                  className={`text-[11px] font-mono mt-2 flex items-center gap-1.5 ${
                    couponFeedback.type === 'success' ? 'text-[#B8FF00]' : 'text-[#8B0000]'
                  }`}
                >
                  {couponFeedback.type === 'success' ? <Check size={12} /> : <AlertCircle size={12} />}
                  <span>{couponFeedback.message}</span>
                </p>
              )}
            </div>

            {/* Checkout Action */}
            <div className="space-y-3 pt-2">
              <Link
                to="/checkout"
                className="w-full py-4 bg-[#B8FF00] hover:bg-[#cbfb27] text-[#090909] font-['Oswald'] text-sm uppercase tracking-[0.2em] font-bold transition-all shadow-[0_0_20px_rgba(184,255,0,0.25)] flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight size={16} />
              </Link>

              <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-[#A6A6A6] font-mono">
                <ShieldCheck size={13} className="text-[#B8FF00]" />
                <span>ENCRYPTED SECURE CHECKOUT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
