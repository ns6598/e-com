import React, { useState, useEffect } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { CheckCircle2, ShoppingBag, Truck, ArrowRight, ShieldCheck, Mail, Phone, Printer } from 'lucide-react'
import api from '../services/api'
import { formatCurrency } from '../utils/formatters'
import PageTransition from '../components/motion/PageTransition'

export default function OrderConfirmationPage() {
  const location = useLocation()
  const { orderId } = useParams()

  const [order, setOrder] = useState(() => {
    if (location.state && location.state.order) {
      return location.state.order
    }
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem('aureva_orders') : null
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!orderId) return parsed[0]
          return parsed.find((o) => o.orderNumber === orderId || o.id === orderId) || parsed[0]
        }
      }
    } catch (e) {
      console.warn('Failed reading last order from localStorage:', e)
    }
    return null
  })

  // Live lookup from API if needed
  useEffect(() => {
    if (orderId && (!order || (order.orderNumber !== orderId && order.id !== orderId))) {
      api.get(`/orders/${orderId}`)
        .then((res) => {
          if (res.success && res.data) {
            setOrder(res.data)
          }
        })
        .catch(() => {})
    }
  }, [orderId, order])

  if (!order) {
    return (
      <PageTransition className="min-h-[70vh] flex items-center justify-center px-4 py-20 text-[#F5F5F5]">
        <div className="max-w-md w-full text-center space-y-6 p-8 border border-[#292929] bg-[#111111]/80 backdrop-blur-sm">
          <div className="inline-flex p-5 rounded-full bg-[#171717] border border-[#292929]">
            <ShoppingBag size={42} className="text-[#A6A6A6] stroke-[1.2]" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-[#B8FF00] block mb-2">
              DISPATCH ARCHIVE
            </span>
            <h1 className="font-['Syne'] text-3xl font-bold uppercase text-[#F5F5F5]">
              NO ORDER RECORD
            </h1>
          </div>
          <p className="text-xs text-[#A6A6A6] tracking-wide leading-relaxed font-sans">
            No active order dispatch record was found for this session. Explore our catalog to browse alternative fashion drops.
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

  // Normalized order variables
  const orderNumber = order.orderNumber || order.id
  const customerName = order.customerName || order.customer?.fullName || order.customer?.name || 'Patron'
  const customerEmail = order.customerEmail || order.customer?.email || 'patron@aureva-studios.demo'
  const customerPhone = order.customerPhone || order.customer?.phone || ''
  const shippingAddress = order.shippingAddress?.address || order.customer?.address || order.address || 'Standard Delivery'
  const shippingCity = order.shippingAddress?.city || order.customer?.city || order.city || 'Mumbai'
  const shippingState = order.shippingAddress?.state || order.customer?.state || order.state || ''
  const shippingPostalCode = order.shippingAddress?.postalCode || order.customer?.postalCode || order.postalCode || ''

  const rawItems = order.items || []
  const normalizedItems = rawItems.map((item) => ({
    name: item.name || item.product?.name || 'Alternative Silhouette',
    image: item.image || item.product?.images?.[0] || '',
    size: item.size || 'One Size',
    color: item.color || '',
    quantity: item.quantity || 1,
    price: item.price || 0,
  }))

  const subtotal = order.subtotal !== undefined ? order.subtotal : order.summary?.subtotal || 0
  const shipping = order.shipping !== undefined ? order.shipping : order.summary?.shipping || 0
  const discount = order.discount !== undefined ? order.discount : order.summary?.discount || 0
  const total = order.total !== undefined ? order.total : order.summary?.grandTotal || subtotal + shipping - discount
  const totalItemsCount = normalizedItems.reduce((acc, i) => acc + i.quantity, 0)

  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <PageTransition className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 text-[#F5F5F5]">
      {/* Confirmation Header */}
      <div className="text-center space-y-4 border-b border-[#292929] pb-8">
        <div className="inline-flex p-4 rounded-full bg-[#171717] border border-[#B8FF00]/50 text-[#B8FF00]">
          <CheckCircle2 size={44} />
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#B8FF00] block mb-1">
            TRANSACTION CONFIRMED & DISPATCH ASSIGNED
          </span>
          <h1 className="font-['Syne'] text-3xl sm:text-5xl uppercase font-extrabold tracking-wider text-[#F5F5F5]">
            ORDER RECORD ARCHIVED
          </h1>
        </div>
        <p className="text-xs text-[#A6A6A6] font-mono tracking-wider max-w-md mx-auto leading-relaxed">
          Thank you, <strong className="text-[#F5F5F5]">{customerName}</strong>. Your darkwear order has been transactionally committed to our PostgreSQL inventory database.
        </p>
      </div>

      {/* Meta Strip */}
      <div className="p-4 sm:p-5 bg-[#171717] border border-[#292929] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div>
          <span className="text-[10px] text-[#A6A6A6] uppercase block">ORDER REF</span>
          <span className="font-bold text-[#F5F5F5] truncate block">{orderNumber}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#A6A6A6] uppercase block">DISPATCH DATE</span>
          <span className="text-[#F5F5F5]">{formattedDate}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#A6A6A6] uppercase block">PAYMENT PROTOCOL</span>
          <span className="text-[#F5F5F5] uppercase">CASH ON DELIVERY</span>
        </div>
        <div>
          <span className="text-[10px] text-[#A6A6A6] uppercase block">TOTAL AMOUNT</span>
          <span className="font-bold text-[#B8FF00]">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Items Breakdown */}
      <div className="bg-[#111111] p-6 sm:p-8 border border-[#292929] space-y-6">
        <div className="flex items-center justify-between border-b border-[#292929] pb-4">
          <h2 className="font-['Oswald'] uppercase text-lg font-bold tracking-wider text-[#F5F5F5]">
            ACQUIRED SILHOUETTES ({totalItemsCount})
          </h2>
          <span className="text-xs font-mono text-[#A6A6A6]">VERIFIED STOCK RESERVATION</span>
        </div>

        <div className="divide-y divide-[#292929]">
          {normalizedItems.map((item, idx) => (
            <div key={idx} className="py-4 flex gap-4 items-center">
              <div className="w-16 h-20 bg-[#171717] border border-[#292929] overflow-hidden shrink-0">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'}
                  alt={item.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-['Syne'] uppercase text-sm font-bold text-[#F5F5F5] truncate">{item.name}</p>
                <p className="text-xs text-[#A6A6A6] font-mono">
                  SIZE: <span className="text-[#F5F5F5]">{item.size}</span> {item.color && `• COLOR: ${item.color}`}
                </p>
                <p className="text-[11px] text-[#A6A6A6] font-mono">QTY: {item.quantity}</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-bold text-[#F5F5F5]">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Ledger */}
        <div className="border-t border-[#292929] pt-4 space-y-2 text-xs font-mono">
          <div className="flex justify-between text-[#A6A6A6]">
            <span>SUBTOTAL</span>
            <span className="text-[#F5F5F5]">{formatCurrency(subtotal)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-[#B8FF00]">
              <span>PROMO PRIVILEGE</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}

          <div className="flex justify-between text-[#A6A6A6]">
            <span>STANDARD EXPRESS COURIER</span>
            <span className={shipping === 0 ? 'text-[#B8FF00] font-bold' : 'text-[#F5F5F5]'}>
              {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
            </span>
          </div>

          <div className="border-t border-[#292929] pt-3 flex justify-between items-baseline">
            <span className="font-['Oswald'] text-sm uppercase tracking-wider font-bold text-[#F5F5F5]">
              FINAL DISPATCH TOTAL
            </span>
            <span className="font-mono text-2xl font-bold text-[#F5F5F5]">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-[#171717] border border-[#292929] space-y-3">
          <h3 className="font-['Oswald'] uppercase text-sm font-bold tracking-wider text-[#F5F5F5] flex items-center gap-2">
            <Truck size={15} className="text-[#B8FF00]" />
            <span>DELIVERY DESTINATION</span>
          </h3>
          <p className="text-xs text-[#A6A6A6] font-mono leading-relaxed">
            <strong className="text-[#F5F5F5] block mb-1">{customerName}</strong>
            {shippingAddress}<br />
            {shippingCity}{shippingState ? `, ${shippingState}` : ''} {shippingPostalCode}<br />
            {customerPhone && `Contact: ${customerPhone}`}
          </p>
        </div>

        <div className="p-6 bg-[#171717] border border-[#292929] space-y-3">
          <h3 className="font-['Oswald'] uppercase text-sm font-bold tracking-wider text-[#F5F5F5] flex items-center gap-2">
            <Mail size={15} className="text-[#B8FF00]" />
            <span>DISPATCH NOTIFICATIONS</span>
          </h3>
          <p className="text-xs text-[#A6A6A6] font-mono leading-relaxed">
            Automated tracking dispatches will be delivered to <strong className="text-[#F5F5F5]">{customerEmail}</strong> once the courier scans your package barcode.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#292929]">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-3 border border-[#292929] bg-[#111111] hover:bg-[#171717] text-[#F5F5F5] font-['Oswald'] text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer w-full sm:w-auto justify-center"
        >
          <Printer size={14} />
          <span>PRINT DISPATCH RECEIPT</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/account"
            className="px-5 py-3 border border-[#292929] bg-[#111111] hover:border-[#B8FF00] hover:text-[#B8FF00] text-[#F5F5F5] font-['Oswald'] text-xs uppercase tracking-wider font-bold transition-colors text-center flex-1 sm:flex-none"
          >
            VIEW IN DOSSIER
          </Link>
          <Link
            to="/shop"
            className="px-6 py-3 bg-[#B8FF00] hover:bg-[#cbfb27] text-[#090909] font-['Oswald'] text-xs uppercase tracking-wider font-bold transition-all text-center flex-1 sm:flex-none"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    </PageTransition>
  )
}
