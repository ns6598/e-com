import React, { useState, useEffect } from 'react'
import { Boxes, Save, RefreshCw, Check, AlertCircle, Search } from 'lucide-react'
import adminApi from '../../services/adminApi'
import AdminTable from '../../components/admin/AdminTable'

export default function AdminInventoryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stockEdits, setStockEdits] = useState({})
  const [savingId, setSavingId] = useState(null)
  const [feedback, setFeedback] = useState({ type: null, text: '' })
  const [search, setSearch] = useState('')

  const loadInventory = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.getInventory()
      setItems(data || [])
    } catch (err) {
      setError(err.message || 'Failed to retrieve inventory data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  const handleStockChange = (id, newStock) => {
    const val = parseInt(newStock, 10)
    setStockEdits((prev) => ({ ...prev, [id]: isNaN(val) ? 0 : val }))
  }

  const handleSaveStock = async (row) => {
    const newStock = stockEdits[row.id]
    if (newStock === undefined) return

    setSavingId(row.id)
    try {
      await adminApi.updateInventory(row.id, newStock)
      setItems((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? {
                ...item,
                stock: newStock,
                availableStock: newStock,
                isLowStock: newStock <= 5,
                lowStockIndicator: newStock <= 5,
                lastUpdated: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      )
      setStockEdits((prev) => {
        const copy = { ...prev }
        delete copy[row.id]
        return copy
      })
      setFeedback({
        type: 'success',
        text: `Inventory for SKU ${row.sku} updated to ${newStock} units. Synchronized across storefront.`,
      })
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to adjust stock.' })
    } finally {
      setSavingId(null)
      setTimeout(() => setFeedback({ type: null, text: '' }), 4000)
    }
  }

  const filteredItems = items.filter(
    (item) =>
      !search ||
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.color.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#B8FF00]">
            REAL-TIME WAREHOUSE & STOCK
          </span>
          <h2 className="font-['Syne'] text-2xl font-bold uppercase text-[#F5F5F5] mt-1">
            INVENTORY & VARIANT CONTROL
          </h2>
        </div>

        <button
          type="button"
          onClick={loadInventory}
          className="px-4 py-2 bg-[#171717] border border-[#2B2B2B] hover:border-[#B8FF00] hover:text-[#B8FF00] text-xs font-mono uppercase tracking-wider text-[#F5F5F5] transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} />
          <span>SYNC INVENTORY</span>
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

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3.5 top-3 text-[#737373]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by piece name, SKU, or colorway..."
          className="w-full pl-9 pr-3 py-2 bg-[#121212] border border-[#222222] text-xs font-mono text-[#F5F5F5] placeholder-[#555555] focus:outline-none focus:border-[#B8FF00]"
        />
      </div>

      {/* Inventory Table */}
      <AdminTable
        loading={loading}
        error={error}
        data={filteredItems}
        emptyMessage="No variant inventory units discovered."
        onRetry={loadInventory}
        columns={[
          {
            header: 'PRODUCT',
            key: 'productName',
            render: (r) => (
              <div className="flex items-center gap-3">
                {r.image && (
                  <img
                    src={r.image}
                    alt={r.productName || r.product}
                    className="w-9 h-11 object-cover bg-[#171717] shrink-0 border border-[#222222]"
                  />
                )}
                <div>
                  <span className="font-semibold text-xs text-[#F5F5F5] font-sans block truncate max-w-[220px]">
                    {r.productName || r.product}
                  </span>
                </div>
              </div>
            ),
          },
          {
            header: 'SKU',
            key: 'sku',
            render: (r) => (
              <span className="font-mono text-xs text-[#B8FF00] font-bold">
                {r.sku}
              </span>
            ),
          },
          {
            header: 'VARIANT',
            key: 'variant',
            render: (r) => (
              <span className="font-mono text-xs text-[#A6A6A6]">
                {r.variant || `${r.size || 'OS'} / ${r.color || 'Noir'}`}
              </span>
            ),
          },
          {
            header: 'AVAILABLE STOCK',
            key: 'availableStock',
            render: (r) => {
              const currentStock =
                stockEdits[r.id] !== undefined
                  ? stockEdits[r.id]
                  : r.availableStock !== undefined
                  ? r.availableStock
                  : r.stock !== undefined
                  ? r.stock
                  : 0
              const originalStock =
                r.availableStock !== undefined ? r.availableStock : r.stock !== undefined ? r.stock : 0
              const hasChanged = stockEdits[r.id] !== undefined && stockEdits[r.id] !== originalStock

              return (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={currentStock}
                    onChange={(e) => handleStockChange(r.id, e.target.value)}
                    className="w-20 px-2 py-1 bg-[#171717] border border-[#262626] text-xs font-mono text-[#F5F5F5] text-center focus:outline-none focus:border-[#B8FF00]"
                  />
                  {hasChanged && (
                    <button
                      type="button"
                      onClick={() => handleSaveStock(r)}
                      disabled={savingId === r.id}
                      className="px-2 py-1 bg-[#B8FF00] text-[#090909] text-[10px] font-bold uppercase hover:bg-[#D1FF38] transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Save size={12} />
                      <span>{savingId === r.id ? '...' : 'SAVE'}</span>
                    </button>
                  )}
                </div>
              )
            },
          },
          {
            header: 'LOW-STOCK INDICATOR',
            key: 'isLowStock',
            render: (r) => {
              const stock =
                stockEdits[r.id] !== undefined
                  ? stockEdits[r.id]
                  : r.availableStock !== undefined
                  ? r.availableStock
                  : r.stock !== undefined
                  ? r.stock
                  : 0
              const isLow = stock <= 5
              return isLow ? (
                <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold text-[#FF4D4D] bg-[#221010] border border-[#8B0000]">
                  LOW STOCK ({stock})
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold text-[#B8FF00] bg-[#121E07] border border-[#1F350C]">
                  IN STOCK ({stock})
                </span>
              )
            },
          },
          {
            header: 'LAST UPDATED',
            key: 'lastUpdated',
            render: (r) => (
              <span className="font-mono text-xs text-[#737373]">
                {r.lastUpdated || r.updatedAt
                  ? new Date(r.lastUpdated || r.updatedAt).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : 'Recent'}
              </span>
            ),
          },
        ]}
      />
    </div>
  )
}
