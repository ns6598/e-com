import React, { useState, useEffect } from 'react'
import { ShoppingBag, Eye, RefreshCw, Check, AlertCircle, Search } from 'lucide-react'
import adminApi from '../../services/adminApi'
import AdminTable from '../../components/admin/AdminTable'
import AdminModal from '../../components/admin/AdminModal'
import { formatCurrency } from '../../utils/formatters'

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState({ type: null, text: '' })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const loadOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.getOrders()
      setOrders(data || [])
    } catch (err) {
      setError(err.message || 'Failed to retrieve orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await adminApi.updateOrderStatus(orderId, newStatus)
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      )
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }))
      }
      setFeedback({ type: 'success', text: `Order status shifted to ${newStatus}.` })
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Status update failed.' })
    } finally {
      setUpdatingId(null)
      setTimeout(() => setFeedback({ type: null, text: '' }), 4000)
    }
  }

  const filteredOrders = orders.filter((o) => !statusFilter || o.orderStatus === statusFilter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#B8FF00]">
            CLIENT DISPATCHES & FULFILLMENT
          </span>
          <h2 className="font-['Syne'] text-2xl font-bold uppercase text-[#F5F5F5] mt-1">
            SALES & ORDER MANAGEMENT
          </h2>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          className="px-4 py-2 bg-[#171717] border border-[#2B2B2B] hover:border-[#B8FF00] hover:text-[#B8FF00] text-xs font-mono uppercase tracking-wider text-[#F5F5F5] transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} />
          <span>REFRESH ORDERS</span>
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

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-mono">
        <button
          type="button"
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1.5 border uppercase transition-colors cursor-pointer ${
            !statusFilter
              ? 'border-[#B8FF00] text-[#B8FF00] bg-[#171717]'
              : 'border-[#222222] text-[#A6A6A6] bg-[#111111] hover:border-[#333333]'
          }`}
        >
          ALL ORDERS ({orders.length})
        </button>
        {ORDER_STATUSES.map((status) => {
          const count = orders.filter((o) => o.orderStatus === status).length
          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 border uppercase transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'border-[#B8FF00] text-[#B8FF00] bg-[#171717]'
                  : 'border-[#222222] text-[#A6A6A6] bg-[#111111] hover:border-[#333333]'
              }`}
            >
              {status} ({count})
            </button>
          )
        })}
      </div>

      {/* Orders Table */}
      <AdminTable
        loading={loading}
        error={error}
        data={filteredOrders}
        emptyMessage="No customer bookings match this filter."
        onRetry={loadOrders}
        columns={[
          {
            header: 'REFERENCE',
            key: 'orderReference',
            render: (o) => (
              <div>
                <span className="font-bold text-[#F5F5F5] font-mono text-xs block">
                  {o.orderReference || o.id}
                </span>
                <span className="text-[10px] text-[#737373]">
                  {o.createdAt ? new Date(o.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                </span>
              </div>
            ),
          },
          {
            header: 'CUSTOMER',
            key: 'customerName',
            render: (o) => (
              <div>
                <span className="font-sans font-medium text-xs text-[#F5F5F5] block">
                  {o.customerName || o.shippingAddress?.name || 'Atelier Patron'}
                </span>
                <span className="text-[10px] text-[#737373] truncate block">
                  {o.customerEmail || o.user?.email || '—'}
                </span>
              </div>
            ),
          },
          {
            header: 'ITEMS',
            key: 'items',
            render: (o) => (
              <span className="text-[#A6A6A6] text-xs">
                {o.items?.length || o.itemCount || 1} {o.items?.length === 1 ? 'piece' : 'pieces'}
              </span>
            ),
          },
          {
            header: 'TOTAL AMOUNT',
            key: 'total',
            render: (o) => (
              <div>
                <span className="font-bold text-[#B8FF00]">
                  {formatCurrency(o.total)}
                </span>
                <span className="text-[9px] uppercase font-mono block text-[#737373]">
                  {o.paymentMethod || 'Atelier Pay'}
                </span>
              </div>
            ),
          },
          {
            header: 'PAYMENT',
            key: 'paymentStatus',
            render: (o) => (
              <span
                className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                  o.paymentStatus === 'PAID'
                    ? 'border-[#1F2E12] text-[#B8FF00] bg-[#121B0A]'
                    : 'border-[#262626] text-[#A6A6A6] bg-[#161616]'
                }`}
              >
                {o.paymentStatus || 'PENDING'}
              </span>
            ),
          },
          {
            header: 'ORDER STATUS',
            key: 'orderStatus',
            render: (o) => (
              <select
                value={o.orderStatus}
                disabled={updatingId === o.id}
                onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                className="px-2 py-1 bg-[#171717] border border-[#2B2B2B] text-xs font-mono text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00] cursor-pointer"
              >
                {ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            ),
          },
          {
            header: 'DOSSIER',
            key: 'view',
            className: 'text-right',
            render: (o) => (
              <button
                type="button"
                onClick={() => setSelectedOrder(o)}
                className="p-1.5 border border-[#262626] hover:border-[#B8FF00] hover:text-[#B8FF00] text-[#A6A6A6] transition-colors cursor-pointer"
                title="View Order Details"
              >
                <Eye size={13} />
              </button>
            ),
          },
        ]}
      />

      {/* Order Detail Modal */}
      <AdminModal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`BOOKING DOSSIER • ${selectedOrder?.orderReference || selectedOrder?.id}`}
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs font-mono">
            {/* Top Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#141414] border border-[#222222]">
              <div>
                <span className="text-[10px] text-[#737373] uppercase block">TOTAL</span>
                <span className="text-sm font-bold text-[#B8FF00]">
                  {formatCurrency(selectedOrder.total)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#737373] uppercase block">PAYMENT</span>
                <span className="text-xs font-semibold text-[#F5F5F5]">
                  {selectedOrder.paymentStatus}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#737373] uppercase block">STATUS</span>
                <span className="text-xs font-semibold text-[#B8FF00]">
                  {selectedOrder.orderStatus}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#737373] uppercase block">DATE</span>
                <span className="text-xs text-[#A6A6A6]">
                  {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[#A6A6A6] block border-b border-[#222222] pb-1">
                DISPATCHED ARCHIVES ({selectedOrder.items?.length || 1})
              </span>
              <div className="space-y-2">
                {(selectedOrder.items || [
                  { productName: 'Sculptural Wool Cocoon Coat', quantity: 1, unitPrice: selectedOrder.total },
                ]).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#161616] border border-[#242424] flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-sans font-semibold text-[#F5F5F5] block">
                        {item.productName}
                      </span>
                      <span className="text-[10px] text-[#737373]">
                        Quantity: {item.quantity} • Unit: {formatCurrency(item.unitPrice)}
                      </span>
                    </div>
                    <span className="font-bold text-[#F5F5F5]">
                      {formatCurrency((item.quantity || 1) * (item.unitPrice || selectedOrder.total))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address Snapshot */}
            {selectedOrder.shippingAddress && (
              <div className="p-3 bg-[#141414] border border-[#222222] space-y-1">
                <span className="text-[10px] text-[#737373] uppercase block">
                  DELIVERY DESTINATION
                </span>
                <p className="text-xs text-[#F5F5F5] font-sans">
                  {selectedOrder.shippingAddress.name}
                </p>
                <p className="text-xs text-[#A6A6A6]">
                  {selectedOrder.shippingAddress.addressLine1 || selectedOrder.shippingAddress.address},{' '}
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{' '}
                  {selectedOrder.shippingAddress.postalCode}
                </p>
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </div>
  )
}
