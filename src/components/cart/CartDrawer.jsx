import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
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

  // Prevent background scroll when cart drawer is active
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
        className="fixed inset-0 bg-[#171717]/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Cart"
          className="w-screen max-w-md bg-[#F6F2EA] border-l border-[#171717]/15 flex flex-col shadow-2xl text-[#171717]"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#171717]/10 flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <h2 className="font-serif text-2xl tracking-tight">Your Selection</h2>
              <span className="font-sans text-xs tracking-widest text-[#171717]/60 uppercase">
                ({totalItems} {totalItems === 1 ? 'Piece' : 'Pieces'})
              </span>
            </div>
            <button
              type="button"
              onClick={closeCart}
              aria-label="Close cart drawer"
              className="p-2 text-[#171717]/60 hover:text-[#171717] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6D202D]"
            >
              <X size={20} />
            </button>
          </div>

          {/* Complimentary Shipping Banner */}
          <div className="bg-[#FAF8F5] border-b border-[#171717]/10 px-6 py-3 text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="tracking-wide text-[#171717]/80">
                Add <span className="font-medium text-[#6D202D]">{formatCurrency(remainingForFreeShipping)}</span> for complimentary white-glove shipping.
              </p>
            ) : (
              <p className="tracking-wide text-[#6D202D] font-medium">
                Complimentary white-glove shipping unlocked.
              </p>
            )}
            <div className="w-full bg-[#171717]/10 h-1 mt-2 overflow-hidden">
              <div
                className="bg-[#6D202D] h-full transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#171717]/10">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag size={40} className="text-[#171717]/30 stroke-[1.2] mb-4" />
                <p className="font-serif text-xl mb-1">Your wardrobe is empty</p>
                <p className="text-xs text-[#171717]/60 tracking-wider mb-6 max-w-xs">
                  Discover contemporary silhouettes and editorial craftsmanship.
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
                    className="relative w-20 h-26 shrink-0 bg-[#ECE5D8] border border-[#171717]/10 overflow-hidden"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${item.product.id}`}
                          onClick={closeCart}
                          className="font-serif text-base leading-snug hover:text-[#6D202D] transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id, item.size, item.color)}
                          aria-label={`Remove ${item.product.name}`}
                          className="text-[#171717]/40 hover:text-[#6D202D] transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#171717]/60 tracking-wider uppercase mt-1 flex gap-3">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Tone: {item.color}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#171717]/20 bg-[#FAF8F5]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="p-1.5 hover:bg-[#171717]/5 text-[#171717] transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-xs font-mono font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="p-1.5 hover:bg-[#171717]/5 text-[#171717] transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="font-sans text-sm font-medium">
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
            <div className="p-6 border-t border-[#171717]/10 bg-[#FAF8F5] space-y-4">
              <div className="flex justify-between items-center text-xs tracking-wider uppercase text-[#171717]/70">
                <span>Estimated Subtotal</span>
                <span className="font-sans text-base font-medium text-[#171717]">{formatCurrency(subtotal)}</span>
              </div>
              <p className="text-[11px] text-[#171717]/50 tracking-wide">
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
