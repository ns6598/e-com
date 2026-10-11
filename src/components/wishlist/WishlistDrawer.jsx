import React from 'react'
import { Link } from 'react-router-dom'
import { X, Trash2, ShoppingBag } from 'lucide-react'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/formatters'
import Button from '../ui/Button'

export default function WishlistDrawer({ isOpen, onClose }) {
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart, openCart } = useCart()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-[#171717]/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Saved Pieces"
          className="w-screen max-w-md bg-[#F6F2EA] border-l border-[#171717]/15 flex flex-col shadow-2xl text-[#171717]"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#171717]/10 flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <h2 className="font-serif text-2xl tracking-tight">Saved Pieces</h2>
              <span className="font-sans text-xs tracking-widest text-[#171717]/60 uppercase">
                ({wishlist.length})
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close wishlist drawer"
              className="p-2 text-[#171717]/60 hover:text-[#171717] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6D202D]"
            >
              <X size={20} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#171717]/10">
            {wishlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <p className="font-serif text-xl mb-1">No pieces curated yet</p>
                <p className="text-xs text-[#171717]/60 tracking-wider mb-6 max-w-xs">
                  Save your desired garments from the runway and catalog.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  to="/shop"
                  onClick={onClose}
                >
                  Explore Catalog
                </Button>
              </div>
            ) : (
              wishlist.map((product) => (
                <div key={product.id} className="py-4 flex gap-4">
                  <Link
                    to={`/product/${product.id}`}
                    onClick={onClose}
                    className="relative w-20 h-26 shrink-0 bg-[#ECE5D8] border border-[#171717]/10 overflow-hidden"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${product.id}`}
                          onClick={onClose}
                          className="font-serif text-base leading-snug hover:text-[#6D202D] transition-colors"
                        >
                          {product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromWishlist(product.id)}
                          aria-label={`Remove ${product.name}`}
                          className="text-[#171717]/40 hover:text-[#6D202D] transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-[#171717]/70 font-sans mt-1">
                        {formatCurrency(product.price)}
                      </p>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          addToCart(product)
                          onClose()
                          openCart()
                        }}
                        icon={ShoppingBag}
                      >
                        Move to Bag
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
