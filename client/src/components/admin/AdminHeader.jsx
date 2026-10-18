import React from 'react'
import { Menu, Shield, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminHeader({ onOpenMobile, title = 'ADMIN CONSOLE', onRefresh, refreshing }) {
  const { user } = useAuth()

  return (
    <header className="h-18 px-4 sm:px-8 bg-[#0F0F0F] border-b border-[#222222] flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-[#A6A6A6] hover:text-[#F5F5F5] cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <div>
          <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-[#737373] hidden sm:block">
            AUREVA ADMINISTRATIVE SUITE
          </span>
          <h1 className="font-['Syne'] text-base sm:text-lg font-bold uppercase tracking-wider text-[#F5F5F5]">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Status Pill, Refresh & Identity */}
      <div className="flex items-center gap-3 sm:gap-4">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 border border-[#222222] bg-[#141414] hover:border-[#B8FF00] hover:text-[#B8FF00] text-[#A6A6A6] transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh administrative data"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-[#B8FF00]' : ''} />
          </button>
        )}

        {/* Security Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 border border-[#1F2E12] bg-[#121B0A] text-[#B8FF00] text-[10px] font-mono tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B8FF00] animate-pulse" />
          <span>ROLE: ADMIN</span>
        </div>

        {/* Identity Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#141414] border border-[#222222] text-xs font-mono">
          <Shield size={13} className="text-[#B8FF00]" />
          <span className="text-[#F5F5F5] truncate max-w-[120px] sm:max-w-[160px]">
            {user?.name || 'Administrator'}
          </span>
        </div>
      </div>
    </header>
  )
}
