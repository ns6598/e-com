import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/formatters'
import Button from '../ui/Button'

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
      {/* Frosted Liquid Glass Backdrop */}
      <div
        className="fixed inset-0 bg-[#06070A]/85 backdrop-blur-md transition-opacity duration-300"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Bag"
          className="w-screen max-w-md bg-[#0C0E16] border-l border-white/10 flex flex-col shadow-2xl text-white"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#10131E]/60">
            <div className="flex items-baseline gap-3">
              <h2 className="font-serif text-2xl tracking-tight text-white">Your Selection</h2>
              <span className="font-mono text-xs tracking-widest text-[#D4AF37] uppercase">
                ({totalItems} {totalItems === 1 ? 'Piece' : 'Pieces'})
              </span>
            </div>
            <button
              type="button"
              onClick={closeCart}
              aria-label="Close cart drawer"
              className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Complimentary Shipping Progress Banner */}
          <div className="bg-[#121522] border-b border-white/10 px-6 py-3.5 text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="tracking-wide text-gray-300">
                Add <span className="font-semibold text-[#D4AF37]">{formatCurrency(remainingForFreeShipping)}</span> for complimentary insured white-glove courier.
              </p>
            ) : (
              <p className="tracking-wide text-[#D4AF37] font-medium flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>Complimentary white-glove courier unlocked.</span>
              </p>
            )}
            <div className="w-full bg-white/10 h-1 mt-2.5 overflow-hidden rounded-full">
              <div
                className="gold-gradient-bg h-full transition-all duration-500 shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-white/10">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag size={40} className="text-gray-600 stroke-[1.2] mb-4" />
                <p className="font-serif text-xl mb-1 text-white">Your wardrobe is empty</p>
                <p className="text-xs text-gray-400 tracking-wider mb-6 max-w-xs">
                  Discover contemporary silhouettes and architectural craftsmanship.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    closeCart()
                    navigate('/shop')
                  }}
                >
                  Explore Collection
                </Button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${item.product.id}`}
                    onClick={closeCart}
                    className="relative w-20 h-26 shrink-0 bg-[#121520] border border-white/10 overflow-hidden group"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
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
                          className="font-serif text-base leading-snug text-white hover:text-[#D4AF37] transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                          aria-label={`Remove ${item.product.name}`}
                          className="text-gray-500 hover:text-[#A3283E] transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#D4AF37] font-mono tracking-wider uppercase mt-1 flex gap-3">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Tone: {item.color}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-white/20 bg-white/5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="p-1.5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-xs font-mono font-medium text-white">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="p-1.5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="font-serif text-sm font-medium text-white">
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
            <div className="p-6 border-t border-white/10 bg-[#10131E]/80 space-y-4">
              <div className="flex justify-between items-center text-xs tracking-wider uppercase text-gray-400">
                <span>Estimated Subtotal</span>
                <span className="font-serif text-lg font-medium text-white">{formatCurrency(subtotal)}</span>
              </div>
              <p className="text-[11px] text-gray-500 tracking-wide font-mono">
                Taxes and duties calculated during express concierge checkout.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="md"
                  to="/cart"
                  onClick={closeCart}
                  fullWidth
                >
                  View Bag
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  to="/checkout"
                  onClick={closeCart}
                  fullWidth
                  icon={ArrowRight}
                >
                  Checkout
                </Button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
