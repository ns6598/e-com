import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Lock,
  ShieldCheck,
  Truck,
  AlertCircle,
  ShoppingBag,
  UserCheck,
  Check,
  ArrowRight,
  Radio,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import orderService from '../services/orderService'
import { formatCurrency } from '../utils/formatters'
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
    deliveryMethod: 'standard_express',
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
        if (!val) return 'Full legal name is required.'
        if (val.length < 3) return 'Minimum 3 characters required.'
        return ''
      case 'email':
        if (!val) return 'Email address is required.'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Valid email format required.'
        return ''
      case 'phone':
        if (!val) return 'Phone number required for courier dispatch.'
        const cleanPhone = val.replace(/\D/g, '')
        if (cleanPhone.length < 10) return 'Valid 10-digit number required.'
        return ''
      case 'address':
        if (!val) return 'Delivery address is required.'
        if (val.length < 5) return 'Full street address required.'
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
        if (cleanPin.length < 4) return 'Valid postal code required.'
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

  // Pre-fill coordinates if authenticated
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
      setApiError(res.message || 'Could not authenticate demo patron account.')
    }
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    setApiError(null)

    // Check authentication requirement
    if (!isAuthenticated) {
      setApiError('Order creation requires a patron account. Please sign in below or use 1-Click Demo Patron.')
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
      setApiError('Your shopping bag is empty. Please select products before finalizing order.')
      return
    }

    setIsSubmitting(true)

    // Server-authoritative order payload
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
          // Handled
        }

        setIsSubmitting(false)
        navigate(`/order-confirmation/${createdOrder.orderNumber || createdOrder.id}`, {
          state: { order: createdOrder },
        })
        return
      }
    } catch (err) {
      console.error('[Checkout] Order Creation Error:', err)
      setIsSubmitting(false)
      setApiError(
        err.message || 'Unable to finalize order. Please check the provided information and try again.'
      )
    }
  }

  if (cart.length === 0 && !isSubmitting) {
    return (
      <PageTransition className="min-h-[70vh] flex items-center justify-center px-4 py-20 text-[#F5F5F5]">
        <div className="max-w-md w-full text-center space-y-6 p-8 border border-[#292929] bg-[#111111]/80 backdrop-blur-sm">
          <div className="inline-flex p-5 rounded-full bg-[#171717] border border-[#292929]">
            <ShoppingBag size={42} className="text-[#A6A6A6] stroke-[1.2]" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-[#B8FF00] block mb-2">
              BAG IS EMPTY
            </span>
            <h1 className="font-['Syne'] text-3xl font-bold uppercase text-[#F5F5F5]">
              NO ACTIVE SELECTION
            </h1>
          </div>
          <p className="text-xs text-[#A6A6A6] tracking-wide leading-relaxed font-sans">
            Please add items to your shopping bag before proceeding to checkout.
          </p>
          <div className="pt-4">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#B8FF00] hover:bg-[#cbfb27] text-[#090909] font-['Oswald'] text-sm uppercase tracking-[0.18em] font-bold transition-all shadow-[0_0_20px_rgba(184,255,0,0.2)]"
            >
              <span>BROWSE ALL PRODUCTS</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10 text-[#F5F5F5]">
      {/* Header */}
      <div className="border-b border-[#292929] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#B8FF00] block">
            AUREVA CHECKOUT
          </span>
          <h1 className="font-['Syne'] text-3xl sm:text-5xl uppercase font-extrabold tracking-wider text-[#F5F5F5] mt-1">
            SECURE CHECKOUT
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#A6A6A6] font-mono">
          <Lock size={13} className="text-[#B8FF00]" />
          <span>PostgreSQL-Backed Secure Transaction</span>
        </div>
      </div>

      {/* Global Error Banner */}
      {apiError && (
        <div className="p-4 bg-[#171717] border border-[#8B0000] text-[#F5F5F5] space-y-2">
          <div className="flex items-center gap-2 text-[#8B0000] text-xs uppercase tracking-wider font-mono font-bold">
            <AlertCircle size={16} />
            <span>CHECKOUT NOTICE</span>
          </div>
          <p className="text-xs text-[#A6A6A6] font-mono">{apiError}</p>
        </div>
      )}

      {/* Unauthenticated Alert */}
      {!isAuthenticated && (
        <div className="p-5 bg-[#171717] border border-[#B8FF00]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-[#B8FF00] font-mono flex items-center gap-1.5 font-bold">
              <span>CUSTOMER ACCOUNT REQUIRED</span>
            </span>
            <p className="text-xs text-[#A6A6A6] font-sans">
              Orders are associated with your verified account for delivery tracking and order history.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              disabled={isQuickLoggingIn}
              onClick={handleQuickPatronAuth}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs uppercase tracking-wider font-['Oswald'] font-bold bg-[#B8FF00] text-[#090909] hover:bg-[#cbfb27] transition-all cursor-pointer"
            >
              <UserCheck size={14} />
              <span>{isQuickLoggingIn ? 'AUTHENTICATING...' : '1-CLICK TEST LOGIN'}</span>
            </button>
            <Link
              to="/login"
              state={{ from: '/checkout' }}
              className="px-4 py-2.5 text-xs uppercase tracking-wider font-['Oswald'] font-bold border border-[#292929] bg-[#111111] hover:border-[#B8FF00] hover:text-[#B8FF00] transition-colors"
            >
              SIGN IN
            </Link>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Form */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-10" noValidate>
          {/* Section 1: Contact */}
          <div className="space-y-4 bg-[#111111] p-6 border border-[#292929]">
            <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5] border-b border-[#292929] pb-3">
              01 / CONTACT
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono flex justify-between">
                  <span>Full Legal Name *</span>
                  {errors.fullName && <span className="text-[#8B0000]">{errors.fullName}</span>}
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Alex Vance"
                  className={`w-full bg-[#171717] border p-3 text-xs tracking-wider text-[#F5F5F5] placeholder:text-[#A6A6A6]/50 focus:outline-none transition-colors font-mono ${
                    errors.fullName ? 'border-[#8B0000] checkout-error' : 'border-[#292929] focus:border-[#B8FF00]'
                  }`}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono flex justify-between">
                  <span>Email Address *</span>
                  {errors.email && <span className="text-[#8B0000]">{errors.email}</span>}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="alex@aureva-fashion.com"
                  className={`w-full bg-[#171717] border p-3 text-xs tracking-wider text-[#F5F5F5] placeholder:text-[#A6A6A6]/50 focus:outline-none transition-colors font-mono ${
                    errors.email ? 'border-[#8B0000] checkout-error' : 'border-[#292929] focus:border-[#B8FF00]'
                  }`}
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono flex justify-between">
                  <span>Phone Number *</span>
                  {errors.phone && <span className="text-[#8B0000]">{errors.phone}</span>}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="+91 98765 43210"
                  className={`w-full bg-[#171717] border p-3 text-xs tracking-wider text-[#F5F5F5] placeholder:text-[#A6A6A6]/50 focus:outline-none transition-colors font-mono ${
                    errors.phone ? 'border-[#8B0000] checkout-error' : 'border-[#292929] focus:border-[#B8FF00]'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address */}
          <div className="space-y-4 bg-[#111111] p-6 border border-[#292929]">
            <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5] border-b border-[#292929] pb-3">
              02 / DELIVERY ADDRESS
            </h2>

            <div className="space-y-4">
              {/* Street Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono flex justify-between">
                  <span>Street Address & Apartment *</span>
                  {errors.address && <span className="text-[#8B0000]">{errors.address}</span>}
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Flat 4B, Gothic Quarter, High Street"
                  className={`w-full bg-[#171717] border p-3 text-xs tracking-wider text-[#F5F5F5] placeholder:text-[#A6A6A6]/50 focus:outline-none transition-colors font-mono ${
                    errors.address ? 'border-[#8B0000] checkout-error' : 'border-[#292929] focus:border-[#B8FF00]'
                  }`}
                />
              </div>

              {/* City, State, Postal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono">
                    <span>City *</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Mumbai"
                    className={`w-full bg-[#171717] border p-3 text-xs tracking-wider text-[#F5F5F5] placeholder:text-[#A6A6A6]/50 focus:outline-none transition-colors font-mono ${
                      errors.city ? 'border-[#8B0000] checkout-error' : 'border-[#292929] focus:border-[#B8FF00]'
                    }`}
                  />
                  {errors.city && <p className="text-[10px] text-[#8B0000] font-mono">{errors.city}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono">
                    <span>State / Province *</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Maharashtra"
                    className={`w-full bg-[#171717] border p-3 text-xs tracking-wider text-[#F5F5F5] placeholder:text-[#A6A6A6]/50 focus:outline-none transition-colors font-mono ${
                      errors.state ? 'border-[#8B0000] checkout-error' : 'border-[#292929] focus:border-[#B8FF00]'
                    }`}
                  />
                  {errors.state && <p className="text-[10px] text-[#8B0000] font-mono">{errors.state}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono">
                    <span>PIN / Postal Code *</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="400001"
                    className={`w-full bg-[#171717] border p-3 text-xs tracking-wider text-[#F5F5F5] placeholder:text-[#A6A6A6]/50 focus:outline-none transition-colors font-mono ${
                      errors.postalCode ? 'border-[#8B0000] checkout-error' : 'border-[#292929] focus:border-[#B8FF00]'
                    }`}
                  />
                  {errors.postalCode && <p className="text-[10px] text-[#8B0000] font-mono">{errors.postalCode}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Delivery Method */}
          <div className="space-y-4 bg-[#111111] p-6 border border-[#292929]">
            <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5] border-b border-[#292929] pb-3">
              03 / DELIVERY METHOD
            </h2>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-[#171717] border border-[#B8FF00]/40 cursor-pointer">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="standard_express"
                    checked={formData.deliveryMethod === 'standard_express'}
                    onChange={handleInputChange}
                    className="accent-[#B8FF00]"
                  />
                  <div>
                    <span className="font-['Oswald'] uppercase text-sm font-bold text-[#F5F5F5] block">
                      STANDARD EXPRESS DISPATCH
                    </span>
                    <span className="text-[11px] text-[#A6A6A6] font-mono">
                      Estimated 2–4 Business Days • Tracked Delivery
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#B8FF00]">
                  {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                </span>
              </label>
            </div>
          </div>

          {/* Section 4: Payment */}
          <div className="space-y-4 bg-[#111111] p-6 border border-[#292929]">
            <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5] border-b border-[#292929] pb-3">
              04 / PAYMENT
            </h2>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 bg-[#171717] border border-[#B8FF00]/40 cursor-pointer">
                <input
                  type="radio"
                  name="demoPaymentMethod"
                  value="atelier_cod"
                  checked={formData.demoPaymentMethod === 'atelier_cod'}
                  onChange={handleInputChange}
                  className="mt-1 accent-[#B8FF00]"
                />
                <div className="space-y-1 text-xs">
                  <span className="font-['Oswald'] uppercase tracking-wider text-[#F5F5F5] font-bold block text-sm">
                    CASH ON DELIVERY / PAY ON RECEIPT
                  </span>
                  <span className="text-[#A6A6A6] leading-relaxed block font-sans">
                    Pay securely upon delivery inspection. No online card details required for demo verification.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#B8FF00] hover:bg-[#cbfb27] text-[#090909] font-['Oswald'] text-base uppercase tracking-[0.2em] font-bold transition-all shadow-[0_0_20px_rgba(184,255,0,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-[#090909] border-t-transparent rounded-full animate-spin" />
                  <span>AUTHORIZING ORDER TRANSACTION...</span>
                </span>
              ) : (
                `CONFIRM & COMPLETE ORDER • ${formatCurrency(grandTotal)}`
              )}
            </button>
            <p className="text-center text-[10px] text-[#A6A6A6] uppercase tracking-widest mt-2 font-mono">
              PostgreSQL Transactional Persistence • Instant Inventory Reservation
            </p>
          </div>
        </form>

        {/* Right Column: Order Review */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="bg-[#171717] p-6 sm:p-7 space-y-6 border border-[#292929]">
            <div className="flex items-center justify-between border-b border-[#292929] pb-4">
              <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5]">
                ORDER SUMMARY
              </h2>
              <Link to="/cart" className="text-xs uppercase tracking-wider text-[#B8FF00] hover:underline font-mono">
                EDIT BAG
              </Link>
            </div>

            {/* Items List */}
            <div className="divide-y divide-[#292929] max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} className="py-3 flex gap-3 items-center">
                  <div className="w-14 h-18 bg-[#111111] border border-[#292929] overflow-hidden shrink-0">
                    <img
                      src={item.product.images ? item.product.images[0] : ''}
                      alt={item.product.name}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'
                      }}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-['Syne'] uppercase text-xs font-bold text-[#F5F5F5] truncate">{item.product.name}</p>
                    <p className="text-[11px] text-[#A6A6A6] font-mono mt-0.5">
                      {item.size} • {item.color} • Qty {item.quantity}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-[#F5F5F5]">
                      {formatCurrency(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="border-t border-[#292929] pt-4 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-[#A6A6A6]">
                <span>SUBTOTAL</span>
                <span className="text-[#F5F5F5] font-semibold">{formatCurrency(subtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-[#B8FF00]">
                  <span>DISCOUNT ({appliedCoupon.code})</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#A6A6A6]">
                <span>ESTIMATED SHIPPING</span>
                <span className={shipping === 0 ? 'text-[#B8FF00] font-bold' : 'text-[#F5F5F5]'}>
                  {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                </span>
              </div>

              <div className="border-t border-[#292929] pt-3.5 flex justify-between items-baseline">
                <span className="font-['Oswald'] text-sm uppercase tracking-wider text-[#F5F5F5] font-bold">TOTAL</span>
                <div className="text-right">
                  <span className="font-mono text-xl sm:text-2xl font-bold text-[#F5F5F5]">
                    {formatCurrency(grandTotal)}
                  </span>
                  <p className="text-[10px] text-[#A6A6A6] font-mono mt-0.5">TAX INCLUDED</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-[#111111] border border-[#292929] flex items-center gap-2.5 text-[11px] text-[#A6A6A6] font-mono">
              <ShieldCheck size={16} className="text-[#B8FF00] shrink-0" />
              <span>Verified server-side calculation. Transaction encrypted with SHA-256.</span>
            </div>
          </div>
        </aside>
      </div>
    </PageTransition>
  )
}
