import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, X, ArrowRight } from 'lucide-react'
import { VAULT_TRIGGER_EVENT } from '../../utils/vaultTrigger'

export default function VaultAccessModal() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const openModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  useEffect(() => {
    const handleTriggerEvent = () => {
      openModal()
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal()
      }
      // Alt+V or Ctrl+Shift+V developer/admin accessibility shortcut
      if (
        (e.altKey && (e.key === 'v' || e.key === 'V')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'v' || e.key === 'V'))
      ) {
        e.preventDefault()
        openModal()
      }
    }

    window.addEventListener(VAULT_TRIGGER_EVENT, handleTriggerEvent)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener(VAULT_TRIGGER_EVENT, handleTriggerEvent)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [openModal, closeModal])

  if (!isOpen) return null

  return (
    <div
      id="vault-access-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vault-access-title"
      onClick={closeModal}
    >
      <div
        className="relative w-full max-w-md bg-[#0D0D0D] border border-[#292929] p-8 shadow-2xl text-center space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dismiss Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-[#737373] hover:text-[#F5F5F5] transition-colors p-1 cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Shield Emblem */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#292929] text-[#B8FF00] shadow-[0_0_15px_rgba(184,255,0,0.15)]">
          <Shield size={22} />
        </div>

        {/* Subtle Elegant Transition Display */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono tracking-[0.35em] uppercase text-[#B8FF00] font-semibold block animate-pulse">
            VAULT ACCESS
          </span>
          <h2
            id="vault-access-title"
            className="font-display font-extrabold text-2xl text-[#F5F5F5] uppercase tracking-wide"
          >
            ENTER THE AUREVA VAULT
          </h2>
          <p className="text-xs text-[#A6A6A6] font-mono leading-relaxed">
            Restricted administrative protocol initialized. Authorized personnel only.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-3">
          <button
            id="enter-vault-button"
            onClick={() => {
              closeModal()
              navigate('/vault')
            }}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#B8FF00] hover:bg-[#a6e600] text-[#090909] font-mono font-bold text-xs uppercase tracking-[0.2em] py-3.5 px-6 transition-colors shadow-lg cursor-pointer"
          >
            ENTER THE AUREVA VAULT →
          </button>

          <button
            onClick={closeModal}
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#737373] hover:text-[#A6A6A6] py-1 transition-colors cursor-pointer"
          >
            RETURN TO STOREFRONT
          </button>
        </div>
      </div>
    </div>
  )
}
