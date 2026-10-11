import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Lock,
  ShieldCheck,
  Truck,
  AlertCircle,
  ShoppingBag,
  Tag,
  Sparkles,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
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
    createDemoOrder,
  } = useCart()

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

  // Validation errors state
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmitOrder = (e) => {
    e.preventDefault()

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
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      const createdOrder = createDemoOrder({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postalCode: formData.postalCode.trim(),
        paymentMethod: formData.demoPaymentMethod,
      })

      setIsSubmitting(false)
      navigate('/order-confirmation', { state: { order: createdOrder } })
    }, 600)
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
      {/* Editorial Page Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="tag-overline text-[#D4AF37] font-mono">CONCIERGE CHECKOUT</span>
          <h1 className="editorial-title text-3xl sm:text-4xl font-serif text-white mt-1">
            Order Finalization
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#D4AF37] font-mono">
          <Lock size={14} />
          <span>Atelier Secure Protocol</span>
        </div>
      </div>

      {/* Demonstration Disclaimer Alert in Liquid Glass */}
      <div className="glass-panel p-4 sm:p-5 text-xs text-white flex items-start gap-3 rounded-xs border-white/10">
        <ShieldCheck size={20} className="text-[#D4AF37] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold uppercase tracking-wider text-[11px] font-mono text-[#D4AF37]">
            Frontend Demonstration Checkout
          </p>
          <p className="text-[11px] text-gray-300 leading-relaxed font-sans">
            This application is an editorial portfolio demo. No real payment card details will be requested or processed, and no real fulfillment order will be dispatched.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Form Details */}
        <form onSubmit={handleSubmitOrder} noValidate className="lg:col-span-7 space-y-8">
          {/* Section 1: Customer Contact Info */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl text-white border-b border-white/10 pb-2">
              01 / Contact Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-mono font-semibold block">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Navaneeth Sharma"
                  className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors ${
                    errors.fullName ? 'border-[#E57373] bg-red-950/20 checkout-error' : 'border-white/15 focus:border-[#D4AF37]'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-[11px] text-[#E57373] flex items-center gap-1 mt-1 font-mono">
                    <AlertCircle size={12} />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-mono font-semibold block">
                  Email Address for Courier Updates *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="client@atelier.com"
                  className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors ${
                    errors.email ? 'border-[#E57373] bg-red-950/20 checkout-error' : 'border-white/15 focus:border-[#D4AF37]'
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-[#E57373] flex items-center gap-1 mt-1 font-mono">
                    <AlertCircle size={12} />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-mono font-semibold block">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="e.g. 9876543210"
                  className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors font-mono ${
                    errors.phone ? 'border-[#E57373] bg-red-950/20 checkout-error' : 'border-white/15 focus:border-[#D4AF37]'
                  }`}
                />
                {errors.phone && (
                  <p className="text-[11px] text-[#E57373] flex items-center gap-1 mt-1 font-mono">
                    <AlertCircle size={12} />
                    <span>{errors.phone}</span>
                  </p>
                )}
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
                <label className="text-[11px] uppercase tracking-wider text-gray-400 font-mono font-semibold block">
                  Street Address & Residence *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="e.g. 42 Lodhi Estate, Near India Habitat Centre"
                  className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors ${
                    errors.address ? 'border-[#E57373] bg-red-950/20 checkout-error' : 'border-white/15 focus:border-[#D4AF37]'
                  }`}
                />
                {errors.address && (
                  <p className="text-[11px] text-[#E57373] flex items-center gap-1 mt-1 font-mono">
                    <AlertCircle size={12} />
                    <span>{errors.address}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-gray-400 font-mono font-semibold block">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="New Delhi"
                    className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors ${
                      errors.city ? 'border-[#E57373] bg-red-950/20 checkout-error' : 'border-white/15 focus:border-[#D4AF37]'
                    }`}
                  />
                  {errors.city && (
                    <p className="text-[11px] text-[#E57373] flex items-center gap-1 mt-1 font-mono">
                      <AlertCircle size={12} />
                      <span>{errors.city}</span>
                    </p>
                  )}
                </div>

                {/* State */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-gray-400 font-mono font-semibold block">
                    State / Region *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Delhi"
                    className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors ${
                      errors.state ? 'border-[#E57373] bg-red-950/20 checkout-error' : 'border-white/15 focus:border-[#D4AF37]'
                    }`}
                  />
                  {errors.state && (
                    <p className="text-[11px] text-[#E57373] flex items-center gap-1 mt-1 font-mono">
                      <AlertCircle size={12} />
                      <span>{errors.state}</span>
                    </p>
                  )}
                </div>

                {/* Postal PIN */}
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-gray-400 font-mono font-semibold block">
                    Postal / PIN Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="110003"
                    className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors font-mono ${
                      errors.postalCode ? 'border-[#E57373] bg-red-950/20 checkout-error' : 'border-white/15 focus:border-[#D4AF37]'
                    }`}
                  />
                  {errors.postalCode && (
                    <p className="text-[11px] text-[#E57373] flex items-center gap-1 mt-1 font-mono">
                      <AlertCircle size={12} />
                      <span>{errors.postalCode}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Demo Payment Method */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl text-white border-b border-white/10 pb-2">
              03 / Demo Payment Protocol
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
                    Demo Atelier Handover / Cash on Delivery
                  </span>
                  <span className="text-gray-400 leading-relaxed block font-sans">
                    Demonstration protocol. Verification conducted at delivery handover. Zero payment card details required.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 glass-panel border-white/10 cursor-pointer rounded-xs">
                <input
                  type="radio"
                  name="demoPaymentMethod"
                  value="atelier_vault"
                  checked={formData.demoPaymentMethod === 'atelier_vault'}
                  onChange={handleInputChange}
                  className="mt-1 accent-[#D4AF37]"
                />
                <div className="space-y-0.5 text-xs">
                  <span className="font-semibold uppercase tracking-wider text-white font-mono block">
                    Simulated Atelier Salon Account (Demo Test)
                  </span>
                  <span className="text-gray-400 leading-relaxed block font-sans">
                    Authorizes this selection instantly against your demo salon account.
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
                  <span>Authorizing Demo Order...</span>
                </span>
              ) : (
                `Complete Demo Order • ${formatCurrency(grandTotal)}`
              )}
            </Button>
            <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-mono">
              Zero real funds will be charged • Instantaneous demo authorization
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

            {/* Pricing Breakdown */}
            <div className="border-t border-white/10 pt-4 space-y-3 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Merchandise Subtotal</span>
                <span className="font-serif text-base font-semibold text-white">{formatCurrency(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[#D4AF37] font-medium font-mono">
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    <span>Privilege Savings ({appliedCoupon?.code})</span>
                  </span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>White-Glove Courier Delivery</span>
                <span className="font-mono text-xs">
                  {shipping === 0 ? (
                    <span className="text-emerald-400 font-semibold uppercase text-[11px]">Complimentary</span>
                  ) : (
                    formatCurrency(shipping)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline text-base font-semibold text-white">
                <span>Total Authorization</span>
                <span className="font-serif text-2xl text-white">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Logistics Guarantee */}
            <div className="border-t border-white/10 pt-4 flex items-start gap-2.5 text-xs text-gray-400">
              <Truck size={15} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed font-mono">
                Complimentary 30-day salon returns and insured express transit.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </PageTransition>
  )
}
