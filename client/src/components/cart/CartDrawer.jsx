import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag, Truck } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/formatters'

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    subtotal,
    freeShippingThreshold,
  } = useCart()

  const navigate = useNavigate()

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isCartOpen])

  if (!isCartOpen) return null

  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100)
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Bag"
          className="w-screen max-w-md bg-[#090909] border-l border-[#292929] flex flex-col shadow-2xl text-[#F5F5F5]"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#292929] flex items-center justify-between bg-[#111111]">
            <div className="flex items-baseline gap-2.5">
              <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5]">
                SHOPPING BAG
              </h2>
              <span className="font-mono text-xs text-[#B8FF00]">
                ({totalItems})
              </span>
            </div>
            <button
              type="button"
              onClick={closeCart}
              aria-label="Close cart drawer"
              className="p-1.5 text-[#A6A6A6] hover:text-[#B8FF00] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Shipping Progress */}
          <div className="bg-[#171717] border-b border-[#292929] px-5 py-3 text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-[11px] text-[#A6A6A6] font-mono">
                Add <span className="font-bold text-[#B8FF00]">{formatCurrency(remainingForFreeShipping)}</span> more for FREE standard shipping.
              </p>
            ) : (
              <p className="text-[11px] text-[#B8FF00] font-mono flex items-center gap-1.5 font-bold">
                <Truck size={13} />
                <span>FREE STANDARD SHIPPING UNLOCKED</span>
              </p>
            )}
            <div className="w-full bg-[#111111] h-1.5 mt-2 overflow-hidden border border-[#292929]">
              <div
                className="h-full bg-[#B8FF00] transition-all duration-500 shadow-[0_0_8px_rgba(184,255,0,0.6)]"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-[#292929]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag size={40} className="text-[#A6A6A6] stroke-[1.2] mb-3" />
                <p className="font-['Syne'] text-lg uppercase font-bold text-[#F5F5F5] mb-1">BAG IS EMPTY</p>
                <p className="text-xs text-[#A6A6A6] tracking-wide mb-6 max-w-xs font-sans">
                  Explore dark alternative silhouettes and signature drops.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeCart()
                    navigate('/shop')
                  }}
                  className="px-6 py-2.5 bg-[#B8FF00] hover:bg-[#cbfb27] text-[#090909] font-['Oswald'] text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
                >
                  START SHOPPING
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${item.product.id}`}
                    onClick={closeCart}
                    className="relative w-20 h-24 shrink-0 bg-[#111111] border border-[#292929] overflow-hidden group block"
                  >
                    <img
                      src={item.product.images ? item.product.images[0] : ''}
                      alt={item.product.name}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${item.product.id}`}
                          onClick={closeCart}
                          className="font-['Syne'] text-sm uppercase font-bold text-[#F5F5F5] hover:text-[#B8FF00] transition-colors line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                          aria-label={`Remove ${item.product.name}`}
                          className="text-[#A6A6A6] hover:text-[#8B0000] transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="text-[10px] text-[#A6A6A6] font-mono tracking-wider uppercase mt-1 flex gap-2">
                        {item.size && <span>SIZE: <strong className="text-[#F5F5F5]">{item.size}</strong></span>}
                        {item.color && <span>• {item.color}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#292929] bg-[#111111] h-7">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="px-2 h-full hover:bg-[#171717] text-[#A6A6A6] hover:text-[#F5F5F5] transition-colors cursor-pointer"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-medium text-[#F5F5F5]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="px-2 h-full hover:bg-[#171717] text-[#A6A6A6] hover:text-[#F5F5F5] transition-colors cursor-pointer"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <span className="font-mono text-sm font-bold text-[#F5F5F5]">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#292929] bg-[#111111] space-y-3.5">
              <div className="flex justify-between items-center text-xs uppercase tracking-wider text-[#A6A6A6] font-['Oswald']">
                <span>SUBTOTAL</span>
                <span className="font-mono text-base font-bold text-[#F5F5F5]">{formatCurrency(subtotal)}</span>
              </div>
              <p className="text-[10px] text-[#A6A6A6] font-mono">
                Shipping and discounts calculated at checkout.
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    closeCart()
                    navigate('/cart')
                  }}
                  className="py-3 px-4 border border-[#292929] bg-[#171717] hover:bg-[#202020] text-[#F5F5F5] font-['Oswald'] text-xs uppercase tracking-wider font-bold transition-all text-center cursor-pointer"
                >
                  VIEW BAG
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeCart()
                    navigate('/checkout')
                  }}
                  className="py-3 px-4 bg-[#B8FF00] hover:bg-[#cbfb27] text-[#090909] font-['Oswald'] text-xs uppercase tracking-wider font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(184,255,0,0.2)]"
                >
                  <span>CHECKOUT</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
