import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert,
  ShieldCheck,
  Package,
  Plus,
  Trash2,
  Edit3,
  TrendingUp,
  Layers,
  Check,
  X,
  AlertCircle,
  Clock,
  RefreshCw,
  Search,
  DollarSign,
  Users,
  Tag,
  Mail,
  AlertTriangle,
  Sliders,
  CheckCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { formatCurrency } from '../utils/formatters'
import PageTransition from '../components/motion/PageTransition'

export default function AdminPage() {
  const { user, isAdmin, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    lowStockCount: 0,
  })
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [coupons, setCoupons] = useState([])
  const [customers, setCustomers] = useState([])
  const [inquiries, setInquiries] = useState([])

  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState({ type: null, text: '' })
  const [searchQuery, setSearchQuery] = useState('')

  // Product Create/Edit Modal state
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    name: '',
    subtitle: '',
    department: 'Women',
    category: 'Tailoring',
    price: '',
    originalPrice: '',
    stock: 10,
    inStock: true,
    description: '',
    materials: '',
    image: '',
  })

  // Coupon Create Modal state
  const [couponModalOpen, setCouponModalOpen] = useState(false)
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: 15,
    minSpend: 0,
    maxDiscount: 1000,
  })

  // Load all admin data
  const refreshData = async () => {
    setLoading(true)
    try {
      const [statsRes, prodsRes, catsRes, ordsRes, coupRes, custRes, inqRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: {} })),
        api.get('/admin/products').catch(() => ({ data: [] })),
        api.get('/admin/categories').catch(() => ({ data: [] })),
        api.get('/admin/orders').catch(() => ({ data: [] })),
        api.get('/admin/coupons').catch(() => ({ data: [] })),
        api.get('/admin/customers').catch(() => ({ data: [] })),
        api.get('/admin/inquiries').catch(() => ({ data: [] })),
      ])

      const rawStats = statsRes?.data || statsRes || {}
      const rawProds = prodsRes?.data || prodsRes || []
      const rawCats = catsRes?.data || catsRes || []
      const rawOrds = ordsRes?.data || ordsRes || []
      const rawCoups = coupRes?.data || coupRes || []
      const rawCusts = custRes?.data || custRes || []
      const rawInqs = inqRes?.data || inqRes || []

      setProducts(Array.isArray(rawProds) ? rawProds : [])
      setCategories(Array.isArray(rawCats) ? rawCats : [])
      setOrders(Array.isArray(rawOrds) ? rawOrds : [])
      setCoupons(Array.isArray(rawCoups) ? rawCoups : [])
      setCustomers(Array.isArray(rawCusts) ? rawCusts : [])
      setInquiries(Array.isArray(rawInqs) ? rawInqs : [])

      // Calculate stats fallback if empty
      const calculatedRevenue = Array.isArray(rawOrds)
        ? rawOrds.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0)
        : 0
      const lowStock = Array.isArray(rawProds)
        ? rawProds.filter((p) => (p.stock || 0) < 5).length
        : 0

      setStats({
        totalRevenue: rawStats.totalRevenue ?? calculatedRevenue,
        totalOrders: rawStats.totalOrders ?? (Array.isArray(rawOrds) ? rawOrds.length : 0),
        activeProducts: rawStats.activeProducts ?? (Array.isArray(rawProds) ? rawProds.length : 0),
        lowStockCount: rawStats.lowStockCount ?? lowStock,
      })
    } catch (err) {
      console.error('[AdminPage] Data loading error:', err)
      setFeedback({ type: 'error', text: 'Error connecting to admin APIs.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      refreshData()
    }
  }, [isAdmin])

  // Guard: if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-28 text-center space-y-6 text-[#F5F5F5]">
        <ShieldAlert size={48} className="mx-auto text-[#8B0000]" />
        <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#8B0000]">RESTRICTED ACCESS</span>
        <h1 className="font-['Syne'] text-3xl sm:text-4xl uppercase font-bold">ADMIN CONSOLE PROTECTED</h1>
        <p className="text-xs text-[#A6A6A6] font-mono tracking-wider">
          This portal is reserved for authorized AUREVA curators and administrators.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3 bg-[#B8FF00] text-[#090909] font-['Oswald'] text-xs uppercase tracking-wider font-bold"
          >
            SIGN IN AS ADMIN
          </Link>
          <Link
            to="/"
            className="px-6 py-3 border border-[#292929] bg-[#111111] text-[#F5F5F5] font-['Oswald'] text-xs uppercase tracking-wider font-bold"
          >
            RETURN HOME
          </Link>
        </div>
      </div>
    )
  }

  // Handle Product Save
  const handleSaveProduct = async (e) => {
    e.preventDefault()
    try {
      const matchedCat = categories.find((c) => c.name?.toLowerCase() === productForm.category?.toLowerCase()) || categories[0]
      const payload = {
        name: productForm.name,
        subtitle: productForm.subtitle || '',
        department: productForm.department,
        category: productForm.category,
        categoryId: matchedCat?.id || 'cat-01',
        basePrice: parseFloat(productForm.price) || 0,
        price: parseFloat(productForm.price) || 0,
        comparisonPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
        stock: parseInt(productForm.stock, 10) || 10,
        inStock: productForm.inStock,
        isActive: productForm.inStock,
        description: productForm.description?.trim() || 'Exclusive AUREVA dark alternative piece tailored with premium fabrics and architectural drape.',
        materials: productForm.materials || '',
        images: productForm.image ? [productForm.image] : ['https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'],
      }

      if (editingProduct) {
        await api.patch(`/admin/products/${editingProduct.id}`, payload)
        setFeedback({ type: 'success', text: `Product "${productForm.name}" updated successfully.` })
      } else {
        await api.post('/admin/products', payload)
        setFeedback({ type: 'success', text: `Product "${productForm.name}" created successfully.` })
      }

      setProductModalOpen(false)
      setEditingProduct(null)
      refreshData()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Error saving product.' })
    }
  }

  // Handle Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Delete product "${name}" permanently?`)) return
    try {
      await api.delete(`/admin/products/${id}`)
      setFeedback({ type: 'success', text: `Product "${name}" deleted.` })
      refreshData()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Error deleting product.' })
    }
  }

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus })
      setFeedback({ type: 'success', text: `Order status updated to ${newStatus}.` })
      refreshData()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Error updating order status.' })
    }
  }

  // Handle Coupon Create
  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/coupons', {
        code: couponForm.code.toUpperCase().trim(),
        type: couponForm.type,
        value: parseFloat(couponForm.value),
        minSpend: parseFloat(couponForm.minSpend || 0),
        maxDiscount: parseFloat(couponForm.maxDiscount || 1000),
      })
      setFeedback({ type: 'success', text: `Coupon "${couponForm.code}" created.` })
      setCouponModalOpen(false)
      setCouponForm({ code: '', type: 'PERCENTAGE', value: 15, minSpend: 0, maxDiscount: 1000 })
      refreshData()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Error creating coupon.' })
    }
  }

  // Handle Delete Coupon
  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return
    try {
      await api.delete(`/admin/coupons/${id}`)
      setFeedback({ type: 'success', text: `Coupon "${code}" deleted.` })
      refreshData()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Error deleting coupon.' })
    }
  }

  // Handle Inquiry Status
  const handleToggleInquiryStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'RESOLVED' ? 'OPEN' : 'RESOLVED'
    try {
      await api.patch(`/admin/inquiries/${id}/status`, { status: nextStatus })
      setFeedback({ type: 'success', text: `Inquiry marked as ${nextStatus}.` })
      refreshData()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Error updating inquiry.' })
    }
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setProductForm({
      name: '',
      subtitle: '',
      department: 'Women',
      category: 'Tailoring',
      price: '',
      originalPrice: '',
      stock: 15,
      inStock: true,
      description: '',
      materials: '',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85',
    })
    setProductModalOpen(true)
  }

  const openEditModal = (p) => {
    setEditingProduct(p)
    setProductForm({
      name: p.name || '',
      subtitle: p.subtitle || '',
      department: p.department || 'Women',
      category: p.category || 'Tailoring',
      price: p.price || '',
      originalPrice: p.originalPrice || '',
      stock: p.stock ?? 10,
      inStock: p.inStock ?? true,
      description: p.description || '',
      materials: p.materials || '',
      image: p.images?.[0] || '',
    })
    setProductModalOpen(true)
  }

  const filteredProducts = products.filter((p) =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8 text-[#F5F5F5]">
      {/* Top Header */}
      <div className="border-b border-[#292929] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#B8FF00] block">
              AUREVA MANAGEMENT
            </span>
            <span className="px-2 py-0.5 text-[9px] uppercase font-mono tracking-widest bg-[#B8FF00] text-[#090909] font-bold">
              ADMINISTRATOR
            </span>
          </div>
          <h1 className="font-['Syne'] text-3xl sm:text-5xl uppercase font-extrabold tracking-wider text-[#F5F5F5] mt-1">
            EXECUTIVE DASHBOARD
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={refreshData}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs uppercase tracking-wider font-mono border border-[#292929] bg-[#171717] hover:border-[#B8FF00] hover:text-[#B8FF00] transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>SYNC DATA</span>
          </button>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-wider font-['Oswald'] font-bold bg-[#B8FF00] text-[#090909] hover:bg-[#cbfb27] transition-all"
          >
            <span>LIVE STORE</span>
          </Link>
        </div>
      </div>

      {/* Global Feedback Alert */}
      {feedback.text && (
        <div
          className={`p-3.5 border text-xs font-mono flex items-center justify-between ${
            feedback.type === 'success'
              ? 'border-[#B8FF00] bg-[#171717] text-[#B8FF00]'
              : 'border-[#8B0000] bg-[#171717] text-[#8B0000]'
          }`}
        >
          <span>{feedback.text}</span>
          <button type="button" onClick={() => setFeedback({ type: null, text: '' })}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#292929] pb-4">
        {[
          { id: 'dashboard', label: 'DASHBOARD', icon: TrendingUp },
          { id: 'products', label: 'PRODUCTS', icon: Package, count: products.length },
          { id: 'categories', label: 'CATEGORIES', icon: Layers, count: categories.length },
          { id: 'inventory', label: 'INVENTORY', icon: AlertTriangle, count: stats.lowStockCount },
          { id: 'orders', label: 'ORDERS', icon: CheckCircle, count: orders.length },
          { id: 'coupons', label: 'COUPONS', icon: Tag, count: coupons.length },
          { id: 'customers', label: 'CUSTOMERS', icon: Users, count: customers.length },
          { id: 'inquiries', label: 'CONTACT MESSAGES', icon: Mail, count: inquiries.length },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-['Oswald'] uppercase tracking-wider font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                isActive
                  ? 'bg-[#B8FF00] text-[#090909] border-[#B8FF00]'
                  : 'bg-[#111111] text-[#A6A6A6] border-[#292929] hover:text-[#F5F5F5] hover:border-[#A6A6A6]'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] font-mono ${isActive ? 'text-[#090909]' : 'text-[#A6A6A6]'}`}>
                  ({tab.count})
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* TAB: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Executive Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-[#171717] border border-[#292929] space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#A6A6A6] block">
                TOTAL REVENUE
              </span>
              <p className="font-mono text-2xl font-bold text-[#F5F5F5]">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-[10px] text-[#B8FF00] font-mono">Real-time ledger</p>
            </div>

            <div className="p-5 bg-[#171717] border border-[#292929] space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#A6A6A6] block">
                FULFILLED ORDERS
              </span>
              <p className="font-mono text-2xl font-bold text-[#F5F5F5]">
                {stats.totalOrders}
              </p>
              <p className="text-[10px] text-[#A6A6A6] font-mono">Dispatches archived</p>
            </div>

            <div className="p-5 bg-[#171717] border border-[#292929] space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#A6A6A6] block">
                ACTIVE PRODUCTS
              </span>
              <p className="font-mono text-2xl font-bold text-[#F5F5F5]">
                {stats.activeProducts}
              </p>
              <p className="text-[10px] text-[#A6A6A6] font-mono">In live catalog</p>
            </div>

            <div className="p-5 bg-[#171717] border border-[#292929] space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#A6A6A6] block">
                LOW STOCK SILHOUETTES
              </span>
              <p className="font-mono text-2xl font-bold text-[#8B0000]">
                {stats.lowStockCount}
              </p>
              <p className="text-[10px] text-[#8B0000] font-mono">Requires replenishment</p>
            </div>
          </div>

          {/* Quick Actions & Recent Orders Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-[#111111] p-6 border border-[#292929] space-y-4">
              <div className="flex items-center justify-between border-b border-[#292929] pb-3">
                <h3 className="font-['Oswald'] uppercase text-base font-bold text-[#F5F5F5]">
                  RECENT ORDER DISPATCHES
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-mono text-[#B8FF00] hover:underline"
                >
                  VIEW ALL ORDERS →
                </button>
              </div>

              {orders.slice(0, 5).map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 bg-[#171717] border border-[#292929] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                >
                  <div>
                    <span className="font-bold text-[#F5F5F5]">{ord.orderNumber || ord.id}</span>
                    <p className="text-[10px] text-[#A6A6A6]">
                      {ord.customerName} • {ord.city || 'Courier'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#B8FF00] font-bold">{formatCurrency(ord.totalAmount)}</span>
                    <span className="px-2 py-0.5 text-[9px] uppercase border border-[#292929] bg-[#111111] text-[#A6A6A6]">
                      {ord.status || 'PROCESSING'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-4 bg-[#111111] p-6 border border-[#292929] space-y-4">
              <h3 className="font-['Oswald'] uppercase text-base font-bold text-[#F5F5F5] border-b border-[#292929] pb-3">
                QUICK ADMIN ACTIONS
              </h3>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="w-full py-3 px-4 bg-[#B8FF00] text-[#090909] font-['Oswald'] text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 hover:bg-[#cbfb27] transition-all cursor-pointer"
                >
                  <Plus size={15} />
                  <span>ADD NEW PRODUCT</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCouponModalOpen(true)
                  }}
                  className="w-full py-3 px-4 border border-[#292929] bg-[#171717] text-[#F5F5F5] font-['Oswald'] text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 hover:border-[#B8FF00] hover:text-[#B8FF00] transition-all cursor-pointer"
                >
                  <Tag size={15} />
                  <span>CREATE PROMO COUPON</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('inquiries')}
                  className="w-full py-3 px-4 border border-[#292929] bg-[#171717] text-[#F5F5F5] font-['Oswald'] text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 hover:border-[#B8FF00] hover:text-[#B8FF00] transition-all cursor-pointer"
                >
                  <Mail size={15} />
                  <span>CHECK MESSAGES ({inquiries.filter((i) => i.status !== 'RESOLVED').length} NEW)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111111] border border-[#292929] pl-10 pr-4 py-2.5 text-xs text-[#F5F5F5] placeholder:text-[#A6A6A6]/50 focus:outline-none focus:border-[#B8FF00] font-mono"
              />
              <Search size={14} className="text-[#A6A6A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-[#B8FF00] text-[#090909] font-['Oswald'] text-xs uppercase tracking-wider font-bold flex items-center gap-2 hover:bg-[#cbfb27] transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus size={15} />
              <span>NEW PRODUCT</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="border border-[#292929] bg-[#111111] overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#171717] border-b border-[#292929] text-[10px] text-[#A6A6A6] uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">PRODUCT</th>
                  <th className="p-3.5">CATEGORY</th>
                  <th className="p-3.5">PRICE</th>
                  <th className="p-3.5">STOCK</th>
                  <th className="p-3.5">STATUS</th>
                  <th className="p-3.5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292929]">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#171717]/50 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'}
                        alt={p.name}
                        className="w-10 h-12 object-cover bg-[#171717] border border-[#292929]"
                      />
                      <div>
                        <span className="font-['Syne'] font-bold text-sm text-[#F5F5F5] uppercase block">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-[#A6A6A6]">{p.department || 'Alternative'}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-[#A6A6A6]">{p.category}</td>
                    <td className="p-3.5 text-[#F5F5F5] font-bold">{formatCurrency(p.price)}</td>
                    <td className="p-3.5">
                      <span className={p.stock < 5 ? 'text-[#8B0000] font-bold' : 'text-[#F5F5F5]'}>
                        {p.stock ?? 10} units
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 text-[9px] uppercase font-bold border ${
                          p.inStock
                            ? 'border-[#B8FF00]/40 text-[#B8FF00] bg-[#B8FF00]/10'
                            : 'border-[#8B0000]/40 text-[#8B0000] bg-[#8B0000]/10'
                        }`}
                      >
                        {p.inStock ? 'ACTIVE' : 'OUT OF STOCK'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="p-1.5 border border-[#292929] text-[#A6A6A6] hover:text-[#B8FF00] hover:border-[#B8FF00] transition-colors cursor-pointer"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 border border-[#292929] text-[#A6A6A6] hover:text-[#8B0000] hover:border-[#8B0000] transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="border-b border-[#292929] pb-3">
            <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5]">
              STOCK & INVENTORY MONITOR
            </h2>
            <p className="text-xs text-[#A6A6A6] font-mono mt-0.5">
              Identifies silhouettes with critical stock levels (&lt; 5 units).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products
              .filter((p) => (p.stock || 0) < 10)
              .map((p) => (
                <div key={p.id} className="p-4 bg-[#171717] border border-[#292929] space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.images?.[0] || ''}
                      alt={p.name}
                      className="w-12 h-14 object-cover bg-[#111111] border border-[#292929]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-['Syne'] text-xs uppercase font-bold text-[#F5F5F5] truncate">{p.name}</p>
                      <p className="text-[10px] text-[#A6A6A6] font-mono">{p.category}</p>
                      <span className="font-mono text-xs text-[#8B0000] font-bold block mt-1">
                        Stock: {p.stock} units
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditModal(p)}
                    className="w-full py-2 bg-[#111111] border border-[#292929] hover:border-[#B8FF00] hover:text-[#B8FF00] text-xs font-mono uppercase transition-colors"
                  >
                    ADJUST INVENTORY
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB: ORDERS FULFILLMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="border-b border-[#292929] pb-3">
            <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5]">
              ORDERS FULFILLMENT
            </h2>
          </div>

          <div className="space-y-4">
            {orders.map((ord) => (
              <div key={ord.id} className="p-5 bg-[#171717] border border-[#292929] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#292929] pb-3">
                  <div>
                    <span className="font-mono text-sm font-bold text-[#F5F5F5]">
                      {ord.orderNumber || ord.id}
                    </span>
                    <p className="text-xs text-[#A6A6A6] font-mono">
                      Customer: {ord.customerName} ({ord.customerEmail})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#B8FF00]">
                      {formatCurrency(ord.totalAmount)}
                    </span>
                    <select
                      value={ord.status || 'PROCESSING'}
                      onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                      className="bg-[#111111] border border-[#292929] text-xs font-mono text-[#F5F5F5] px-2.5 py-1.5 focus:outline-none focus:border-[#B8FF00]"
                    >
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="DISPATCHED">DISPATCHED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs text-[#A6A6A6] font-mono">
                  <span>Destination: {ord.address}, {ord.city}, {ord.state} {ord.postalCode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#292929] pb-3">
            <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5]">
              PROMO COUPONS & PRIVILEGES
            </h2>
            <button
              type="button"
              onClick={() => setCouponModalOpen(true)}
              className="px-4 py-2 bg-[#B8FF00] text-[#090909] font-['Oswald'] text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 hover:bg-[#cbfb27]"
            >
              <Plus size={14} />
              <span>CREATE COUPON</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {coupons.map((c) => (
              <div key={c.id} className="p-4 bg-[#171717] border border-[#292929] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-[#B8FF00] uppercase">{c.code}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCoupon(c.id, c.code)}
                    className="text-[#A6A6A6] hover:text-[#8B0000] p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="text-xs text-[#F5F5F5] font-mono">
                  {c.type === 'PERCENTAGE' ? `${c.value}% OFF` : `${formatCurrency(c.value)} OFF`}
                </p>
                <p className="text-[10px] text-[#A6A6A6] font-mono">Min spend: {formatCurrency(c.minSpend || 0)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="border-b border-[#292929] pb-3">
            <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5]">
              PATRON DIRECTORY
            </h2>
          </div>

          <div className="border border-[#292929] bg-[#111111] overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#171717] border-b border-[#292929] text-[10px] text-[#A6A6A6] uppercase">
                <tr>
                  <th className="p-3.5">NAME</th>
                  <th className="p-3.5">EMAIL</th>
                  <th className="p-3.5">ROLE</th>
                  <th className="p-3.5">JOINED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292929]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#171717]/50">
                    <td className="p-3.5 font-bold text-[#F5F5F5]">{c.name}</td>
                    <td className="p-3.5 text-[#A6A6A6]">{c.email}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 text-[9px] uppercase font-bold border ${c.role === 'ADMIN' ? 'border-[#B8FF00] text-[#B8FF00]' : 'border-[#292929] text-[#A6A6A6]'}`}>
                        {c.role || 'CUSTOMER'}
                      </span>
                    </td>
                    <td className="p-3.5 text-[#A6A6A6]">
                      {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: CONTACT MESSAGES */}
      {activeTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="border-b border-[#292929] pb-3">
            <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5]">
              CLIENT MESSAGES & INQUIRIES
            </h2>
          </div>

          <div className="space-y-4">
            {inquiries.length === 0 ? (
              <p className="text-xs text-[#A6A6A6] font-mono py-8 text-center">No concierge messages archived.</p>
            ) : (
              inquiries.map((inq) => (
                <div key={inq.id} className="p-5 bg-[#171717] border border-[#292929] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#292929] pb-3">
                    <div>
                      <span className="font-['Syne'] font-bold text-sm text-[#F5F5F5] uppercase block">
                        {inq.subject || 'Client Inquiry'}
                      </span>
                      <p className="text-xs text-[#A6A6A6] font-mono">
                        From: {inq.name} ({inq.email})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleInquiryStatus(inq.id, inq.status)}
                      className={`px-3 py-1 text-[10px] uppercase font-mono font-bold border transition-colors cursor-pointer ${
                        inq.status === 'RESOLVED'
                          ? 'border-[#B8FF00] text-[#B8FF00] bg-[#B8FF00]/10'
                          : 'border-[#292929] text-[#A6A6A6] bg-[#111111]'
                      }`}
                    >
                      {inq.status === 'RESOLVED' ? 'STATUS: RESOLVED' : 'STATUS: OPEN (CLICK TO RESOLVE)'}
                    </button>
                  </div>
                  <p className="text-xs text-[#A6A6A6] leading-relaxed font-sans">{inq.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      <AnimatePresence>
        {productModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#111111] border border-[#292929] p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-[#F5F5F5]"
            >
              <div className="flex items-center justify-between border-b border-[#292929] pb-4">
                <h3 className="font-['Oswald'] uppercase text-xl font-bold text-[#F5F5F5]">
                  {editingProduct ? 'EDIT SILHOUETTE' : 'CREATE NEW SILHOUETTE'}
                </h3>
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="text-[#A6A6A6] hover:text-[#F5F5F5]"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-mono text-[#A6A6A6]">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. Obsidian Leather Trench"
                      className="w-full bg-[#171717] border border-[#292929] p-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono text-[#A6A6A6]">Department *</label>
                    <select
                      value={productForm.department}
                      onChange={(e) => setProductForm({ ...productForm, department: e.target.value })}
                      className="w-full bg-[#171717] border border-[#292929] p-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
                    >
                      <option value="Women">Women</option>
                      <option value="Men">Men</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono text-[#A6A6A6]">Category *</label>
                    <input
                      type="text"
                      required
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      placeholder="e.g. Outerwear, Dresses, Hardware"
                      className="w-full bg-[#171717] border border-[#292929] p-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono text-[#A6A6A6]">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="4999"
                      className="w-full bg-[#171717] border border-[#292929] p-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono text-[#A6A6A6]">Original Price (₹)</label>
                    <input
                      type="number"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                      placeholder="6999 (if discounted)"
                      className="w-full bg-[#171717] border border-[#292929] p-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono text-[#A6A6A6]">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="w-full bg-[#171717] border border-[#292929] p-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono text-[#A6A6A6]">In Stock Status</label>
                    <select
                      value={productForm.inStock ? 'true' : 'false'}
                      onChange={(e) => setProductForm({ ...productForm, inStock: e.target.value === 'true' })}
                      className="w-full bg-[#171717] border border-[#292929] p-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
                    >
                      <option value="true">Active & In Stock</option>
                      <option value="false">Out of Stock</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-mono text-[#A6A6A6]">Primary Image URL *</label>
                    <input
                      type="url"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-[#171717] border border-[#292929] p-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-mono text-[#A6A6A6]">Description</label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full bg-[#171717] border border-[#292929] p-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-[#292929]">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-4 py-2 border border-[#292929] text-xs font-mono text-[#A6A6A6] hover:text-[#F5F5F5]"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#B8FF00] text-[#090909] font-['Oswald'] text-xs uppercase tracking-wider font-bold hover:bg-[#cbfb27]"
                  >
                    SAVE SILHOUETTE
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COUPON MODAL */}
      <AnimatePresence>
        {couponModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#111111] border border-[#292929] p-6 space-y-5 text-[#F5F5F5]"
            >
              <div className="flex items-center justify-between border-b border-[#292929] pb-3">
                <h3 className="font-['Oswald'] uppercase text-lg font-bold text-[#F5F5F5]">
                  CREATE PROMO COUPON
                </h3>
                <button type="button" onClick={() => setCouponModalOpen(false)} className="text-[#A6A6A6]">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-4 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-[#A6A6A6]">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. DARKWEAR20"
                    className="w-full bg-[#171717] border border-[#292929] p-2.5 text-xs text-[#F5F5F5] uppercase focus:outline-none focus:border-[#B8FF00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-[#A6A6A6]">Type *</label>
                    <select
                      value={couponForm.type}
                      onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                      className="w-full bg-[#171717] border border-[#292929] p-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-[#A6A6A6]">Value *</label>
                    <input
                      type="number"
                      required
                      value={couponForm.value}
                      onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                      className="w-full bg-[#171717] border border-[#292929] p-2.5 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-[#292929]">
                  <button
                    type="button"
                    onClick={() => setCouponModalOpen(false)}
                    className="px-4 py-2 border border-[#292929] text-[#A6A6A6]"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#B8FF00] text-[#090909] font-['Oswald'] uppercase font-bold"
                  >
                    ACTIVATE COUPON
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
