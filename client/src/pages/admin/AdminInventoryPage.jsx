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
      const products = await adminApi.getProducts()
      // Flatten into inventory rows (variants or product lines)
      const rows = []
      products.forEach((p) => {
        if (p.variants && p.variants.length > 0) {
          p.variants.forEach((v) => {
            rows.push({
              id: v.id || `${p.id}-${v.sku}`,
              productId: p.id,
              productName: p.name,
              sku: v.sku || `AUR-${p.id.substring(0, 4)}-${v.size || 'STD'}`,
              size: v.size || 'Standard',
              color: v.color || 'Noir',
              stock: v.stockQuantity !== undefined ? v.stockQuantity : v.stock !== undefined ? v.stock : 10,
              image: v.image || p.images?.[0] || p.image,
              updatedAt: p.updatedAt || new Date().toISOString(),
            })
          })
        } else {
          rows.push({
            id: p.id,
            productId: p.id,
            productName: p.name,
            sku: p.sku || `AUR-${p.id.substring(0, 6).toUpperCase()}`,
            size: 'Standard / OS',
            color: 'Noir Charcoal',
            stock: p.stock !== undefined ? p.stock : 12,
            image: p.images?.[0] || p.image,
            updatedAt: p.updatedAt || new Date().toISOString(),
          })
        }
      })
      setItems(rows)
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
      await adminApi.updateVariantStock(row.id, newStock)
      setItems((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? { ...item, stock: newStock, updatedAt: new Date().toISOString() }
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
        text: `Inventory for SKU ${row.sku} updated to ${newStock} units.`,
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
            header: 'PRODUCT / PIECE',
            key: 'productName',
            render: (r) => (
              <div className="flex items-center gap-3">
                {r.image && (
                  <img
                    src={r.image}
                    alt={r.productName}
                    className="w-9 h-11 object-cover bg-[#171717] shrink-0 border border-[#222222]"
                  />
                )}
                <div>
                  <span className="font-semibold text-xs text-[#F5F5F5] font-sans block truncate max-w-[220px]">
                    {r.productName}
                  </span>
                  <span className="text-[10px] text-[#737373] font-mono">
                    {r.color} • {r.size}
                  </span>
                </div>
              </div>
            ),
          },
          {
            header: 'SKU IDENTIFIER',
            key: 'sku',
            render: (r) => (
              <span className="font-mono text-xs text-[#B8FF00] font-bold">
                {r.sku}
              </span>
            ),
          },
          {
            header: 'STOCK LEVEL & ADJUSTMENT',
            key: 'stock',
            render: (r) => {
              const currentStock = stockEdits[r.id] !== undefined ? stockEdits[r.id] : r.stock
              const hasChanged = stockEdits[r.id] !== undefined && stockEdits[r.id] !== r.stock
              const isLow = currentStock <= 5

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
                  {isLow && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold text-[#FF4D4D] bg-[#221010] border border-[#8B0000]">
                      LOW
                    </span>
                  )}
                </div>
              )
            },
          },
          {
            header: 'STATUS',
            key: 'status',
            render: (r) => {
              const stock = stockEdits[r.id] !== undefined ? stockEdits[r.id] : r.stock
              return (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                    stock === 0
                      ? 'border-[#8B0000] text-[#FF4D4D] bg-[#221010]'
                      : stock <= 5
                      ? 'border-[#8B0000]/60 text-[#FF8585] bg-[#1F1212]'
                      : 'border-[#1F2E12] text-[#B8FF00] bg-[#121B0A]'
                  }`}
                >
                  {stock === 0 ? 'DEPLETED' : stock <= 5 ? 'LOW INVENTORY' : 'ACTIVE STOCK'}
                </span>
              )
            },
          },
          {
            header: 'LAST UPDATED',
            key: 'updatedAt',
            render: (r) => (
              <span className="text-[#737373] text-[10px]">
                {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : 'Recent'}
              </span>
            ),
          },
        ]}
      />
    </div>
  )
}
