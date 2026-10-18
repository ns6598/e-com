import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Boxes,
} from 'lucide-react'
import adminApi from '../../services/adminApi'
import AdminStatCard from '../../components/admin/AdminStatCard'
import AdminTable from '../../components/admin/AdminTable'
import { formatCurrency } from '../../utils/formatters'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    lowStockCount: 0,
    totalCustomers: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [recentCustomers, setRecentCustomers] = useState([])
  const [lowStockItems, setLowStockItems] = useState([])
  const [loginActivity, setLoginActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsData, ordersData, customersData, productsData, activityData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getOrders(),
        adminApi.getCustomers(),
        adminApi.getProducts(),
        adminApi.getLoginActivity({ limit: 5 }),
      ])

      setStats({
        totalRevenue: statsData?.totalRevenue || 0,
        totalOrders: statsData?.totalOrders || ordersData?.length || 0,
        activeProducts: statsData?.activeProducts || productsData?.length || 0,
        lowStockCount: statsData?.lowStockCount || 0,
        totalCustomers: statsData?.totalCustomers || customersData?.length || 0,
      })

      setRecentOrders((ordersData || []).slice(0, 5))
      setRecentCustomers((customersData || []).slice(0, 5))

      // Identify products with low stock (<= 5)
      const lowStock = (productsData || []).filter(
        (p) => (p.stock !== undefined && p.stock <= 5) || (p.totalStock !== undefined && p.totalStock <= 5)
      ).slice(0, 5)
      setLowStockItems(lowStock)

      setLoginActivity(activityData?.items || [])
    } catch (err) {
      console.error('[AdminDashboard] Load error:', err)
      setError(err.message || 'Error loading dashboard metrics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  return (
    <div className="space-y-8">
      {/* 1. Key Performance Indicators / Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatCard
          label="TOTAL REVENUE"
          value={formatCurrency(stats.totalRevenue)}
          subtext="Net gross processed"
          icon={DollarSign}
          highlight
        />
        <AdminStatCard
          label="TOTAL ORDERS"
          value={stats.totalOrders}
          subtext="All customer bookings"
          icon={ShoppingBag}
        />
        <AdminStatCard
          label="TOTAL CUSTOMERS"
          value={stats.totalCustomers}
          subtext="Registered patrons"
          icon={Users}
        />
        <AdminStatCard
          label="TOTAL PRODUCTS"
          value={stats.activeProducts}
          subtext="Active in catalog"
          icon={Package}
        />
        <AdminStatCard
          label="LOW STOCK ITEMS"
          value={stats.lowStockCount || lowStockItems.length}
          subtext="Requires replenishment"
          icon={AlertTriangle}
          highlight={Boolean(stats.lowStockCount || lowStockItems.length > 0)}
        />
      </div>

      {/* 2. Middle Row: Recent Orders & Recent Customer Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <h3 className="font-['Syne'] text-sm font-bold uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2">
              <ShoppingBag size={16} className="text-[#B8FF00]" />
              <span>RECENT CUSTOMER ORDERS</span>
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs font-mono uppercase tracking-wider text-[#B8FF00] hover:underline flex items-center gap-1"
            >
              <span>VIEW ALL</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <AdminTable
            loading={loading}
            error={error}
            data={recentOrders}
            emptyMessage="No customer orders recorded yet."
            onRetry={loadDashboardData}
            columns={[
              {
                header: 'REFERENCE',
                key: 'orderReference',
                render: (r) => (
                  <span className="font-bold text-[#F5F5F5]">
                    {r.orderReference || r.id}
                  </span>
                ),
              },
              {
                header: 'PATRON',
                key: 'customerName',
                render: (r) => (
                  <div>
                    <span className="block text-[#F5F5F5] font-sans text-xs">
                      {r.customerName || r.shippingAddress?.name || 'Guest Patron'}
                    </span>
                    <span className="text-[10px] text-[#737373] truncate">
                      {r.customerEmail || '—'}
                    </span>
                  </div>
                ),
              },
              {
                header: 'TOTAL',
                key: 'total',
                render: (r) => (
                  <span className="text-[#B8FF00] font-bold">
                    {formatCurrency(r.total)}
                  </span>
                ),
              },
              {
                header: 'STATUS',
                key: 'orderStatus',
                render: (r) => (
                  <span className="px-2 py-0.5 text-[9px] uppercase font-bold border border-[#2B2B2B] bg-[#161616] text-[#A6A6A6]">
                    {r.orderStatus}
                  </span>
                ),
              },
            ]}
          />
        </div>

        {/* Recent Customer Registrations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <h3 className="font-['Syne'] text-sm font-bold uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2">
              <Users size={16} className="text-[#B8FF00]" />
              <span>NEW PATRON REGISTRATIONS</span>
            </h3>
            <Link
              to="/admin/customers"
              className="text-xs font-mono uppercase tracking-wider text-[#B8FF00] hover:underline flex items-center gap-1"
            >
              <span>DIRECTORY</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <AdminTable
            loading={loading}
            error={error}
            data={recentCustomers}
            emptyMessage="No customer registrations yet."
            onRetry={loadDashboardData}
            columns={[
              {
                header: 'PATRON',
                key: 'name',
                render: (c) => (
                  <div>
                    <span className="block text-[#F5F5F5] font-sans text-xs font-medium">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-[#737373] truncate block">
                      {c.email}
                    </span>
                  </div>
                ),
              },
              {
                header: 'LOCATION',
                key: 'location',
                render: (c) => (
                  <span className="text-[#A6A6A6] text-[10px] truncate">
                    {c.location || 'Paris'}
                  </span>
                ),
              },
              {
                header: 'REGISTERED',
                key: 'joinedAt',
                render: (c) => (
                  <span className="text-[#737373] text-[10px]">
                    {c.joinedAt ? new Date(c.joinedAt).toLocaleDateString() : 'Recent'}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* 3. Bottom Row: Low Stock Alerts & Recent Login Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Low Stock Products (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <h3 className="font-['Syne'] text-sm font-bold uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2">
              <Boxes size={16} className="text-[#FF4D4D]" />
              <span>LOW STOCK INVENTORY WATCH</span>
            </h3>
            <Link
              to="/admin/inventory"
              className="text-xs font-mono uppercase tracking-wider text-[#B8FF00] hover:underline flex items-center gap-1"
            >
              <span>MANAGE STOCK</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <AdminTable
            loading={loading}
            data={lowStockItems}
            emptyMessage="All product variants maintain sufficient inventory levels."
            columns={[
              {
                header: 'PIECE',
                key: 'name',
                render: (p) => (
                  <div className="flex items-center gap-3">
                    {p.images?.[0] && (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-8 h-10 object-cover bg-[#171717]"
                      />
                    )}
                    <div>
                      <span className="text-[#F5F5F5] font-sans text-xs font-semibold block line-clamp-1">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-[#737373]">
                        {p.category || 'Atelier'}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                header: 'PRICE',
                key: 'price',
                render: (p) => (
                  <span className="text-[#F5F5F5]">
                    {formatCurrency(p.price)}
                  </span>
                ),
              },
              {
                header: 'REMAINING',
                key: 'stock',
                render: (p) => (
                  <span className="px-2 py-0.5 text-[10px] font-bold border border-[#8B0000] text-[#FF4D4D] bg-[#221010]">
                    {p.stock !== undefined ? p.stock : 3} UNITS
                  </span>
                ),
              },
            ]}
          />
        </div>

        {/* Recent Authentication Activity (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <h3 className="font-['Syne'] text-sm font-bold uppercase tracking-wider text-[#F5F5F5] flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#B8FF00]" />
              <span>RECENT LOGIN ACTIVITY AUDIT</span>
            </h3>
            <Link
              to="/admin/login-activity"
              className="text-xs font-mono uppercase tracking-wider text-[#B8FF00] hover:underline flex items-center gap-1"
            >
              <span>VIEW FULL LOG</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <AdminTable
            loading={loading}
            data={loginActivity}
            emptyMessage="No login activity recorded in audit trail."
            columns={[
              {
                header: 'USER / EMAIL',
                key: 'email',
                render: (a) => (
                  <div>
                    <span className="text-[#F5F5F5] font-mono text-xs block truncate max-w-[180px]">
                      {a.email}
                    </span>
                    <span className="text-[9px] text-[#737373]">
                      IP: {a.ipAddress || '127.0.0.1'}
                    </span>
                  </div>
                ),
              },
              {
                header: 'EVENT STATUS',
                key: 'success',
                render: (a) =>
                  a.success ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#B8FF00] font-bold">
                      <CheckCircle2 size={12} />
                      <span>SUCCESS</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#FF4D4D] font-bold">
                      <AlertTriangle size={12} />
                      <span>{a.failureReason || 'FAILED'}</span>
                    </span>
                  ),
              },
              {
                header: 'TIMESTAMP',
                key: 'timestamp',
                render: (a) => (
                  <span className="text-[#737373] text-[10px]">
                    {a.timestamp ? new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
