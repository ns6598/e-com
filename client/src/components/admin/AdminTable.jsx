import React from 'react'
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react'

export default function AdminTable({
  columns = [],
  data = [],
  loading = false,
  error = null,
  emptyMessage = 'No records discovered.',
  onRetry,
}) {
  if (loading) {
    return (
      <div className="p-12 text-center border border-[#222222] bg-[#111111] space-y-3">
        <RefreshCw size={24} className="mx-auto text-[#B8FF00] animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-[#A6A6A6]">
          SYNCHRONIZING ATELIER DATA...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center border border-[#8B0000]/60 bg-[#160D0D] space-y-4">
        <AlertCircle size={28} className="mx-auto text-[#FF4D4D]" />
        <div>
          <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-[#FF4D4D]">
            DATA COMMUNICATION ERROR
          </h4>
          <p className="text-xs text-[#A6A6A6] font-mono mt-1 max-w-md mx-auto">
            {error || 'Unable to retrieve administrative resources from backend.'}
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-xs font-mono uppercase tracking-wider text-[#F5F5F5] border border-[#333333] transition-colors cursor-pointer"
          >
            RETRY QUERY
          </button>
        )}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-12 text-center border border-[#222222] bg-[#111111] space-y-3">
        <Inbox size={28} className="mx-auto text-[#555555]" />
        <p className="text-xs font-mono uppercase tracking-widest text-[#A6A6A6]">
          {emptyMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-[#222222] bg-[#111111]">
      <table className="w-full text-left text-xs font-mono">
        <thead className="bg-[#171717] border-b border-[#222222] text-[#A6A6A6] uppercase tracking-wider text-[10px]">
          <tr>
            {columns.map((col, idx) => (
              <th key={col.key || idx} className={`p-3.5 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1F1F1F]">
          {data.map((row, rowIdx) => (
            <tr
              key={row.id || rowIdx}
              className="hover:bg-[#161616] transition-colors group"
            >
              {columns.map((col, colIdx) => (
                <td key={col.key || colIdx} className={`p-3.5 ${col.className || ''}`}>
                  {col.render ? col.render(row, rowIdx) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
