import React, { useState, useEffect } from 'react'
import { Tag, Plus, Trash2, Edit3, Check, AlertCircle, RefreshCw } from 'lucide-react'
import adminApi from '../../services/adminApi'
import AdminTable from '../../components/admin/AdminTable'
import AdminModal from '../../components/admin/AdminModal'
import { formatCurrency } from '../../utils/formatters'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState({ type: null, text: '' })

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minOrderValue: 1000,
    usageLimit: 500,
    isActive: true,
  })

  const loadCoupons = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.getCoupons()
      setCoupons(data || [])
    } catch (err) {
      setError(err.message || 'Failed to retrieve promo codes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCoupons()
  }, [])

  const handleOpenCreate = () => {
    setEditingId(null)
    setForm({
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderValue: 1000,
      usageLimit: 500,
      isActive: true,
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (c) => {
    setEditingId(c.id)
    setForm({
      code: c.code,
      discountType: c.discountType || 'PERCENTAGE',
      discountValue: c.discountValue,
      minOrderValue: c.minOrderValue || 0,
      usageLimit: c.usageLimit || 1000,
      isActive: c.isActive !== undefined ? c.isActive : true,
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        code: form.code.toUpperCase().trim(),
        discountValue: parseFloat(form.discountValue),
        minOrderValue: form.minOrderValue ? parseFloat(form.minOrderValue) : null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : null,
      }

      if (editingId) {
        await adminApi.updateCoupon(editingId, payload)
        setCoupons((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...payload } : c))
        )
        setFeedback({ type: 'success', text: `Privilege coupon ${payload.code} updated.` })
      } else {
        const created = await adminApi.createCoupon(payload)
        setCoupons((prev) => [created, ...prev])
        setFeedback({ type: 'success', text: `Privilege coupon ${payload.code} created.` })
      }
      setModalOpen(false)
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Coupon operation failed.' })
    } finally {
      setSaving(false)
      setTimeout(() => setFeedback({ type: null, text: '' }), 4000)
    }
  }

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Revoke and deactivate privilege code "${code}"?`)) return
    try {
      await adminApi.deleteCoupon(id)
      setCoupons((prev) => prev.filter((c) => c.id !== id))
      setFeedback({ type: 'success', text: `Coupon "${code}" deleted.` })
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete coupon.' })
    } finally {
      setTimeout(() => setFeedback({ type: null, text: '' }), 4000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#B8FF00]">
            PATRON PROMOTIONS & PRIVILEGE TOKENS
          </span>
          <h2 className="font-['Syne'] text-2xl font-bold uppercase text-[#F5F5F5] mt-1">
            PRIVILEGE COUPONS
          </h2>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#B8FF00] text-[#090909] font-['Syne'] font-extrabold text-xs uppercase tracking-wider hover:bg-[#D1FF38] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          <span>GENERATE PRIVILEGE CODE</span>
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

      {/* Coupons Table */}
      <AdminTable
        loading={loading}
        error={error}
        data={coupons}
        emptyMessage="No privilege codes currently configured."
        onRetry={loadCoupons}
        columns={[
          {
            header: 'PRIVILEGE CODE',
            key: 'code',
            render: (c) => (
              <span className="font-mono text-xs font-bold text-[#B8FF00] tracking-wider px-2 py-0.5 border border-[#2B3B15] bg-[#121908]">
                {c.code}
              </span>
            ),
          },
          {
            header: 'DISCOUNT APPLIED',
            key: 'discountValue',
            render: (c) => (
              <span className="text-[#F5F5F5] font-bold">
                {c.discountType === 'PERCENTAGE'
                  ? `${c.discountValue}% OFF`
                  : `${formatCurrency(c.discountValue)} OFF`}
              </span>
            ),
          },
          {
            header: 'MINIMUM SPEND',
            key: 'minOrderValue',
            render: (c) => (
              <span className="text-[#A6A6A6]">
                {c.minOrderValue ? formatCurrency(c.minOrderValue) : 'No Minimum'}
              </span>
            ),
          },
          {
            header: 'REDEMPTIONS',
            key: 'usedCount',
            render: (c) => (
              <span className="text-[#737373]">
                {c.usedCount || 0} / {c.usageLimit || '∞'} uses
              </span>
            ),
          },
          {
            header: 'STATUS',
            key: 'isActive',
            render: (c) => (
              <span
                className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                  c.isActive
                    ? 'border-[#1F2E12] text-[#B8FF00] bg-[#121B0A]'
                    : 'border-[#2E1212] text-[#FF4D4D] bg-[#1B0A0A]'
                }`}
              >
                {c.isActive ? 'ACTIVE' : 'DEACTIVATED'}
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
                  onClick={() => handleDelete(c.id, c.code)}
                  className="p-1.5 border border-[#262626] hover:border-[#FF4D4D] hover:text-[#FF4D4D] text-[#A6A6A6] transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* Modal Dialog */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'UPDATE PRIVILEGE CODE' : 'CREATE PRIVILEGE CODE'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[#A6A6A6] uppercase text-[10px]">Privilege Code *</label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#B8FF00] font-bold tracking-wider focus:outline-none focus:border-[#B8FF00]"
                placeholder="AUREVA20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#A6A6A6] uppercase text-[10px]">Discount Type *</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
              >
                <option value="PERCENTAGE">PERCENTAGE (%)</option>
                <option value="FIXED_AMOUNT">FIXED AMOUNT (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[#A6A6A6] uppercase text-[10px]">Discount Value *</label>
              <input
                type="number"
                step="any"
                required
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#A6A6A6] uppercase text-[10px]">Min Order Spend (₹)</label>
              <input
                type="number"
                step="any"
                value={form.minOrderValue}
                onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[#A6A6A6] uppercase text-[10px]">Usage Limit</label>
              <input
                type="number"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#262626] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="accent-[#B8FF00]"
            />
            <label htmlFor="isActive" className="text-xs text-[#F5F5F5] cursor-pointer">
              Active and eligible for client checkout
            </label>
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
              {saving ? 'RECORDING...' : editingId ? 'UPDATE CODE' : 'CREATE PRIVILEGE CODE'}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  )
}
