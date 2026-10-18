import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Shield, Lock, User, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminLoginPage() {
  const { adminLogin, isAuthenticated, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If already logged in as admin, redirect immediately
  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) {
      const target = location.state?.from?.pathname || '/admin/dashboard'
      navigate(target, { replace: true })
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate, location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!identifier.trim() || !password) {
      setError('Both administrator username/email and password are required.')
      return
    }

    setLoading(true)
    setError('')

    const result = await adminLogin(identifier, password)
    if (result.success) {
      const target = location.state?.from?.pathname || '/admin/dashboard'
      navigate(target, { replace: true })
    } else {
      setError(result.message || 'Access denied: invalid administrative credentials.')
      setLoading(false)
    }
  }

  const handleQuickPopulate = (type) => {
    setError('')
    if (type === 'root') {
      setIdentifier('admin')
      setPassword('Admin@123')
    } else if (type === 'curator') {
      setIdentifier('curator@aureva-studios.demo')
      setPassword('AurevaAdmin2026!')
    }
  }

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col justify-between selection:bg-[#B8FF00] selection:text-[#090909]">
      {/* Top Bar with Discreet Return */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-[#1A1A1A]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#B8FF00] text-[#090909] font-black text-[10px] flex items-center justify-center">
            A
          </div>
          <span className="font-['Syne'] font-extrabold text-xs tracking-[0.25em] text-[#F5F5F5]">
            AUREVA
          </span>
        </div>
        <a
          href="/"
          className="text-[10px] uppercase font-mono tracking-wider text-[#737373] hover:text-[#B8FF00] transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={12} />
          <span>CUSTOMER BOUTIQUE</span>
        </a>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Header Branding */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#121212] border border-[#B8FF00]/60 mx-auto flex items-center justify-center text-[#B8FF00] shadow-[0_0_25px_rgba(184,255,0,0.1)]">
              <Shield size={24} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#B8FF00] block pt-2">
              RESTRICTED ADMINISTRATIVE SECTOR
            </span>
            <h1 className="font-['Syne'] text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-[#F5F5F5]">
              ATELIER CONSOLE
            </h1>
            <p className="text-xs text-[#888888] font-mono tracking-wider max-w-xs mx-auto">
              Authorized personnel only. All access attempts are recorded in the security audit trail.
            </p>
          </div>

          {/* Quick-Fill Helper for Authorized Admin Testing */}
          <div className="p-3.5 bg-[#101010] border border-[#222222] space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#A6A6A6]">
              <span className="text-[#B8FF00] font-bold">ADMIN CREDENTIALS</span>
              <span>1-CLICK QUICK FILL</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPopulate('root')}
                className="p-2 border border-[#262626] bg-[#161616] hover:border-[#B8FF00] hover:text-[#B8FF00] text-left transition-all cursor-pointer font-mono text-[10px]"
              >
                <span className="block font-bold text-[#F5F5F5]">Root Admin</span>
                <span className="text-[#737373] text-[9px]">admin / Admin@123</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPopulate('curator')}
                className="p-2 border border-[#262626] bg-[#161616] hover:border-[#B8FF00] hover:text-[#B8FF00] text-left transition-all cursor-pointer font-mono text-[10px]"
              >
                <span className="block font-bold text-[#F5F5F5]">Lead Curator</span>
                <span className="text-[#737373] text-[9px]">curator / AurevaAdmin2026!</span>
              </button>
            </div>
          </div>

          {/* Form Box */}
          <div className="p-6 sm:p-8 bg-[#111111] border border-[#262626] space-y-5 shadow-2xl">
            {error && (
              <div className="p-3.5 border border-[#8B0000] bg-[#1A0E0E] text-[#FF6B6B] text-xs flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0 text-[#FF4D4D]" />
                <span className="font-mono text-xs">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username / Email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-mono text-[#A6A6A6]">
                  ADMIN IDENTIFIER (USERNAME OR EMAIL)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                    <User size={15} />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin or admin@aureva.com"
                    autoComplete="username"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#171717] border border-[#292929] text-xs text-[#F5F5F5] font-mono placeholder-[#555555] focus:outline-none focus:border-[#B8FF00] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-mono text-[#A6A6A6]">
                  SECURITY PASSPHRASE
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                    <Lock size={15} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#171717] border border-[#292929] text-xs text-[#F5F5F5] font-mono placeholder-[#555555] focus:outline-none focus:border-[#B8FF00] transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-[#B8FF00] text-[#090909] font-['Syne'] font-extrabold text-xs uppercase tracking-[0.18em] hover:bg-[#D1FF38] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>AUTHENTICATING CURATOR...</span>
                ) : (
                  <>
                    <span>AUTHENTICATE & ENTER CONSOLE</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Security Disclaimer Footer */}
      <div className="py-4 px-6 text-center text-[10px] font-mono text-[#555555] tracking-widest uppercase border-t border-[#141414]">
        AUREVA SECURITY PROTOCOL • ISO 27001 COMPLIANT • END-TO-END ENCRYPTED
      </div>
    </div>
  )
}
