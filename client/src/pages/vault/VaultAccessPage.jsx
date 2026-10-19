import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react'

export default function VaultAccessPage() {
  const navigate = useNavigate()
  const [opening, setOpening] = useState(false)

  const handleEnterVault = () => {
    setOpening(true)
    setTimeout(() => {
      navigate('/vault/login')
    }, 700)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col justify-between selection:bg-[#B8FF00] selection:text-[#050505] relative overflow-hidden">
      {/* Background Architectural Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#F5F5F5_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />

      {/* Top Discreet Header */}
      <header className="px-6 sm:px-12 py-6 flex items-center justify-between border-b border-[#1A1A1A] relative z-10">
        <Link
          to="/"
          className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#737373] hover:text-[#B8FF00] transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={13} />
          <span>RETURN TO STOREFRONT</span>
        </Link>

        <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#555555]">
          PROTOCOL SEC-MMXXVI
        </span>
      </header>

      {/* Central Vault Door Interface */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-lg w-full text-center space-y-8"
        >
          {/* Emblem Monogram */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            {/* Outer Rotating Geometric Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-dashed border-[#2A2A2A]"
            />
            {/* Inner Ring */}
            <div className="w-16 h-16 rounded-full bg-[#0D0D0D] border border-[#222222] flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <KeyRound size={22} className="text-[#B8FF00] opacity-90" />
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#737373] block">
              AUREVA
            </span>
            <h1 className="font-['Syne'] font-black text-4xl sm:text-5xl uppercase tracking-[0.18em] text-[#F5F5F5] leading-tight">
              THE VAULT
            </h1>
            <p className="font-mono text-xs text-[#A6A6A6] tracking-[0.25em] uppercase pt-1">
              "Restricted access."
            </p>
          </div>

          {/* Vault Security Monograph */}
          <div className="p-4 bg-[#0A0A0A] border border-[#1F1F1F] text-[11px] font-mono text-[#666666] tracking-wider leading-relaxed">
            Curator access point. Administrative privilege and authentication credentials required.
          </div>

          {/* Action Trigger */}
          <div className="pt-2">
            <button
              id="enter-vault-button"
              type="button"
              onClick={handleEnterVault}
              disabled={opening}
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-[#141414] hover:bg-[#B8FF00] text-[#F5F5F5] hover:text-[#050505] border border-[#2E2E2E] hover:border-[#B8FF00] font-['Syne'] font-extrabold text-xs uppercase tracking-[0.25em] transition-all duration-300 shadow-xl cursor-pointer"
            >
              <span>{opening ? 'ACCESSING...' : 'ENTER VAULT'}</span>
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1 duration-200"
              />
            </button>
          </div>
        </motion.div>
      </main>

      {/* Bottom Legal Security Footer */}
      <footer className="px-6 sm:px-12 py-5 border-t border-[#141414] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-[#555555] tracking-widest relative z-10">
        <span>AUREVA STUDIOS LTD • CURATORIAL ENCLAVE</span>
        <span>AUDITED ENTRY POINT • ROLE VERIFICATION MANDATORY</span>
      </footer>
    </div>
  )
}
