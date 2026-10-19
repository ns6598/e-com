import React, { useState, useEffect } from 'react'
import { ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Search, Shield, Filter } from 'lucide-react'
import adminApi from '../../services/adminApi'
import AdminTable from '../../components/admin/AdminTable'

export default function AdminLoginActivityPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, SUCCESS, FAILED

  const loadLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminApi.getLoginActivity({ limit: 100 })
      setLogs(res?.items || [])
    } catch (err) {
      setError(err.message || 'Failed to retrieve login activity logs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !search ||
      log.email?.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress?.includes(search)
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'SUCCESS' && log.success) ||
      (statusFilter === 'FAILED' && !log.success)
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#B8FF00]">
            SECURITY AUDIT LOGS & ATTEMPTS
          </span>
          <h2 className="font-['Syne'] text-2xl font-bold uppercase text-[#F5F5F5] mt-1">
            LOGIN ACTIVITY AUDIT TRAIL
          </h2>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          className="px-4 py-2 bg-[#171717] border border-[#2B2B2B] hover:border-[#B8FF00] hover:text-[#B8FF00] text-xs font-mono uppercase tracking-wider text-[#F5F5F5] transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} />
          <span>SYNC AUDIT LOG</span>
        </button>
      </div>

      {/* Security Privacy Guarantee */}
      <div className="p-3 bg-[#111111] border border-[#242424] text-[11px] font-mono text-[#A6A6A6] flex items-center gap-2">
        <Shield size={14} className="text-[#B8FF00] shrink-0" />
        <span>
          AUDIT INTEGRITY: Passwords and secrets are never logged or stored. Only authentication status, timestamps, and network client metadata are tracked.
        </span>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-3 text-[#737373]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail by user email, IP address..."
            className="w-full pl-9 pr-3 py-2 bg-[#121212] border border-[#222222] text-xs font-mono text-[#F5F5F5] placeholder-[#555555] focus:outline-none focus:border-[#B8FF00]"
          />
        </div>

        <div className="flex gap-2">
          {['ALL', 'SUCCESS', 'FAILED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 border text-xs font-mono uppercase transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'border-[#B8FF00] text-[#B8FF00] bg-[#171717]'
                  : 'border-[#222222] text-[#A6A6A6] bg-[#111111] hover:border-[#333333]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Table */}
      <AdminTable
        loading={loading}
        error={error}
        data={filteredLogs}
        emptyMessage="No authentication audit events recorded."
        onRetry={loadLogs}
        columns={[
          {
            header: 'USER',
            key: 'user',
            render: (l) => (
              <span className="font-sans font-semibold text-xs text-[#F5F5F5] block">
                {l.user?.name || l.email?.split('@')[0] || 'Atelier Patron'}
              </span>
            ),
          },
          {
            header: 'EMAIL',
            key: 'email',
            render: (l) => (
              <span className="font-mono text-xs text-[#B8FF00] block">
                {l.email}
              </span>
            ),
          },
          {
            header: 'LOGIN TIME',
            key: 'timestamp',
            render: (l) => (
              <span className="font-mono text-xs text-[#A6A6A6]">
                {l.timestamp
                  ? new Date(l.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })
                  : 'Recent'}
              </span>
            ),
          },
          {
            header: 'AUTH STATUS',
            key: 'success',
            render: (l) =>
              l.success ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-bold text-[#B8FF00] bg-[#131D08] border border-[#21350B]">
                  <CheckCircle2 size={12} />
                  <span>SUCCESSFUL</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-bold text-[#FF4D4D] bg-[#221010] border border-[#8B0000]">
                  <AlertTriangle size={12} />
                  <span>FAILED: {l.failureReason || 'INVALID_CREDENTIALS'}</span>
                </span>
              ),
          },
          {
            header: 'ACCOUNT STATUS',
            key: 'accountStatus',
            render: (l) => (
              <span className="inline-flex items-center px-2 py-0.5 text-[9px] uppercase font-bold border border-[#1F350C] text-[#B8FF00] bg-[#121E07]">
                {l.accountStatus || 'ACTIVE'}
              </span>
            ),
          },
          {
            header: 'LOGOUT TIME',
            key: 'logoutTime',
            render: (l) => (
              <span className="font-mono text-xs text-[#737373]">
                {l.logoutTime
                  ? new Date(l.logoutTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                  : l.success
                  ? 'Active / Session Cleared'
                  : '—'}
              </span>
            ),
          },
          {
            header: 'NETWORK / IP',
            key: 'ipAddress',
            render: (l) => (
              <span className="font-mono text-[11px] text-[#737373]">
                {l.ipAddress || '127.0.0.1'}
              </span>
            ),
          },
        ]}
      />
    </div>
  )
}
