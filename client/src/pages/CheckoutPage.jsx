import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Lock,
  ShieldCheck,
  Truck,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  UserCheck,
  RefreshCw,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import orderService from '../services/orderService'
import { formatCurrency } from '../utils/formatters'
import Button from '../components/ui/Button'
import PageTransition from '../components/motion/PageTransition'

export default function CheckoutPage() {
  const {
    cart,
    subtotal,
    shipping,
    discount,
    appliedCoupon,
    grandTotal,
    clearCart,
  } = useCart()

  const { user, isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    demoPaymentMethod: 'atelier_cod',
  })

  // Validation & Submission State
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [isQuickLoggingIn, setIsQuickLoggingIn] = useState(false)

  // Field validation rules
  const validateField = (name, value) => {
    const val = (value || '').trim()
    switch (name) {
      case 'fullName':
        if (!val) return 'Full name is required.'
        if (val.length < 3) return 'Please provide your full legal name (minimum 3 characters).'
        return ''
      case 'email':
        if (!val) return 'Email address is required.'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Please provide a valid email address.'
        return ''
      case 'phone':
        if (!val) return 'Phone number is required for courier dispatch.'
        const cleanPhone = val.replace(/\D/g, '')
        if (cleanPhone.length < 10) return 'Please provide a valid 10-digit contact number.'
        return ''
      case 'address':
        if (!val) return 'Delivery street address is required.'
        if (val.length < 5) return 'Please provide a comprehensive street address.'
        return ''
      case 'city':
        if (!val) return 'City is required.'
        return ''
      case 'state':
        if (!val) return 'State / Province is required.'
        return ''
      case 'postalCode':
        if (!val) return 'Postal / PIN code is required.'
        const cleanPin = val.replace(/\D/g, '')
        if (cleanPin.length < 4) return 'Please enter a valid postal / PIN code.'
        return ''
      default:
        return ''
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (touched[name]) {
      const errorMsg = validateField(name, value)
      setErrors((prev) => ({ ...prev, [name]: errorMsg }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const errorMsg = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: errorMsg }))
  }

  // Pre-fill coordinates if authenticated patron
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || '',
        city: prev.city || user.city || '',
        state: prev.state || user.state || '',
        postalCode: prev.postalCode || user.postalCode || '',
      }))
    }
  }, [user])

  const handleQuickPatronAuth = async () => {
    setIsQuickLoggingIn(true)
    setApiError(null)
    const res = await login('patron@aureva-studios.demo', 'AurevaSalon2026!')
    setIsQuickLoggingIn(false)
    if (!res.success) {
      setApiError(res.message || 'Could not authenticate demo patron.')
    }
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    setApiError(null)

    // Check authentication requirement
    if (!isAuthenticated) {
      setApiError('Order creation requires a verified patron session. Please sign in below or use one-click demo patron.')
      return
    }

    const newErrors = {}
    const fieldsToValidate = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'postalCode']
    let hasError = false

    fieldsToValidate.forEach((field) => {
      const errorMsg = validateField(field, formData[field])
      if (errorMsg) {
        newErrors[field] = errorMsg
        hasError = true
      }
    })

    setTouched({
      fullName: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      postalCode: true,
    })
    setErrors(newErrors)

    if (hasError) {
      const firstErrorEl = document.querySelector('.checkout-error')
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    if (cart.length === 0) {
      setApiError('Your shopping bag is empty. Please select silhouttes before finalizing order.')
      return
    }

    setIsSubmitting(true)

    // Construct server-authoritative order payload
    const orderPayload = {
      customerName: formData.fullName.trim(),
      customerEmail: formData.email.trim(),
      customerPhone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      postalCode: formData.postalCode.trim(),
      items: cart.map((i) => ({
        variantId: i.variantId || undefined,
        productId: i.product?.id || i.id,
        name: i.product?.name,
        price: i.product?.price,
        quantity: i.quantity,
        size: i.size || null,
        color: i.color || null,
        image: i.product?.images?.[0] || null,
      })),
      couponCode: appliedCoupon ? appliedCoupon.code : null,
      paymentMethod: formData.demoPaymentMethod,
    }

    try {
      const createdOrder = await orderService.createOrder(orderPayload)
      if (createdOrder) {
        await clearCart()

        try {
          const localOrders = JSON.parse(localStorage.getItem('aureva_orders') || '[]')
          localStorage.setItem('aureva_orders', JSON.stringify([createdOrder, ...localOrders]))
        } catch {
          // Local storage handled
        }

        setIsSubmitting(false)
        navigate(`/order-confirmation/${createdOrder.orderNumber || createdOrder.id}`, {
          state: { order: createdOrder },
        })
        return
      }
    } catch (err) {
      console.error('[Checkout] API Order Creation Error:', err)
      setIsSubmitting(false)
      setApiError(
        err.message || 'The atelier order dispatch system could not finalize this order. Please verify your details.'
      )
    }
  }

  if (cart.length === 0 && !isSubmitting) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 sm:py-32 text-center space-y-6 text-white">
        <div className="inline-flex p-4 rounded-full glass-panel mb-2">
          <ShoppingBag size={48} className="text-gray-500 stroke-[1.2]" />
        </div>
        <span className="tag-overline text-[#D4AF37] block font-mono">NO ACTIVE SELECTION</span>
        <h1 className="editorial-title text-3xl sm:text-4xl font-serif text-white">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-xs text-gray-400 tracking-wider max-w-sm mx-auto leading-relaxed font-mono">
          Please select pieces from our catalog before proceeding to order finalization.
        </p>
        <div className="pt-4">
          <Button variant="primary" size="lg" to="/shop">
            Browse Ready-to-Wear
          </Button>
        </div>
      </div>
    )
  }

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 text-white">
      {/* Editorial Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="tag-overline text-[#D4AF37] font-mono">FINAL ACQUISITION</span>
          <h1 className="editorial-title text-3xl sm:text-5xl font-serif text-white mt-1">
            Order Finalization
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
          <Lock size={13} className="text-[#D4AF37]" />
          <span>PostgreSQL-Backed Secure Transaction</span>
        </div>
      </div>

      {/* Global Error Banner */}
      {apiError && (
        <div className="p-5 glass-panel border border-red-500/40 bg-[#1A0D14]/90 rounded-xs space-y-3">
          <div className="flex items-center gap-2 text-red-400 text-xs uppercase tracking-wider font-mono font-semibold">
            <AlertCircle size={16} />
            <span>Order Finalization Notice</span>
          </div>
          <p className="text-sm font-serif text-gray-200">{apiError}</p>
        </div>
      )}

      {/* Unauthenticated Patron Alert with 1-Click Fast Auth */}
      {!isAuthenticated && (
        <div className="p-5 glass-panel border border-[#D4AF37]/40 bg-[#121420]/80 rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-mono flex items-center gap-1.5 font-semibold">
              <Sparkles size={14} />
              <span>Patron Session Required</span>
            </span>
            <p className="text-xs text-gray-300 font-mono">
              Order records are archived under verified patron accounts. Sign in to finalize checkout.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              disabled={isQuickLoggingIn}
              onClick={handleQuickPatronAuth}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs uppercase tracking-wider font-mono font-semibold gold-gradient-bg text-[#08090D] hover:opacity-90 transition-opacity cursor-pointer"
            >
              <UserCheck size={14} />
              <span>{isQuickLoggingIn ? 'Verifying...' : '1-Click Demo Patron'}</span>
            </button>
            <Link
              to="/login"
              state={{ from: '/checkout' }}
              className="px-3.5 py-2 text-xs uppercase tracking-wider font-mono border border-white/20 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Coordinates Form */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-10" noValidate>
          {/* Section 1: Contact Coordinates */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl text-white border-b border-white/10 pb-2">
              01 / Patron Coordinates
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-300 font-mono flex justify-between">
                  <span>Full Legal Name *</span>
                  {errors.fullName && <span className="text-[#E57373]">{errors.fullName}</span>}
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Elena Rostova"
                  className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors font-mono ${
                    errors.fullName ? 'border-[#E57373] bg-red-950/20 checkout-error' : 'border-white/15 focus:border-[#D4AF37]'
                  }`}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-300 font-mono flex justify-between">
                  <span>Email Dispatch Address *</span>
                  {errors.email && <span className="text-[#E57373]">{errors.email}</span>}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="elena@atelier-salon.fr"
                  className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors font-mono ${
                    errors.email ? 'border-[#E57373] bg-red-950/20 checkout-error' : 'border-white/15 focus:border-[#D4AF37]'
                  }`}
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-300 font-mono flex justify-between">
                  <span>Contact Telephone *</span>
                  {errors.phone && <span className="text-[#E57373]">{errors.phone}</span>}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="+91 98765 43210"
                  className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors font-mono ${
                    errors.phone ? 'border-[#E57373] bg-red-950/20 checkout-error' : 'border-white/15 focus:border-[#D4AF37]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Destination */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl text-white border-b border-white/10 pb-2">
              02 / Delivery Destination
            </h2>

            <div className="space-y-4">
              {/* Street Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-300 font-mono flex justify-between">
                  <span>Street Address & Residence *</span>
                  {errors.address && <span className="text-[#E57373]">{errors.address}</span>}
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="42 Rue du Faubourg Saint-Honoré, Appt 4B"
                  className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors font-mono ${
                    errors.address ? 'border-[#E57373] bg-red-950/20 checkout-error' : 'border-white/15 focus:border-[#D4AF37]'
                  }`}
                />
              </div>

              {/* City, State, Postal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-gray-300 font-mono">
                    <span>City *</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Paris"
                    className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors font-mono ${
                      errors.city ? 'border-[#E57373] bg-red-950/20 checkout-error' : 'border-white/15 focus:border-[#D4AF37]'
                    }`}
                  />
                  {errors.city && <p className="text-[11px] text-[#E57373] font-mono">{errors.city}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-gray-300 font-mono">
                    <span>State / Province *</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Île-de-France"
                    className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors font-mono ${
                      errors.state ? 'border-[#E57373] bg-red-950/20 checkout-error' : 'border-white/15 focus:border-[#D4AF37]'
                    }`}
                  />
                  {errors.state && <p className="text-[11px] text-[#E57373] font-mono">{errors.state}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-gray-300 font-mono">
                    <span>PIN / Postal *</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="75008"
                    className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors font-mono ${
                      errors.postalCode ? 'border-[#E57373] bg-red-950/20 checkout-error' : 'border-white/15 focus:border-[#D4AF37]'
                    }`}
                  />
                  {errors.postalCode && <p className="text-[11px] text-[#E57373] font-mono">{errors.postalCode}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Demo Payment Method */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl text-white border-b border-white/10 pb-2">
              03 / Payment Protocol
            </h2>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 glass-panel border-[#D4AF37]/50 cursor-pointer rounded-xs">
                <input
                  type="radio"
                  name="demoPaymentMethod"
                  value="atelier_cod"
                  checked={formData.demoPaymentMethod === 'atelier_cod'}
                  onChange={handleInputChange}
                  className="mt-1 accent-[#D4AF37]"
                />
                <div className="space-y-0.5 text-xs">
                  <span className="font-semibold uppercase tracking-wider text-white font-mono block">
                    White-Glove Atelier Handover / Cash on Delivery
                  </span>
                  <span className="text-gray-400 leading-relaxed block font-sans">
                    Complimentary courier inspection conducted at delivery handover. Zero payment card details required.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
              className="h-14 font-semibold tracking-[0.2em]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-[#08090D] border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing Order on Atelier Database...</span>
                </span>
              ) : (
                `Complete Order • ${formatCurrency(grandTotal)}`
              )}
            </Button>
            <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-mono">
              PostgreSQL transactional persistence • Instant courier assignment
            </p>
          </div>
        </form>

        {/* Right Column: Order Summary Review */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="glass-panel-gold bg-[#0E1018]/90 p-6 sm:p-8 space-y-6 rounded-xs border border-white/15">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="font-serif text-2xl text-white">Order Review</h2>
              <Link to="/cart" className="text-xs uppercase tracking-wider text-[#D4AF37] hover:underline font-mono">
                Edit Bag
              </Link>
            </div>

            {/* Items List */}
            <div className="divide-y divide-white/10 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="py-3 flex gap-3 items-center">
                  <div className="w-14 h-18 bg-[#121522] border border-white/10 overflow-hidden shrink-0">
                    <img
                      src={item.product.images ? item.product.images[0] : ''}
                      alt={item.product.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-serif text-sm text-white truncate">{item.product.name}</p>
                    <p className="text-[11px] text-gray-400 font-mono">
                      {item.size} • {item.color} • Qty {item.quantity}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-serif text-xs font-semibold text-white">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Ledger */}
            <div className="border-t border-white/10 pt-4 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-[#D4AF37]">
                  <span>Privilege ({appliedCoupon.code})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-400">
                <span>White-Glove Courier</span>
                <span className={shipping === 0 ? 'text-[#D4AF37] font-semibold' : 'text-white'}>
                  {shipping === 0 ? 'COMPLIMENTARY' : formatCurrency(shipping)}
                </span>
              </div>

              <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                <span className="font-serif text-base text-white">Grand Total</span>
                <span className="font-serif text-2xl font-bold text-white">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Guarantees Box */}
          <div className="p-5 glass-panel text-xs text-gray-400 space-y-3 rounded-xs border-white/10">
            <div className="flex items-center gap-2 text-white font-mono uppercase tracking-wider text-[11px]">
              <ShieldCheck size={16} className="text-[#D4AF37]" />
              <span>AUREVA Salon Guarantees</span>
            </div>
            <p className="leading-relaxed">
              Every garment is inspected by senior salon curators prior to dispatch. Hand-signed authenticity monograph included.
            </p>
          </div>
        </aside>
      </div>
    </PageTransition>
  )
}
