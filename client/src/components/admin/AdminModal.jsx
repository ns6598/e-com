import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export default function AdminModal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidth} bg-[#111111] border border-[#2A2A2A] shadow-2xl z-10 max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#222222] flex items-center justify-between bg-[#141414]">
          <h3 className="font-['Syne'] text-base font-bold uppercase tracking-wider text-[#F5F5F5]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#A6A6A6] hover:text-[#F5F5F5] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {children}
        </div>
      </div>
    </div>
  )
}
