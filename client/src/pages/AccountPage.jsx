import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User,
  Package,
  MapPin,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle,
  Truck,
  RotateCcw,
  Sliders,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { formatCurrency } from '../utils/formatters'
import Button from '../components/ui/Button'
import PageTransition from '../components/motion/PageTransition'

export default function AccountPage() {
  const { user, logout, updateProfile, isAdmin } = useAuth()
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

  // Synchronize form when user loads
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

  // Fetch orders from API with fallback to local storage
  useEffect(() => {
    let isMounted = true

    async function loadOrders() {
      try {
        setLoadingOrders(true)
        const res = await api.get('/orders')
        if (isMounted && res.success && Array.isArray(res.data)) {
          setOrders(res.data)
          return
        }
      } catch (err) {
        console.warn('[AccountPage] Orders API note: checking local orders fallback', err.message)
      }

      // Fallback to local storage orders
      try {
        const local = localStorage.getItem('aureva_orders')
        if (local && isMounted) {
          const parsed = JSON.parse(local)
          setOrders(parsed)
        }
      } catch {
        // Handled
      } finally {
        if (isMounted) setLoadingOrders(false)
      }
    }

    loadOrders()
    return () => {
      isMounted = false
    }
  }, [])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setFeedback({ type: null, text: '' })

    const res = await updateProfile(profileForm)
    setProfileSaving(false)

    if (res.success) {
      setFeedback({ type: 'success', text: 'Patron preferences successfully archived.' })
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
        return 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
      case 'DISPATCHED':
        return 'border-sky-500/40 text-sky-300 bg-sky-500/10'
      case 'PROCESSING':
        return 'border-[#D4AF37]/50 text-[#D4AF37] bg-[#D4AF37]/10'
      case 'CANCELLED':
        return 'border-red-500/40 text-red-300 bg-red-500/10'
      default:
        return 'border-white/20 text-gray-300 bg-white/5'
    }
  }

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10 text-white">
      {/* Editorial Header */}
      <div className="border-b border-white/10 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="tag-overline text-[#D4AF37] font-mono">SALON DOSSIER</span>
            {isAdmin && (
              <span className="px-2.5 py-0.5 text-[9px] uppercase font-mono tracking-widest gold-gradient-bg text-[#08090D] font-bold">
                Curator Admin
              </span>
            )}
          </div>
          <h1 className="editorial-title text-3xl sm:text-5xl font-serif text-white mt-1">
            {user?.name || 'Patron Account'}
          </h1>
          <p className="text-xs text-gray-400 font-mono tracking-wider mt-1">
            {user?.email} • Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider font-mono font-semibold gold-gradient-bg text-[#08090D] hover:opacity-90 transition-opacity shadow-md cursor-pointer"
            >
              <Sliders size={14} />
              <span>Admin Management</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider font-mono border border-white/20 hover:border-red-500/60 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
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
            className={`w-full text-left p-3.5 text-xs uppercase tracking-wider font-mono border transition-all cursor-pointer flex items-center justify-between ${
              activeTab === 'orders'
                ? 'gold-gradient-bg text-[#08090D] font-bold border-[#D4AF37]'
                : 'border-white/10 text-gray-300 hover:border-white/30 bg-white/5'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Package size={15} />
              <span>Order Archives</span>
            </span>
            <span className="text-[10px] opacity-80">({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left p-3.5 text-xs uppercase tracking-wider font-mono border transition-all cursor-pointer flex items-center justify-between ${
              activeTab === 'profile'
                ? 'gold-gradient-bg text-[#08090D] font-bold border-[#D4AF37]'
                : 'border-white/10 text-gray-300 hover:border-white/30 bg-white/5'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <User size={15} />
              <span>Patron Preferences</span>
            </span>
            <ChevronRight size={14} className="opacity-60" />
          </button>

          {isAdmin && (
            <Link
              to="/admin"
              className="w-full text-left p-3.5 text-xs uppercase tracking-wider font-mono border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all flex items-center justify-between mt-4"
            >
              <span className="flex items-center gap-2.5">
                <ShieldCheck size={15} />
                <span>Atelier Curator Console</span>
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
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="font-serif text-2xl text-white">Acquisition History</h2>
                <span className="text-xs font-mono text-gray-400">
                  {orders.length} Monograph {orders.length === 1 ? 'Dispatch' : 'Dispatches'}
                </span>
              </div>

              {loadingOrders ? (
                <div className="p-12 text-center text-xs font-mono text-gray-400">
                  Querying atelier archives...
                </div>
              ) : orders.length === 0 ? (
                <div className="glass-panel p-10 text-center space-y-4 border-white/10 bg-[#0E1018]/80">
                  <Package size={36} className="mx-auto text-gray-600 stroke-[1.2]" />
                  <p className="font-serif text-xl text-gray-300">No archival orders on record</p>
                  <p className="text-xs font-mono text-gray-500 max-w-sm mx-auto">
                    Your salon history will preserve all confirmed acquisitions and dispatch statuses.
                  </p>
                  <div className="pt-2">
                    <Button variant="primary" size="md" to="/shop">
                      Explore Repertoire
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.orderNumber || ord.id}
                      className="glass-panel p-5 sm:p-6 border-white/10 bg-[#0E1018]/90 hover:border-white/20 transition-colors space-y-4 rounded-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <div className="space-y-0.5">
                          <span className="font-mono text-sm font-semibold text-[#D4AF37]">
                            {ord.orderNumber || ord.id}
                          </span>
                          <p className="text-[11px] font-mono text-gray-400">
                            Placed on {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest border rounded-xs ${getStatusBadge(
                              ord.status
                            )}`}
                          >
                            {ord.status || 'PENDING'}
                          </span>
                          <span className="font-serif text-lg font-light text-white">
                            {formatCurrency(ord.total)}
                          </span>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-2">
                        {ord.items &&
                          ord.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs font-mono py-1 border-b border-white/5 last:border-0"
                            >
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-10 h-12 object-cover border border-white/10"
                                  />
                                )}
                                <div>
                                  <p className="text-white font-medium">{item.name}</p>
                                  <p className="text-[10px] text-gray-400">
                                    Qty: {item.quantity} {item.size && `• Size: ${item.size}`}{' '}
                                    {item.color && `• Hue: ${item.color}`}
                                  </p>
                                </div>
                              </div>
                              <span className="text-gray-300">{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                          ))}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-gray-400 border-t border-white/5">
                        <span>Courier: White-Glove Dispatch Protocol</span>
                        <Link
                          to={`/order-confirmation/${ord.orderNumber || ord.id}`}
                          state={{ order: ord }}
                          className="text-[#D4AF37] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <span>Full Monograph Receipt</span>
                          <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE PREFERENCES */}
          {activeTab === 'profile' && (
            <div className="glass-panel p-6 sm:p-8 border-white/10 bg-[#0E1018]/90 space-y-6 rounded-xs">
              <div className="border-b border-white/10 pb-3">
                <h2 className="font-serif text-2xl text-white">Patron Delivery & Dossier</h2>
                <p className="text-xs font-mono text-gray-400 mt-1">
                  Saved coordinates are automatically applied during bespoke checkout.
                </p>
              </div>

              {feedback.text && (
                <div
                  className={`p-3 text-xs font-mono border ${
                    feedback.type === 'success'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-red-500/40 bg-red-500/10 text-red-300'
                  }`}
                >
                  {feedback.text}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider font-mono text-gray-300">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                      className="w-full bg-[#141724] border border-white/15 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider font-mono text-gray-300">
                      Primary Contact Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#141724] border border-white/15 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider font-mono text-gray-300">
                    Bespoke Courier Delivery Address
                  </label>
                  <input
                    type="text"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    placeholder="Apartment, Studio, Suite, Street"
                    className="w-full bg-[#141724] border border-white/15 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider font-mono text-gray-300">
                      City
                    </label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full bg-[#141724] border border-white/15 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider font-mono text-gray-300">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={profileForm.state}
                      onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                      className="w-full bg-[#141724] border border-white/15 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider font-mono text-gray-300">
                      Postal Code / PIN
                    </label>
                    <input
                      type="text"
                      value={profileForm.postalCode}
                      onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                      className="w-full bg-[#141724] border border-white/15 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    disabled={profileSaving}
                  >
                    {profileSaving ? 'Saving Preferences...' : 'Archive Preferences'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
