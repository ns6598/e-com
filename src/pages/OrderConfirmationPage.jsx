import React, { useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { CheckCircle2, ShoppingBag, Truck, ArrowRight, ShieldCheck, Mail, Phone, Printer } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'
import Button from '../components/ui/Button'

export default function OrderConfirmationPage() {
  const location = useLocation()
  const { orderId } = useParams()

  const [order] = useState(() => {
    // 1. Check navigation state
    if (location.state && location.state.order) {
      return location.state.order
    }

    // 2. Check localStorage for last order
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
      <div className="max-w-3xl mx-auto px-4 py-24 sm:py-32 text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-[#171717]/5 mb-2">
          <ShoppingBag size={48} className="text-[#171717]/40 stroke-[1.2]" />
        </div>
        <span className="tag-overline text-[#6D202D] block">ORDER ARCHIVE</span>
        <h1 className="editorial-title text-3xl sm:text-5xl font-serif text-[#171717]">
          No Active Order Found
        </h1>
        <p className="text-xs text-[#171717]/60 tracking-wider max-w-md mx-auto leading-relaxed">
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
      {/* Top Confirmation Header */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={40} className="stroke-[1.6]" />
        </div>
        <span className="tag-overline text-[#6D202D] block">DEMO SELECTION CONFIRMED</span>
        <h1 className="editorial-title text-3xl sm:text-5xl font-serif text-[#171717]">
          Thank You for Your Selection
        </h1>
        <p className="text-xs text-[#171717]/70 leading-relaxed font-sans">
          Your pieces have been allocated from the atelier archive. An official dispatch dossier will be sent to <strong className="text-[#171717]">{customer.email}</strong>.
        </p>
      </div>

      {/* Demo Prototype Notice Banner */}
      <div className="bg-[#FAF8F5] border border-[#171717]/15 p-4 sm:p-5 text-xs text-[#171717]/80 flex items-start gap-3">
        <ShieldCheck size={18} className="text-[#6D202D] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold uppercase tracking-wider text-[11px] text-[#171717]">
            Frontend Demonstration Notice
          </p>
          <p className="text-[11px] leading-relaxed text-[#171717]/70">
            This transaction was conducted in demonstration mode. No real payment card details were collected or processed, and no commercial shipment has been dispatched.
          </p>
        </div>
      </div>

      {/* Order Reference Header Box */}
      <div className="border border-[#171717]/20 bg-[#FAF8F5] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#171717]/60 font-mono block">
            DEMO ORDER REFERENCE
          </span>
          <span className="font-mono text-xl sm:text-2xl font-bold text-[#171717] tracking-wider block mt-0.5">
            {orderNumber}
          </span>
          <span className="text-[11px] text-[#171717]/60 font-mono block mt-1">
            Logged on: {formattedDate}
          </span>
        </div>

        <div className="sm:text-right">
          <span className="text-[10px] uppercase tracking-widest text-[#171717]/60 font-mono block">
            FULFILLMENT STATUS
          </span>
          <span className="inline-block bg-[#171717] text-[#F6F2EA] px-3 py-1 text-[10px] font-mono uppercase tracking-widest mt-1">
            In Atelier Preparation
          </span>
        </div>
      </div>

      {/* Two-Column Grid: Customer Details & Items Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer & Shipping Summary */}
        <div className="md:col-span-5 space-y-6">
          {/* Shipping Address */}
          <div className="border border-[#171717]/15 p-6 bg-[#FAF8F5] space-y-3 text-xs">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#171717]/60 font-semibold border-b border-[#171717]/10 pb-2">
              Delivery Destination
            </h3>
            <div className="space-y-1.5 text-[#171717]/80">
              <p className="font-semibold text-sm text-[#171717]">{customer.fullName}</p>
              <p>{customer.address}</p>
              <p>{customer.city}, {customer.state} — {customer.postalCode}</p>
              <p className="text-[10px] uppercase tracking-wider text-[#171717]/60 font-mono">India</p>
            </div>
            <div className="pt-3 border-t border-[#171717]/10 space-y-1 text-[#171717]/70">
              <p className="flex items-center gap-2">
                <Mail size={13} />
                <span>{customer.email}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={13} />
                <span>+91 {customer.phone}</span>
              </p>
            </div>
          </div>

          {/* Logistics Courier Notice */}
          <div className="border border-[#171717]/15 p-5 bg-[#FAF8F5] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-[#6D202D]">
              <Truck size={16} />
              <span className="font-semibold uppercase tracking-wider text-[11px]">Courier Transit</span>
            </div>
            <p className="text-[#171717]/70 text-[11px] leading-relaxed">
              Dispatched with insured air courier. Estimated arrival in 2–4 business days. Signature required on handover.
            </p>
          </div>
        </div>

        {/* Right Column: Ordered Items & Financial Breakdown */}
        <div className="md:col-span-7 space-y-6">
          <div className="border border-[#171717]/15 p-6 sm:p-8 bg-[#FAF8F5] space-y-6">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#171717]/60 font-semibold border-b border-[#171717]/10 pb-2">
              Allocated Pieces ({summary.totalItems})
            </h3>

            {/* Items List */}
            <div className="divide-y divide-[#171717]/10">
              {items.map((item, idx) => (
                <div key={idx} className="py-4 flex gap-4 items-center">
                  <div className="w-16 h-20 bg-[#ECE5D8] border border-[#171717]/10 overflow-hidden shrink-0">
                    <img
                      src={item.product.images ? item.product.images[0] : ''}
                      alt={item.product.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-base text-[#171717] truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-[#171717]/60 font-mono">
                      Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-semibold text-[#171717] block">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                    <span className="text-[10px] text-[#171717]/50 font-mono">
                      {formatCurrency(item.product.price)} each
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="border-t border-[#171717]/15 pt-4 space-y-2.5 text-xs text-[#171717]/80">
              <div className="flex justify-between">
                <span>Merchandise Subtotal</span>
                <span className="font-mono font-semibold text-[#171717]">{formatCurrency(summary.subtotal)}</span>
              </div>

              {summary.discount > 0 && (
                <div className="flex justify-between text-[#6D202D] font-medium">
                  <span>Privilege Savings ({summary.couponCode})</span>
                  <span className="font-mono">-{formatCurrency(summary.discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>White-Glove Courier Delivery</span>
                <span className="font-mono">
                  {summary.shipping === 0 ? (
                    <span className="text-emerald-700 font-semibold uppercase text-[11px]">Complimentary</span>
                  ) : (
                    formatCurrency(summary.shipping)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-[#171717]/15 flex justify-between items-baseline text-base font-semibold text-[#171717]">
                <span>Total Authorized</span>
                <span className="font-mono text-xl">{formatCurrency(summary.grandTotal)}</span>
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
          className="inline-flex items-center gap-2 border border-[#171717]/30 px-6 py-3.5 text-xs uppercase tracking-widest text-[#171717] hover:bg-[#171717] hover:text-[#F6F2EA] transition-colors cursor-pointer"
        >
          <Printer size={14} />
          <span>Print Order Dossier</span>
        </button>
      </div>
    </div>
  )
}
