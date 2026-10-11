import React, { useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { CheckCircle2, ShoppingBag, Truck, ArrowRight, ShieldCheck, Mail, Phone, Printer, Sparkles } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'
import Button from '../components/ui/Button'
import PageTransition from '../components/motion/PageTransition'

export default function OrderConfirmationPage() {
  const location = useLocation()
  const { orderId } = useParams()

  const [order] = useState(() => {
    if (location.state && location.state.order) {
      return location.state.order
    }
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem('aureva_last_order_v1') : null
      if (saved) {
        const parsed = JSON.parse(saved)
        if (!orderId || parsed.orderNumber === orderId) {
          return parsed
        }
      }
    } catch (e) {
      console.warn('Failed reading last order from localStorage:', e)
    }
    return null
  })

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 sm:py-32 text-center space-y-6 text-white">
        <div className="inline-flex p-4 rounded-full glass-panel mb-2">
          <ShoppingBag size={48} className="text-gray-500 stroke-[1.2]" />
        </div>
        <span className="tag-overline text-[#D4AF37] block font-mono">ORDER ARCHIVE</span>
        <h1 className="editorial-title text-3xl sm:text-5xl font-serif text-white">
          No Active Order Found
        </h1>
        <p className="text-xs text-gray-400 tracking-wider max-w-md mx-auto leading-relaxed font-mono">
          There are no recently finalized demo orders recorded in your current browser session. Explore our catalog to place a selection.
        </p>
        <div className="pt-6">
          <Button variant="primary" size="lg" to="/shop">
            Explore The Collection
          </Button>
        </div>
      </div>
    )
  }

  const { orderNumber, createdAt, customer, items, summary } = order

  const formattedDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <PageTransition className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12 text-white">
      {/* Top Confirmation Header */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <div className="inline-flex p-3 rounded-full glass-panel-gold border-[#D4AF37]/50 text-[#D4AF37]">
          <CheckCircle2 size={40} className="stroke-[1.8]" />
        </div>
        <span className="tag-overline text-[#D4AF37] block font-mono">DEMO SELECTION CONFIRMED</span>
        <h1 className="editorial-title text-3xl sm:text-5xl font-serif text-white">
          Thank You for Your Selection
        </h1>
        <p className="text-xs text-gray-300 leading-relaxed font-sans">
          Your pieces have been allocated from the atelier archive. An official dispatch dossier will be sent to <strong className="text-white font-mono">{customer.email}</strong>.
        </p>
      </div>

      {/* Demo Prototype Notice Banner */}
      <div className="glass-panel p-4 sm:p-5 text-xs text-gray-300 flex items-start gap-3 rounded-xs border-white/10">
        <ShieldCheck size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold uppercase tracking-wider text-[11px] text-[#D4AF37] font-mono">
            Frontend Demonstration Notice
          </p>
          <p className="text-[11px] leading-relaxed text-gray-400">
            This transaction was conducted in demonstration mode. No real payment card details were collected or processed, and no commercial shipment has been dispatched.
          </p>
        </div>
      </div>

      {/* Order Reference Header Box */}
      <div className="glass-panel-gold bg-[#0E1018]/90 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xs border border-white/15">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-mono block">
            DEMO ORDER REFERENCE
          </span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-white tracking-wider block mt-0.5">
            {orderNumber}
          </span>
          <span className="text-[11px] text-gray-400 font-mono block mt-1">
            Logged on: {formattedDate}
          </span>
        </div>

        <div className="sm:text-right">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-mono block">
            FULFILLMENT STATUS
          </span>
          <span className="inline-block gold-gradient-bg text-[#08090D] font-bold px-3 py-1 text-[10px] font-mono uppercase tracking-widest mt-1">
            In Atelier Preparation
          </span>
        </div>
      </div>

      {/* Two-Column Grid: Customer Details & Items Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer & Shipping Summary */}
        <div className="md:col-span-5 space-y-6">
          {/* Shipping Address */}
          <div className="glass-panel p-6 space-y-3 text-xs rounded-xs border-white/10">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold border-b border-white/10 pb-2">
              Delivery Destination
            </h3>
            <div className="space-y-1.5 text-gray-300">
              <p className="font-semibold text-sm text-white">{customer.fullName}</p>
              <p>{customer.address}</p>
              <p>{customer.city}, {customer.state} — {customer.postalCode}</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-mono">India</p>
            </div>
            <div className="pt-3 border-t border-white/10 space-y-1 text-gray-400 font-mono">
              <p className="flex items-center gap-2">
                <Mail size={13} className="text-[#D4AF37]" />
                <span>{customer.email}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={13} className="text-[#D4AF37]" />
                <span>+91 {customer.phone}</span>
              </p>
            </div>
          </div>

          {/* Logistics Courier Notice */}
          <div className="glass-panel p-5 space-y-2 text-xs rounded-xs border-white/10">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Truck size={16} />
              <span className="font-semibold uppercase tracking-wider text-[11px] font-mono">Courier Transit</span>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed font-mono">
              Dispatched with insured air courier. Estimated arrival in 2–4 business days. Signature required on handover.
            </p>
          </div>
        </div>

        {/* Right Column: Ordered Items & Financial Breakdown */}
        <div className="md:col-span-7 space-y-6">
          <div className="glass-panel-gold bg-[#0E1018]/90 p-6 sm:p-8 space-y-6 rounded-xs border border-white/15">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D4AF37] font-semibold border-b border-white/10 pb-2">
              Allocated Pieces ({summary.totalItems})
            </h3>

            {/* Items List */}
            <div className="divide-y divide-white/10">
              {items.map((item, idx) => (
                <div key={idx} className="py-4 flex gap-4 items-center">
                  <div className="w-16 h-20 bg-[#121522] border border-white/10 overflow-hidden shrink-0">
                    <img
                      src={item.product.images ? item.product.images[0] : ''}
                      alt={item.product.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-base text-white truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-gray-400 font-mono">
                      Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-serif text-sm font-semibold text-white block">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {formatCurrency(item.product.price)} each
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Merchandise Subtotal</span>
                <span className="font-serif text-base font-semibold text-white">{formatCurrency(summary.subtotal)}</span>
              </div>

              {summary.discount > 0 && (
                <div className="flex justify-between text-[#D4AF37] font-medium font-mono">
                  <span>Privilege Savings ({summary.couponCode})</span>
                  <span>-{formatCurrency(summary.discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>White-Glove Courier Delivery</span>
                <span className="font-mono text-xs">
                  {summary.shipping === 0 ? (
                    <span className="text-emerald-400 font-semibold uppercase text-[11px]">Complimentary</span>
                  ) : (
                    formatCurrency(summary.shipping)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline text-base font-semibold text-white">
                <span>Total Authorized</span>
                <span className="font-serif text-2xl text-white">{formatCurrency(summary.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button variant="primary" size="lg" to="/shop" icon={ArrowRight} iconPosition="right">
          Continue Browsing Repertoire
        </Button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 glass-panel border-white/20 px-6 py-3.5 text-xs uppercase tracking-widest text-gray-300 hover:text-white hover:border-[#D4AF37] transition-colors cursor-pointer font-mono"
        >
          <Printer size={14} />
          <span>Print Order Dossier</span>
        </button>
      </div>
    </PageTransition>
  )
}
