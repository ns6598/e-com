import React from 'react'

export default function AdminStatCard({ label, value, subtext, icon: Icon, highlight = false, trend }) {
  return (
    <div
      className={`p-5 bg-[#121212] border transition-all ${
        highlight
          ? 'border-[#B8FF00]/50 shadow-[0_0_20px_rgba(184,255,0,0.06)]'
          : 'border-[#222222] hover:border-[#333333]'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A6A6A6]">
          {label}
        </span>
        {Icon && (
          <div
            className={`w-7 h-7 flex items-center justify-center border ${
              highlight
                ? 'border-[#B8FF00]/40 text-[#B8FF00] bg-[#1A2605]'
                : 'border-[#2A2A2A] text-[#A6A6A6] bg-[#171717]'
            }`}
          >
            <Icon size={14} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={`font-['Syne'] text-2xl sm:text-3xl font-extrabold tracking-tight ${
            highlight ? 'text-[#B8FF00]' : 'text-[#F5F5F5]'
          }`}
        >
          {value}
        </span>
        {trend && (
          <span className="text-[10px] font-mono text-[#B8FF00] font-bold">
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1.5 text-[11px] font-mono text-[#737373] truncate">
          {subtext}
        </p>
      )}
    </div>
  )
}
