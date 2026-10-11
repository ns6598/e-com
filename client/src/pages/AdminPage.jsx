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
  Filter,
  DollarSign,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import productService from '../services/productService'
import { formatCurrency } from '../utils/formatters'
import Button from '../components/ui/Button'
import PageTransition from '../components/motion/PageTransition'

export default function AdminPage() {
  const { user, isAdmin, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState({ type: null, text: '' })

  // Product Create/Edit Modal state
  const [modalOpen, setModalOpen] = useState(false)
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

  // Load products and orders
  const refreshData = async () => {
    setLoading(true)
    try {
      const [prods, ordsRes] = await Promise.all([
        productService.getAll(),
        api.get('/orders').catch(() => ({ data: [] })),
      ])
      setProducts(prods || [])
      setOrders(ordsRes.data || [])
    } catch (err) {
      console.error('[AdminPage] Data loading error:', err)
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
      <div className="max-w-xl mx-auto px-4 py-28 text-center space-y-6 text-white">
        <ShieldAlert size={48} className="mx-auto text-[#6D202D]" />
        <span className="tag-overline text-[#6D202D] font-mono">RESTRICTED ACCESS</span>
        <h1 className="editorial-title text-3xl sm:text-4xl font-serif">Curator Privileges Required</h1>
        <p className="text-xs text-gray-400 font-mono tracking-wider">
          This portal is reserved for authorized AUREVA curators and salon administrators.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Button variant="primary" size="md" to="/login">
            Sign In with Curator Credentials
          </Button>
          <Button variant="outline" size="md" to="/">
            Return to Storefront
          </Button>
        </div>
      </div>
    )
  }

  const handleOpenCreateModal = () => {
    setEditingProduct(null)
    setProductForm({
      name: '',
      subtitle: '',
      department: 'Women',
      category: 'Tailoring',
      price: '',
      originalPrice: '',
      stock: 12,
      inStock: true,
      description: '',
      materials: '',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
    })
    setModalOpen(true)
  }

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod)
    setProductForm({
      name: prod.name,
      subtitle: prod.subtitle || '',
      department: prod.department || 'Women',
      category: prod.category || 'Tailoring',
      price: prod.price,
      originalPrice: prod.originalPrice || '',
      stock: prod.stock !== undefined ? prod.stock : 10,
      inStock: prod.inStock !== false,
      description: prod.description || '',
      materials: prod.materials || '',
      image: prod.images?.[0] || '',
    })
    setModalOpen(true)
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    setFeedback({ type: null, text: '' })

    const payload = {
      name: productForm.name.trim(),
      subtitle: productForm.subtitle.trim(),
      department: productForm.department,
      category: productForm.category,
      price: parseFloat(productForm.price),
      originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
      stock: parseInt(productForm.stock, 10),
      inStock: Boolean(productForm.inStock),
      description: productForm.description.trim(),
      materials: productForm.materials.trim(),
      images: productForm.image ? [productForm.image] : [],
    }

    try {
      if (editingProduct) {
        // Update product
        const res = await api.put(`/products/${editingProduct.id}`, payload)
        if (res.success) {
          setFeedback({ type: 'success', text: `Silhouette '${payload.name}' updated successfully.` })
        }
      } else {
        // Create product
        const res = await api.post('/products', payload)
        if (res.success) {
          setFeedback({ type: 'success', text: `New silhouette '${payload.name}' added to repertoire.` })
        }
      }
      setModalOpen(false)
      await refreshData()
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Operation failed' })
    }
  }

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you certain you wish to retire silhouette '${name}' from active catalog?`)) {
      return
    }

    try {
      const res = await api.delete(`/products/${id}`)
      if (res.success) {
        setFeedback({ type: 'success', text: `Silhouette '${name}' retired.` })
        await refreshData()
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Deletion failed' })
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus })
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, status: newStatus } : o))
        )
        setFeedback({ type: 'success', text: `Order status upgraded to ${newStatus}.` })
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Could not update order status.' })
    }
  }

  // Calculated Stats
  const totalGrossVolume = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const lowStockCount = products.filter((p) => (p.stock || 0) < 5).length

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 text-white">
      {/* Top Banner */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="tag-overline text-[#D4AF37] font-mono">CONCIERGE BACKOFFICE</span>
            <span className="px-2 py-0.5 text-[9px] uppercase font-mono tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Live REST API
            </span>
          </div>
          <h1 className="editorial-title text-3xl sm:text-5xl font-serif text-white mt-1">
            Atelier Management Console
          </h1>
          <p className="text-xs text-gray-400 font-mono tracking-wider mt-1">
            Curator: {user.name} ({user.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={refreshData}
            disabled={loading}
            className="p-2.5 border border-white/20 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors cursor-pointer text-xs font-mono flex items-center gap-1.5"
            title="Refresh database records"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
            <Plus size={14} className="mr-1.5" />
            <span>Induct Silhouette</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 border-white/10 bg-[#0E1018]/90 rounded-xs space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 block">
            Catalog Silhouettes
          </span>
          <p className="font-serif text-3xl text-white">{products.length}</p>
          <span className="text-[10px] font-mono text-emerald-400">Active ready-to-wear</span>
        </div>

        <div className="glass-panel p-5 border-white/10 bg-[#0E1018]/90 rounded-xs space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 block">
            Archival Orders
          </span>
          <p className="font-serif text-3xl text-[#D4AF37]">{orders.length}</p>
          <span className="text-[10px] font-mono text-gray-400">Acquisitions recorded</span>
        </div>

        <div className="glass-panel p-5 border-white/10 bg-[#0E1018]/90 rounded-xs space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 block">
            Gross Repertoire Volume
          </span>
          <p className="font-serif text-2xl sm:text-3xl text-white">
            {formatCurrency(totalGrossVolume)}
          </p>
          <span className="text-[10px] font-mono text-[#D4AF37]">All dispatched units</span>
        </div>

        <div className="glass-panel p-5 border-white/10 bg-[#0E1018]/90 rounded-xs space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-widest text-gray-400 block">
            Stock Allocations
          </span>
          <p className="font-serif text-3xl text-white">{lowStockCount}</p>
          <span className="text-[10px] font-mono text-amber-400">Silhouettes under 5 units</span>
        </div>
      </div>

      {/* Operational Feedback */}
      {feedback.text && (
        <div
          className={`p-3 text-xs font-mono border rounded-xs ${
            feedback.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/40 bg-red-500/10 text-red-300'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'border-b-2 border-[#D4AF37] text-[#D4AF37] font-bold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Silhouettes & Stock ({products.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'border-b-2 border-[#D4AF37] text-[#D4AF37] font-bold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Orders & Dispatch Protocols ({orders.length})
        </button>
      </div>

      {/* TAB 1: PRODUCTS TABLE */}
      {activeTab === 'products' && (
        <div className="glass-panel border-white/10 bg-[#0E1018]/90 rounded-xs overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#141724] border-b border-white/10 text-[10px] text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="p-3.5">Piece</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Stock Allocation</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      {prod.images?.[0] ? (
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-10 h-12 object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-12 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <Package size={14} className="text-gray-500" />
                        </div>
                      )}
                      <div>
                        <Link
                          to={`/product/${prod.id}`}
                          className="font-semibold text-white hover:text-[#D4AF37] transition-colors"
                        >
                          {prod.name}
                        </Link>
                        <p className="text-[10px] text-gray-400 font-mono">{prod.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-gray-300">{prod.department}</td>
                  <td className="p-3.5 text-gray-300">{prod.category}</td>
                  <td className="p-3.5 text-white font-semibold">{formatCurrency(prod.price)}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] border ${
                        (prod.stock || 0) <= 2
                          ? 'border-red-500/40 text-red-300 bg-red-500/10'
                          : 'border-white/15 text-gray-300'
                      }`}
                    >
                      {prod.stock !== undefined ? `${prod.stock} units` : '10 units'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 text-[9px] uppercase tracking-wider ${
                        prod.inStock !== false
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                          : 'text-red-400 bg-red-500/10 border border-red-500/30'
                      }`}
                    >
                      {prod.inStock !== false ? 'In Atelier' : 'Sold Out'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(prod)}
                      className="p-1.5 border border-white/15 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors cursor-pointer"
                      title="Edit silhouette details"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                      className="p-1.5 border border-white/15 hover:border-red-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Decommission piece"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="glass-panel p-8 text-center text-xs font-mono text-gray-400">
              No acquisitions recorded yet.
            </div>
          ) : (
            <div className="glass-panel border-white/10 bg-[#0E1018]/90 rounded-xs overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#141724] border-b border-white/10 text-[10px] text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="p-3.5">Order Ref</th>
                    <th className="p-3.5">Patron</th>
                    <th className="p-3.5">Destination</th>
                    <th className="p-3.5">Items</th>
                    <th className="p-3.5">Total</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Update Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((ord) => (
                    <tr key={ord.orderNumber || ord.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 font-semibold text-[#D4AF37]">
                        {ord.orderNumber || ord.id}
                      </td>
                      <td className="p-3.5">
                        <p className="text-white">{ord.customerName}</p>
                        <p className="text-[10px] text-gray-400">{ord.customerEmail}</p>
                      </td>
                      <td className="p-3.5 text-gray-300">
                        {ord.shippingAddress?.city || ord.city || 'Standard'}{' '}
                        {ord.shippingAddress?.postalCode && `(${ord.shippingAddress.postalCode})`}
                      </td>
                      <td className="p-3.5 text-gray-300">
                        {ord.items?.length || 1} {ord.items?.length === 1 ? 'silhouette' : 'silhouettes'}
                      </td>
                      <td className="p-3.5 text-white font-semibold">{formatCurrency(ord.total)}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[9px] uppercase tracking-wider border ${
                            ord.status === 'DELIVERED'
                              ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                              : ord.status === 'DISPATCHED'
                              ? 'border-sky-500/40 text-sky-300 bg-sky-500/10'
                              : 'border-[#D4AF37]/40 text-[#D4AF37] bg-[#D4AF37]/10'
                          }`}
                        >
                          {ord.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <select
                          value={ord.status || 'PENDING'}
                          onChange={(e) =>
                            handleUpdateOrderStatus(ord.id || ord.orderNumber, e.target.value)
                          }
                          className="bg-[#141724] border border-white/20 text-xs px-2.5 py-1 text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="DISPATCHED">DISPATCHED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-2xl bg-[#0F111B] border-white/20 p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl rounded-xs"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="font-serif text-2xl text-white">
                  {editingProduct ? 'Curate Silhouette Details' : 'Induct New Monograph Piece'}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-gray-300 uppercase tracking-wider">
                      Silhouette Name *
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                      placeholder="e.g. Sculpted Double-Breasted Peacoat"
                      className="w-full bg-[#171B2A] border border-white/15 p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-gray-300 uppercase tracking-wider">
                      Subtitle / Materials Headline
                    </label>
                    <input
                      type="text"
                      value={productForm.subtitle}
                      onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                      placeholder="e.g. Biella Merino Wool & Horn Buttons"
                      className="w-full bg-[#171B2A] border border-white/15 p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-gray-300 uppercase tracking-wider">Department</label>
                    <select
                      value={productForm.department}
                      onChange={(e) => setProductForm({ ...productForm, department: e.target.value })}
                      className="w-full bg-[#171B2A] border border-white/15 p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="Women">Women</option>
                      <option value="Men">Men</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-gray-300 uppercase tracking-wider">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-[#171B2A] border border-white/15 p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="Coats">Coats</option>
                      <option value="Tailoring">Tailoring</option>
                      <option value="Dresses">Dresses</option>
                      <option value="Knitwear">Knitwear</option>
                      <option value="Trousers">Trousers</option>
                      <option value="Leather Goods">Leather Goods</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-gray-300 uppercase tracking-wider">Price (INR) *</label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                      min={100}
                      className="w-full bg-[#171B2A] border border-white/15 p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-gray-300 uppercase tracking-wider">Stock Units</label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      min={0}
                      className="w-full bg-[#171B2A] border border-white/15 p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-gray-300 uppercase tracking-wider">
                    High-Fashion Image URL
                  </label>
                  <input
                    type="url"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#171B2A] border border-white/15 p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-gray-300 uppercase tracking-wider">
                    Editorial Description
                  </label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-[#171B2A] border border-white/15 p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="inStockCheck"
                    checked={productForm.inStock}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                    className="accent-[#D4AF37] h-4 w-4"
                  />
                  <label htmlFor="inStockCheck" className="text-gray-300 cursor-pointer">
                    Mark as Available for Immediate Order Allocation
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-white/20 text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <Button variant="primary" size="md" type="submit">
                    {editingProduct ? 'Save Modifications' : 'Commit to Repertoire'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
