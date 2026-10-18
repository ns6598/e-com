import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  Sliders,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import orderService from '../services/orderService'
import { formatCurrency } from '../utils/formatters'
import PageTransition from '../components/motion/PageTransition'

export default function AccountPage() {
  const { user, loading, logout, updateProfile, isAdmin } = useAuth()
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [feedback, setFeedback] = useState({ type: null, text: '' })

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    postalCode: user?.postalCode || '',
  })

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        postalCode: user.postalCode || '',
      })
    }
  }, [user])

  // Fetch orders
  useEffect(() => {
    let isMounted = true

    async function loadOrders() {
      if (!user) return
      try {
        setLoadingOrders(true)
        const orderData = await orderService.getOrders()
        if (isMounted && Array.isArray(orderData)) {
          setOrders(orderData)
          return
        }
      } catch (err) {
        console.warn('[AccountPage] Orders API note:', err.message)
      } finally {
        if (isMounted) setLoadingOrders(false)
      }
    }

    loadOrders()
    return () => {
      isMounted = false
    }
  }, [user])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setFeedback({ type: null, text: '' })

    const res = await updateProfile(profileForm)
    setProfileSaving(false)

    if (res.success) {
      setFeedback({ type: 'success', text: 'Account details successfully saved.' })
      setTimeout(() => setFeedback({ type: null, text: '' }), 4000)
    } else {
      setFeedback({ type: 'error', text: res.message || 'Could not update profile.' })
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'border-[#B8FF00] text-[#B8FF00] bg-[#B8FF00]/10'
      case 'DISPATCHED':
        return 'border-sky-400 text-sky-400 bg-sky-400/10'
      case 'PROCESSING':
        return 'border-[#A6A6A6] text-[#F5F5F5] bg-[#292929]'
      case 'CANCELLED':
        return 'border-[#8B0000] text-[#8B0000] bg-[#8B0000]/10'
      default:
        return 'border-[#292929] text-[#A6A6A6] bg-[#111111]'
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-28 text-center text-[#F5F5F5] space-y-4">
        <div className="h-8 w-8 border-2 border-[#B8FF00] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-mono text-xs uppercase tracking-widest text-[#A6A6A6]">AUTHENTICATING PATRON SESSION...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-28 text-center text-[#F5F5F5] space-y-6">
        <div className="p-4 rounded-full bg-[#171717] border border-[#292929] inline-flex">
          <User size={40} className="text-[#B8FF00]" />
        </div>
        <h1 className="font-['Syne'] text-3xl font-bold uppercase">PATRON LOGIN REQUIRED</h1>
        <p className="text-xs text-[#A6A6A6] font-mono leading-relaxed">
          Sign in to view your orders, saved darkwear wishlist, and delivery addresses.
        </p>
        <div className="pt-2">
          <Link
            to="/login"
            state={{ from: '/account' }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#B8FF00] text-[#090909] font-['Oswald'] text-xs uppercase tracking-widest font-bold"
          >
            SIGN IN TO ACCOUNT
          </Link>
        </div>
      </div>
    )
  }

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 text-[#F5F5F5]">
      {/* Header */}
      <div className="border-b border-[#292929] pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#B8FF00] block">
              AUREVA PATRON DOSSIER
            </span>
            {isAdmin && (
              <span className="px-2 py-0.5 text-[9px] uppercase font-mono tracking-widest bg-[#B8FF00] text-[#090909] font-bold">
                ADMIN ACCESS
              </span>
            )}
          </div>
          <h1 className="font-['Syne'] text-3xl sm:text-5xl font-extrabold uppercase text-[#F5F5F5] mt-1">
            {user?.name || 'PATRON ACCOUNT'}
          </h1>
          <p className="text-xs text-[#A6A6A6] font-mono tracking-wider mt-1">
            {user?.email} • MEMBER SINCE {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider font-['Oswald'] font-bold bg-[#B8FF00] text-[#090909] hover:bg-[#cbfb27] transition-all cursor-pointer"
            >
              <Sliders size={14} />
              <span>ADMIN DASHBOARD</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider font-mono border border-[#292929] bg-[#171717] hover:border-[#8B0000] hover:text-[#8B0000] transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>SIGN OUT</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Tab Buttons */}
        <aside className="lg:col-span-3 space-y-2">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left p-3.5 text-xs uppercase tracking-wider font-['Oswald'] border transition-all cursor-pointer flex items-center justify-between ${
              activeTab === 'orders'
                ? 'bg-[#B8FF00] text-[#090909] font-bold border-[#B8FF00]'
                : 'border-[#292929] text-[#A6A6A6] hover:text-[#F5F5F5] bg-[#111111]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Package size={15} />
              <span>ORDERS</span>
            </span>
            <span className="font-mono text-[10px]">({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left p-3.5 text-xs uppercase tracking-wider font-['Oswald'] border transition-all cursor-pointer flex items-center justify-between ${
              activeTab === 'profile'
                ? 'bg-[#B8FF00] text-[#090909] font-bold border-[#B8FF00]'
                : 'border-[#292929] text-[#A6A6A6] hover:text-[#F5F5F5] bg-[#111111]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <User size={15} />
              <span>PROFILE</span>
            </span>
            <ChevronRight size={14} className="opacity-60" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left p-3.5 text-xs uppercase tracking-wider font-['Oswald'] border transition-all cursor-pointer flex items-center justify-between ${
              activeTab === 'addresses'
                ? 'bg-[#B8FF00] text-[#090909] font-bold border-[#B8FF00]'
                : 'border-[#292929] text-[#A6A6A6] hover:text-[#F5F5F5] bg-[#111111]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <MapPin size={15} />
              <span>ADDRESSES</span>
            </span>
            <ChevronRight size={14} className="opacity-60" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`w-full text-left p-3.5 text-xs uppercase tracking-wider font-['Oswald'] border transition-all cursor-pointer flex items-center justify-between ${
              activeTab === 'wishlist'
                ? 'bg-[#B8FF00] text-[#090909] font-bold border-[#B8FF00]'
                : 'border-[#292929] text-[#A6A6A6] hover:text-[#F5F5F5] bg-[#111111]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Heart size={15} />
              <span>WISHLIST</span>
            </span>
            <span className="font-mono text-[10px]">({wishlist.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left p-3.5 text-xs uppercase tracking-wider font-['Oswald'] border transition-all cursor-pointer flex items-center justify-between ${
              activeTab === 'settings'
                ? 'bg-[#B8FF00] text-[#090909] font-bold border-[#B8FF00]'
                : 'border-[#292929] text-[#A6A6A6] hover:text-[#F5F5F5] bg-[#111111]'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Settings size={15} />
              <span>SETTINGS</span>
            </span>
            <ChevronRight size={14} className="opacity-60" />
          </button>

          {isAdmin && (
            <Link
              to="/admin"
              className="w-full text-left p-3.5 text-xs uppercase tracking-wider font-['Oswald'] border border-[#B8FF00]/40 bg-[#171717] text-[#B8FF00] hover:bg-[#202020] transition-all flex items-center justify-between mt-4"
            >
              <span className="flex items-center gap-2.5">
                <Sliders size={15} />
                <span>ADMIN CONSOLE</span>
              </span>
              <ExternalLink size={13} />
            </Link>
          )}
        </aside>

        {/* Right Tab Content */}
        <div className="lg:col-span-9">
          {/* TAB 1: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#292929] pb-3">
                <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5]">
                  ORDER HISTORY
                </h2>
                <span className="text-xs font-mono text-[#A6A6A6]">
                  {orders.length} {orders.length === 1 ? 'ORDER' : 'ORDERS'}
                </span>
              </div>

              {loadingOrders ? (
                <div className="py-16 text-center text-[#A6A6A6] font-mono text-xs">
                  <div className="h-6 w-6 border-2 border-[#B8FF00] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>RETRIEVING ORDER DISPATCHES...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 bg-[#111111] border border-[#292929] text-center space-y-4">
                  <Package size={36} className="text-[#A6A6A6] mx-auto stroke-[1.2]" />
                  <p className="font-['Syne'] text-base uppercase font-bold text-[#F5F5F5]">NO ORDERS ARCHIVED</p>
                  <p className="text-xs text-[#A6A6A6] font-mono max-w-sm mx-auto">
                    You have not placed any orders yet. Discover our latest alternative drops.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-block px-5 py-2.5 bg-[#B8FF00] text-[#090909] font-['Oswald'] text-xs uppercase tracking-wider font-bold"
                  >
                    EXPLORE SHOP
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 bg-[#171717] border border-[#292929] space-y-4 hover:border-[#B8FF00]/40 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#292929] pb-3">
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-bold text-[#F5F5F5]">
                            {ord.orderNumber || ord.id}
                          </span>
                          <p className="text-[10px] text-[#A6A6A6] font-mono">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border font-bold ${getStatusBadge(
                              ord.status
                            )}`}
                          >
                            {ord.status || 'PROCESSING'}
                          </span>
                          <span className="font-mono text-sm font-bold text-[#F5F5F5]">
                            {formatCurrency(ord.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-[#292929]">
                        {ord.items?.map((item, idx) => (
                          <div key={idx} className="py-2.5 flex items-center gap-3">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-12 object-cover bg-[#111111] border border-[#292929]"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-['Syne'] uppercase text-xs font-bold text-[#F5F5F5] truncate">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-[#A6A6A6] font-mono">
                                {item.size && `Size ${item.size}`} {item.color && `• ${item.color}`} • Qty {item.quantity}
                              </p>
                            </div>
                            <span className="font-mono text-xs text-[#F5F5F5]">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-[#292929] pt-2 flex items-center justify-between text-[11px] text-[#A6A6A6] font-mono">
                        <span>Destination: {ord.city || 'Standard Address'}</span>
                        <Link
                          to={`/order-confirmation/${ord.orderNumber || ord.id}`}
                          state={{ order: ord }}
                          className="text-[#B8FF00] hover:underline uppercase text-[10px]"
                        >
                          VIEW RECEIPT →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="border-b border-[#292929] pb-3">
                <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5]">
                  PATRON PROFILE
                </h2>
              </div>

              {feedback.text && (
                <div
                  className={`p-3.5 border text-xs font-mono ${
                    feedback.type === 'success'
                      ? 'border-[#B8FF00] bg-[#171717] text-[#B8FF00]'
                      : 'border-[#8B0000] bg-[#171717] text-[#8B0000]'
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4 bg-[#111111] p-6 border border-[#292929]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full bg-[#171717] border border-[#292929] p-3 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00] font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-[#171717] border border-[#292929] p-3 text-xs text-[#A6A6A6] font-mono opacity-60 cursor-not-allowed"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono">
                      PHONE NUMBER
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#171717] border border-[#292929] p-3 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00] font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-6 py-3 bg-[#B8FF00] text-[#090909] font-['Oswald'] text-xs uppercase tracking-wider font-bold hover:bg-[#cbfb27] transition-all cursor-pointer"
                  >
                    {profileSaving ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="border-b border-[#292929] pb-3">
                <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5]">
                  SHIPPING ADDRESSES
                </h2>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4 bg-[#111111] p-6 border border-[#292929]">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono">
                    STREET ADDRESS
                  </label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="e.g. 4B Gothic Quarter, Main Avenue"
                    className="w-full bg-[#171717] border border-[#292929] p-3 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00] font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono">
                      CITY
                    </label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      placeholder="Mumbai"
                      className="w-full bg-[#171717] border border-[#292929] p-3 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00] font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono">
                      STATE
                    </label>
                    <input
                      type="text"
                      value={profileForm.state}
                      onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                      placeholder="Maharashtra"
                      className="w-full bg-[#171717] border border-[#292929] p-3 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00] font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono">
                      POSTAL CODE
                    </label>
                    <input
                      type="text"
                      value={profileForm.postalCode}
                      onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                      placeholder="400001"
                      className="w-full bg-[#171717] border border-[#292929] p-3 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00] font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-6 py-3 bg-[#B8FF00] text-[#090909] font-['Oswald'] text-xs uppercase tracking-wider font-bold hover:bg-[#cbfb27] transition-all cursor-pointer"
                  >
                    {profileSaving ? 'SAVING...' : 'UPDATE ADDRESS'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#292929] pb-3">
                <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5]">
                  SAVED WISHLIST
                </h2>
                <span className="text-xs font-mono text-[#A6A6A6]">
                  {wishlist.length} {wishlist.length === 1 ? 'ITEM' : 'ITEMS'}
                </span>
              </div>

              {wishlist.length === 0 ? (
                <div className="p-8 bg-[#111111] border border-[#292929] text-center space-y-4">
                  <Heart size={36} className="text-[#A6A6A6] mx-auto stroke-[1.2]" />
                  <p className="font-['Syne'] text-base uppercase font-bold text-[#F5F5F5]">WISHLIST IS EMPTY</p>
                  <p className="text-xs text-[#A6A6A6] font-mono max-w-sm mx-auto">
                    Save products to your wishlist while browsing to track stock and sales.
                  </p>
                  <Link
                    to="/shop"
                    className="inline-block px-5 py-2.5 bg-[#B8FF00] text-[#090909] font-['Oswald'] text-xs uppercase tracking-wider font-bold"
                  >
                    DISCOVER PRODUCTS
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {wishlist.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#171717] border border-[#292929] p-3 flex flex-col justify-between group"
                    >
                      <Link to={`/product/${item.id}`} className="aspect-[3/4] overflow-hidden bg-[#111111] relative block mb-3">
                        <img
                          src={item.images ? item.images[0] : ''}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-widest text-[#B8FF00] font-mono block">
                          {item.category}
                        </span>
                        <Link
                          to={`/product/${item.id}`}
                          className="font-['Syne'] text-sm uppercase font-bold text-[#F5F5F5] hover:text-[#B8FF00] line-clamp-1 block"
                        >
                          {item.name}
                        </Link>
                        <span className="font-mono text-xs font-bold text-[#F5F5F5] block">
                          {formatCurrency(item.price)}
                        </span>

                        <div className="pt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => addToCart(item, item.sizes?.[0] || 'M', item.colors?.[0] || 'Black', 1)}
                            className="flex-1 py-2 bg-[#B8FF00] hover:bg-[#cbfb27] text-[#090909] font-['Oswald'] text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingBag size={13} />
                            <span>ADD TO BAG</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromWishlist(item.id)}
                            aria-label="Remove item from wishlist"
                            className="p-2 border border-[#292929] text-[#A6A6A6] hover:text-[#8B0000] cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="border-b border-[#292929] pb-3">
                <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5]">
                  ACCOUNT SETTINGS
                </h2>
              </div>

              <div className="p-6 bg-[#111111] border border-[#292929] space-y-5">
                <div>
                  <h3 className="font-['Oswald'] uppercase text-sm font-bold text-[#F5F5F5]">SECURITY & CREDENTIALS</h3>
                  <p className="text-xs text-[#A6A6A6] font-mono mt-1">
                    Your password is encrypted using high-cost bcrypt hashing. Session tokens are protected via secure HTTP-only cookies.
                  </p>
                </div>

                <div className="border-t border-[#292929] pt-4">
                  <h3 className="font-['Oswald'] uppercase text-sm font-bold text-[#F5F5F5]">ORDER NOTIFICATIONS</h3>
                  <p className="text-xs text-[#A6A6A6] font-mono mt-1">
                    Automated courier notifications are dispatched to <strong>{user?.email}</strong>.
                  </p>
                </div>

                <div className="border-t border-[#292929] pt-4">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-5 py-2.5 border border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white font-['Oswald'] text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
                  >
                    SIGN OUT OF ALL SESSIONS
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
