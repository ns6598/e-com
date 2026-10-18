import React, { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, Layers, Check, AlertCircle } from 'lucide-react'
import adminApi from '../../services/adminApi'
import AdminTable from '../../components/admin/AdminTable'
import AdminModal from '../../components/admin/AdminModal'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState({ type: null, text: '' })

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    department: 'Women',
    description: '',
  })

  const loadCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.getCategories()
      setCategories(data || [])
    } catch (err) {
      setError(err.message || 'Failed to retrieve categories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleOpenCreate = () => {
    setEditingId(null)
    setForm({
      name: '',
      slug: '',
      department: 'Women',
      description: '',
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (c) => {
    setEditingId(c.id)
    setForm({
      name: c.name || '',
      slug: c.slug || '',
      department: c.department || 'Women',
      description: c.description || '',
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const payload = { ...form, slug }

      if (editingId) {
        await adminApi.updateCategory(editingId, payload)
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...payload } : c))
        )
        setFeedback({ type: 'success', text: `Category "${form.name}" updated.` })
      } else {
        const created = await adminApi.createCategory(payload)
        setCategories((prev) => [...prev, created])
        setFeedback({ type: 'success', text: `Category "${form.name}" established.` })
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
    if (!window.confirm(`Delete category taxonomy "${name}"?`)) return
    try {
      await adminApi.deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      setFeedback({ type: 'success', text: `Category "${name}" removed.` })
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to remove category.' })
    } finally {
      setTimeout(() => setFeedback({ type: null, text: '' }), 4000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#B8FF00]">
            TAXONOMY & ARCHITECTURAL DEPARTMENTS
          </span>
          <h2 className="font-['Syne'] text-2xl font-bold uppercase text-[#F5F5F5] mt-1">
            CATEGORY MANAGEMENT
          </h2>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#B8FF00] text-[#090909] font-['Syne'] font-extrabold text-xs uppercase tracking-wider hover:bg-[#D1FF38] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span>NEW CATEGORY</span>
        </button>
      </div>

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

      <AdminTable
        loading={loading}
        error={error}
        data={categories}
        emptyMessage="No departments or categories configured."
        onRetry={loadCategories}
        columns={[
          {
            header: 'CATEGORY NAME',
            key: 'name',
            render: (c) => (
              <div>
                <span className="font-bold text-[#F5F5F5] font-sans text-xs block">
                  {c.name}
                </span>
                <span className="text-[10px] text-[#737373] font-mono">
                  slug: /{c.slug}
                </span>
              </div>
            ),
          },
          {
            header: 'DEPARTMENT',
            key: 'department',
            render: (c) => (
              <span className="px-2 py-0.5 text-[10px] font-mono border border-[#262626] bg-[#161616] text-[#A6A6A6]">
                {c.department || 'Women'}
              </span>
            ),
          },
          {
            header: 'DESCRIPTION',
            key: 'description',
            render: (c) => (
              <span className="text-[#A6A6A6] text-xs font-sans line-clamp-1">
                {c.description || 'Curated departmental division.'}
              </span>
            ),
          },
          {
            header: 'ACTIONS',
            key: 'actions',
            className: 'text-right',
            render: (c) => (
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 border border-[#262626] hover:border-[#B8FF00] hover:text-[#B8FF00] text-[#A6A6A6] transition-colors cursor-pointer"
                >
                  <Edit3 size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id, c.name)}
                  className="p-1.5 border border-[#262626] hover:border-[#FF4D4D] hover:text-[#FF4D4D] text-[#A6A6A6] transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ),
          },
        ]}
      />

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'EDIT CATEGORY TAXONOMY' : 'ESTABLISH NEW CATEGORY'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
          <div className="space-y-1">
            <label className="text-[#A6A6A6] uppercase text-[10px]">Category Title *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
              placeholder="e.g. Sculptural Knitwear"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[#A6A6A6] uppercase text-[10px]">URL Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
                placeholder="auto-generated if blank"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#A6A6A6] uppercase text-[10px]">Department *</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
              >
                <option value="Women">Women</option>
                <option value="Men">Men</option>
                <option value="Accessories">Accessories</option>
                <option value="Archive">Archive</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[#A6A6A6] uppercase text-[10px]">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
              placeholder="Taxonomy details and aesthetic scope..."
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
              {saving ? 'COMMITTING...' : editingId ? 'UPDATE CATEGORY' : 'CREATE CATEGORY'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}
