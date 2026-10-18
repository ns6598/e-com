import React, { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, Search, Filter, Image, Check, AlertCircle } from 'lucide-react'
import adminApi from '../../services/adminApi'
import AdminTable from '../../components/admin/AdminTable'
import AdminModal from '../../components/admin/AdminModal'
import { formatCurrency } from '../../utils/formatters'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState({ type: null, text: '' })
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    subtitle: '',
    department: 'Women',
    category: 'Tailoring',
    price: '',
    comparisonPrice: '',
    stock: 10,
    isActive: true,
    description: '',
    materials: '',
    image: '',
  })

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [prodsData, catsData] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getCategories(),
      ])
      setProducts(prodsData || [])
      setCategories(catsData || [])
    } catch (err) {
      setError(err.message || 'Failed to retrieve catalog products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingId(null)
    setForm({
      name: '',
      subtitle: '',
      department: 'Women',
      category: categories[0]?.name || 'Tailoring',
      price: '',
      comparisonPrice: '',
      stock: 15,
      isActive: true,
      description: '',
      materials: '100% Virgin Wool',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (p) => {
    setEditingId(p.id)
    setForm({
      name: p.name || '',
      subtitle: p.subtitle || '',
      department: p.department || 'Women',
      category: p.category || categories[0]?.name || 'Tailoring',
      price: p.price || p.basePrice || '',
      comparisonPrice: p.comparisonPrice || '',
      stock: p.stock !== undefined ? p.stock : 10,
      isActive: p.isActive !== undefined ? p.isActive : true,
      description: p.description || '',
      materials: p.materials || '',
      image: p.images?.[0] || p.image || '',
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        comparisonPrice: form.comparisonPrice ? parseFloat(form.comparisonPrice) : null,
        stock: parseInt(form.stock, 10),
        images: form.image ? [form.image] : [],
      }

      if (editingId) {
        await adminApi.updateProduct(editingId, payload)
        setProducts((prev) =>
          prev.map((item) => (item.id === editingId ? { ...item, ...payload } : item))
        )
        setFeedback({ type: 'success', text: `Updated "${form.name}" successfully.` })
      } else {
        const created = await adminApi.createProduct(payload)
        setProducts((prev) => [created, ...prev])
        setFeedback({ type: 'success', text: `Created "${form.name}" in catalog.` })
      }
      setModalOpen(false)
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Operation failed.' })
    } finally {
      setSaving(false)
      setTimeout(() => setFeedback({ type: null, text: '' }), 4000)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Archive and remove "${name}" from store catalog?`)) return
    try {
      await adminApi.deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      setFeedback({ type: 'success', text: `Product "${name}" deleted.` })
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Could not delete product.' })
    } finally {
      setTimeout(() => setFeedback({ type: null, text: '' }), 4000)
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      !selectedCategory || p.category?.toLowerCase() === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#B8FF00]">
            STOREFRONT CATALOG INVENTORY
          </span>
          <h2 className="font-['Syne'] text-2xl font-bold uppercase text-[#F5F5F5] mt-1">
            PRODUCT MANAGEMENT
          </h2>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#B8FF00] text-[#090909] font-['Syne'] font-extrabold text-xs uppercase tracking-wider hover:bg-[#D1FF38] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span>CREATE NEW PIECE</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback.text && (
        <div
          className={`p-3.5 text-xs font-mono border flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'border-[#B8FF00] bg-[#172405] text-[#B8FF00]'
              : 'border-[#8B0000] bg-[#221010] text-[#FF4D4D]'
          }`}
        >
          {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-3 text-[#737373]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog by name, category, or silhouette..."
            className="w-full pl-9 pr-3 py-2 bg-[#121212] border border-[#222222] text-xs font-mono text-[#F5F5F5] placeholder-[#555555] focus:outline-none focus:border-[#B8FF00]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-[#121212] border border-[#222222] text-xs font-mono text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
        >
          <option value="">ALL CATEGORIES</option>
          {categories.map((c) => (
            <option key={c.id || c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Product Table */}
      <AdminTable
        loading={loading}
        error={error}
        data={filteredProducts}
        emptyMessage="No pieces match your search filter."
        onRetry={loadData}
        columns={[
          {
            header: 'PIECE',
            key: 'name',
            render: (p) => (
              <div className="flex items-center gap-3">
                <img
                  src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=200&q=80'}
                  alt={p.name}
                  className="w-10 h-12 object-cover bg-[#171717] shrink-0 border border-[#222222]"
                />
                <div className="min-w-0">
                  <span className="font-sans font-semibold text-xs text-[#F5F5F5] block truncate">
                    {p.name}
                  </span>
                  <span className="text-[10px] text-[#737373] block truncate">
                    {p.subtitle || p.department || 'AUREVA Collection'}
                  </span>
                </div>
              </div>
            ),
          },
          {
            header: 'CATEGORY',
            key: 'category',
            render: (p) => (
              <span className="px-2 py-0.5 text-[10px] font-mono border border-[#262626] bg-[#161616] text-[#A6A6A6]">
                {p.category || 'Atelier'}
              </span>
            ),
          },
          {
            header: 'PRICE',
            key: 'price',
            render: (p) => (
              <div>
                <span className="font-bold text-[#F5F5F5]">
                  {formatCurrency(p.price || p.basePrice)}
                </span>
                {p.comparisonPrice && (
                  <span className="text-[10px] text-[#737373] line-through block">
                    {formatCurrency(p.comparisonPrice)}
                  </span>
                )}
              </div>
            ),
          },
          {
            header: 'STOCK',
            key: 'stock',
            render: (p) => {
              const stock = p.stock !== undefined ? p.stock : 10
              return (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold border ${
                    stock <= 5
                      ? 'border-[#8B0000] text-[#FF4D4D] bg-[#221010]'
                      : 'border-[#222222] text-[#A6A6A6] bg-[#141414]'
                  }`}
                >
                  {stock} UNITS
                </span>
              )
            },
          },
          {
            header: 'ACTIONS',
            key: 'actions',
            className: 'text-right',
            render: (p) => (
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(p)}
                  className="p-1.5 border border-[#262626] hover:border-[#B8FF00] hover:text-[#B8FF00] text-[#A6A6A6] transition-colors cursor-pointer"
                  title="Edit Piece"
                >
                  <Edit3 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.name)}
                  className="p-1.5 border border-[#262626] hover:border-[#FF4D4D] hover:text-[#FF4D4D] text-[#A6A6A6] transition-colors cursor-pointer"
                  title="Archive/Delete Piece"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* Create / Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'EDIT ATELIER PIECE' : 'CREATE NEW CATALOG PIECE'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[#A6A6A6] uppercase text-[10px]">Product Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
                placeholder="e.g. Sculptural Cocoon Coat"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#A6A6A6] uppercase text-[10px]">Subtitle / Silhouette</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
                placeholder="e.g. Drop MMXXVI"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[#A6A6A6] uppercase text-[10px]">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
              >
                {categories.map((c) => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[#A6A6A6] uppercase text-[10px]">Price (₹ / INR) *</label>
              <input
                type="number"
                step="any"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
                placeholder="28500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#A6A6A6] uppercase text-[10px]">Sale / Original Price</label>
              <input
                type="number"
                step="any"
                value={form.comparisonPrice}
                onChange={(e) => setForm({ ...form, comparisonPrice: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
                placeholder="Optional strike price"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[#A6A6A6] uppercase text-[10px]">Stock Level</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#A6A6A6] uppercase text-[10px]">Materials Specification</label>
              <input
                type="text"
                value={form.materials}
                onChange={(e) => setForm({ ...form, materials: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
                placeholder="100% Virgin Wool, Raw Silk"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[#A6A6A6] uppercase text-[10px]">Image Asset URL</label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#A6A6A6] uppercase text-[10px]">Editorial Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
              placeholder="Describe craftsmanship, drape, and silhouette..."
            />
          </div>

          <div className="pt-4 border-t border-[#222222] flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-[#333333] bg-[#141414] hover:bg-[#1F1F1F] text-[#F5F5F5] cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#B8FF00] text-[#090909] font-bold font-['Syne'] hover:bg-[#D1FF38] cursor-pointer disabled:opacity-50"
            >
              {saving ? 'COMMITTING TO CATALOG...' : editingId ? 'UPDATE PIECE' : 'SAVE TO CATALOG'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}
