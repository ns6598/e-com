import React from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, ShoppingBag } from 'lucide-react'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/formatters'
import Button from '../ui/Button'

export default function WishlistDrawer({ isOpen, onClose }) {
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart, openCart } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-[#0C0C0C]/80 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              role="dialog"
              aria-modal="true"
              aria-label="Saved Pieces"
              className="w-screen max-w-md bg-[#171717] border-l border-white/10 flex flex-col shadow-2xl text-[#F6F2EA]"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#1E1E1E]/80">
                <div className="flex items-baseline gap-3">
                  <h2 className="font-serif text-2xl tracking-tight text-[#F6F2EA]">Saved Pieces</h2>
                  <span className="font-mono text-xs tracking-widest text-[#D4AF37] uppercase">
                    ({wishlist.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close wishlist drawer"
                  className="p-1.5 text-[#D8D0C4] hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-white/10">
            {wishlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <p className="font-serif text-xl mb-1 text-white">No pieces curated yet</p>
                <p className="text-xs text-gray-400 tracking-wider mb-6 max-w-xs font-mono">
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
                    className="relative w-20 h-26 shrink-0 bg-[#121520] border border-white/10 overflow-hidden group"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${product.id}`}
                          onClick={onClose}
                          className="font-serif text-base leading-snug text-white hover:text-[#D4AF37] transition-colors"
                        >
                          {product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromWishlist(product.id)}
                          aria-label={`Remove ${product.name}`}
                          className="text-gray-500 hover:text-[#A3283E] transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="font-serif text-sm text-[#D4AF37] mt-1 font-medium">
                        {formatCurrency(product.price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          const size = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'One Size'
                          const color = product.colors && product.colors.length > 0 ? product.colors[0].name : 'Default'
                          addToCart(product, size, color, 1)
                          removeFromWishlist(product.id)
                          onClose()
                          openCart()
                        }}
                        className="flex-1 py-1.5 px-3 text-[10px] uppercase font-mono tracking-widest gold-gradient-bg text-[#08090D] font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <ShoppingBag size={12} />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {wishlist.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-[#10131E]/80">
              <Button
                variant="secondary"
                size="md"
                to="/shop"
                onClick={onClose}
                fullWidth
              >
                Continue Exploring
              </Button>
            </div>
          )}
        </motion.aside>
      </div>
    </div>
      )}
    </AnimatePresence>
  )
}
