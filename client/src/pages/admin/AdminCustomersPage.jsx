import React, { useState, useEffect } from 'react'
import { Users, Eye, RefreshCw, Search, ShieldAlert, ShoppingBag, MapPin } from 'lucide-react'
import adminApi from '../../services/adminApi'
import AdminTable from '../../components/admin/AdminTable'
import AdminModal from '../../components/admin/AdminModal'
import { formatCurrency } from '../../utils/formatters'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerOrders, setCustomerOrders] = useState([])
  const [loadingDetail, setLoadingDetail] = useState(false)

  const loadCustomers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.getCustomers()
      setCustomers(data || [])
    } catch (err) {
      setError(err.message || 'Failed to retrieve patron directory.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const handleViewCustomer = async (c) => {
    setSelectedCustomer(c)
    setLoadingDetail(true)
    try {
      const detail = await adminApi.getCustomerById(c.id)
      setSelectedCustomer(detail)
      setCustomerOrders(detail.orders || [])
    } catch {
      // Use basic info if detail query fails
      setCustomerOrders([])
    } finally {
      setLoadingDetail(false)
    }
  }

  const filtered = customers.filter(
    (c) =>
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.id?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#B8FF00]">
            CLIENTELE DOSSIERS & DIRECTORY
          </span>
          <h2 className="font-['Syne'] text-2xl font-bold uppercase text-[#F5F5F5] mt-1">
            CUSTOMER MANAGEMENT
          </h2>
        </div>

        <button
          type="button"
          onClick={loadCustomers}
          className="px-4 py-2 bg-[#171717] border border-[#2B2B2B] hover:border-[#B8FF00] hover:text-[#B8FF00] text-xs font-mono uppercase tracking-wider text-[#F5F5F5] transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} />
          <span>SYNC DIRECTORY</span>
        </button>
      </div>

      {/* Security Notice */}
      <div className="p-3 bg-[#111111] border border-[#242424] text-[11px] font-mono text-[#A6A6A6] flex items-center gap-2">
        <ShieldAlert size={14} className="text-[#B8FF00] shrink-0" />
        <span>
          PRIVACY GUARD: Customer passwords, encryption hashes, and session keys are permanently redacted and never exposed to curators.
        </span>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3.5 top-3 text-[#737373]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by customer name, email, or patron ID..."
          className="w-full pl-9 pr-3 py-2 bg-[#121212] border border-[#222222] text-xs font-mono text-[#F5F5F5] placeholder-[#555555] focus:outline-none focus:border-[#B8FF00]"
        />
      </div>

      {/* Customer Directory Table */}
      <AdminTable
        loading={loading}
        error={error}
        data={filtered}
        emptyMessage="No registered patrons match your search criteria."
        onRetry={loadCustomers}
        columns={[
          {
            header: 'CUSTOMER NAME',
            key: 'name',
            render: (c) => (
              <span className="font-sans font-semibold text-xs text-[#F5F5F5] block">
                {c.name}
              </span>
            ),
          },
          {
            header: 'EMAIL',
            key: 'email',
            render: (c) => (
              <span className="font-mono text-xs text-[#B8FF00] block">
                {c.email}
              </span>
            ),
          },
          {
            header: 'REGISTRATION DATE',
            key: 'joinedAt',
            render: (c) => (
              <span className="font-mono text-xs text-[#A6A6A6]">
                {c.joinedAt || c.registrationDate || c.createdAt
                  ? new Date(c.joinedAt || c.registrationDate || c.createdAt).toLocaleDateString()
                  : 'Recent'}
              </span>
            ),
          },
          {
            header: 'ACCOUNT STATUS',
            key: 'accountStatus',
            render: (c) => (
              <span className="inline-flex items-center px-2 py-0.5 text-[9px] uppercase font-bold border border-[#1F350C] text-[#B8FF00] bg-[#121E07]">
                {c.accountStatus || 'ACTIVE'}
              </span>
            ),
          },
          {
            header: 'LAST SUCCESSFUL LOGIN',
            key: 'lastSuccessfulLogin',
            render: (c) => (
              <span className="font-mono text-xs text-[#737373]">
                {c.lastSuccessfulLogin
                  ? new Date(c.lastSuccessfulLogin).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                  : 'Active session'}
              </span>
            ),
          },
          {
            header: 'ORDER COUNT',
            key: 'orderCount',
            render: (c) => (
              <div>
                <span className="text-xs text-[#F5F5F5] font-bold block">
                  {c.orderCount !== undefined ? c.orderCount : c.orders?.length || 0} orders
                </span>
                {c.totalSpent > 0 && (
                  <span className="text-[10px] text-[#A6A6A6]">
                    Spent: {formatCurrency(c.totalSpent)}
                  </span>
                )}
              </div>
            ),
          },
          {
            header: 'ACTIONS',
            key: 'actions',
            className: 'text-right',
            render: (c) => (
              <button
                type="button"
                onClick={() => handleViewCustomer(c)}
                className="p-1.5 border border-[#262626] hover:border-[#B8FF00] hover:text-[#B8FF00] text-[#A6A6A6] transition-colors cursor-pointer"
                title="View Customer Dossier"
              >
                <Eye size={13} />
              </button>
            ),
          },
        ]}
      />

      {/* Customer Detail Dossier Modal */}
      <AdminModal
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title={`PATRON DOSSIER • ${selectedCustomer?.name || 'CLIENT'}`}
      >
        {selectedCustomer && (
          <div className="space-y-6 text-xs font-mono">
            {/* Top Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#141414] border border-[#222222]">
              <div>
                <span className="text-[10px] text-[#737373] uppercase block">PATRON ID</span>
                <span className="text-xs font-bold text-[#B8FF00] truncate block">
                  {selectedCustomer.id}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#737373] uppercase block">EMAIL</span>
                <span className="text-xs text-[#F5F5F5] truncate block">
                  {selectedCustomer.email}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#737373] uppercase block">ROLE</span>
                <span className="text-xs font-bold text-[#F5F5F5]">
                  {selectedCustomer.role || 'CUSTOMER'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#737373] uppercase block">MEMBERSHIP</span>
                <span className="text-xs text-[#A6A6A6]">
                  {selectedCustomer.joinedAt || selectedCustomer.createdAt
                    ? new Date(selectedCustomer.joinedAt || selectedCustomer.createdAt).toLocaleDateString()
                    : 'Active'}
                </span>
              </div>
            </div>

            {/* Saved Addresses */}
            {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-[#A6A6A6] block border-b border-[#222222] pb-1">
                  DELIVERY ADDRESS ARCHIVES
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCustomer.addresses.map((addr, idx) => (
                    <div key={idx} className="p-3 bg-[#161616] border border-[#222222]">
                      <div className="flex items-center gap-1.5 text-[#B8FF00] text-[10px] font-bold mb-1">
                        <MapPin size={11} />
                        <span>{addr.isDefault ? 'PRIMARY ATELIER DESTINATION' : 'SECONDARY ADDRESS'}</span>
                      </div>
                      <p className="text-xs text-[#F5F5F5] font-sans">
                        {addr.addressLine1 || addr.address}
                      </p>
                      <p className="text-[10px] text-[#737373]">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer Order History */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-[#A6A6A6] block border-b border-[#222222] pb-1">
                ORDER HISTORY ARCHIVE ({customerOrders.length})
              </span>
              {customerOrders.length === 0 ? (
                <div className="p-6 bg-[#161616] border border-[#222222] text-center text-[#737373]">
                  No past orders discovered for this customer.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {customerOrders.map((ord, idx) => (
                    <div
                      key={ord.id || idx}
                      className="p-3 bg-[#161616] border border-[#222222] flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-[#F5F5F5]">
                          {ord.orderReference || ord.id}
                        </span>
                        <span className="text-[10px] text-[#737373] block">
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent'} • {ord.orderStatus}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#B8FF00]">
                        {formatCurrency(ord.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  )
}
