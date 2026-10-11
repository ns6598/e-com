import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ShoppingBag, X, ArrowRight } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/formatters'

export default function CartFlyToast() {
  const { recentAddedItem, clearRecentAddedItem, openCart } = useCart()

  useEffect(() => {
    if (!recentAddedItem) return
    const timer = setTimeout(() => {
      clearRecentAddedItem()
    }, 4500)
    return () => clearTimeout(timer)
  }, [recentAddedItem, clearRecentAddedItem])

  return (
    <AnimatePresence>
      {recentAddedItem && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 glass-panel-gold bg-[#0A0C14]/95 border border-[#D4AF37]/50 shadow-[0_20px_50px_rgba(0,0,0,0.85)] rounded-xs text-white"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3.5">
            {/* Product Thumbnail */}
            <div className="relative h-16 w-13 shrink-0 overflow-hidden bg-[#121522] border border-white/10 rounded-xs">
              <img
                src={recentAddedItem.product.images?.[0]}
                alt={recentAddedItem.product.name}
                className="h-full w-full object-cover object-top"
              />
              <span className="absolute bottom-0 right-0 h-4 w-4 bg-[#D4AF37] text-[#08090D] flex items-center justify-center font-bold text-[9px]">
                <Check size={10} />
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-[0.24em] font-mono text-[#D4AF37] font-semibold">
                  Added to Shopping Bag
                </span>
                <button
                  type="button"
                  onClick={clearRecentAddedItem}
                  className="text-gray-400 hover:text-white p-0.5 -mr-1 cursor-pointer"
                  aria-label="Dismiss notification"
                >
                  <X size={13} />
                </button>
              </div>

              <h4 className="font-serif text-sm text-white truncate font-medium">
                {recentAddedItem.product.name}
              </h4>

              <div className="flex items-center gap-2 text-[11px] font-mono text-gray-300">
                <span>Size: <strong className="text-white">{recentAddedItem.size}</strong></span>
                <span>•</span>
                <span className="text-[#D4AF37] font-semibold">
                  {formatCurrency(recentAddedItem.product.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                clearRecentAddedItem()
                openCart()
              }}
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#D4AF37] hover:text-white cursor-pointer transition-colors"
            >
              <ShoppingBag size={13} />
              <span>Review Bag</span>
              <ArrowRight size={11} />
            </button>

            <button
              type="button"
              onClick={clearRecentAddedItem}
              className="text-[10px] uppercase font-mono tracking-wider text-gray-400 hover:text-white cursor-pointer"
            >
              Continue Exploring
            </button>
          </div>

          {/* Auto-Dismiss Hairline Progress Bar */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 4.5, ease: 'linear' }}
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37] origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
