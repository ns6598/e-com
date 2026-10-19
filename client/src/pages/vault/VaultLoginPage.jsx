import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Shield, Lock, Mail, AlertTriangle, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function VaultLoginPage() {
  const { vaultLogin, isAuthenticated, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If already logged in as administrator, navigate to dashboard immediately
  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) {
      const target = location.state?.from?.pathname || '/vault/dashboard'
      navigate(target, { replace: true })
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate, location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Both administrator email and password are required.')
      return
    }

    setLoading(true)
    setError('')

    const result = await vaultLogin(email, password)

    if (result.success) {
      const target = location.state?.from?.pathname || '/vault/dashboard'
      navigate(target, { replace: true })
    } else {
      // Exactly handle customer 403 and invalid credentials 401
      if (result.status === 403 || result.message === 'Vault access is restricted.') {
        setError('Vault access is restricted.')
      } else {
        setError(result.message || 'Invalid credentials provided')
      }
      setLoading(false)
    }
  }

  const handleQuickPopulate = (type) => {
    setError('')
    if (type === 'admin') {
      setEmail('admin@aureva.com')
      setPassword('Admin@123')
    } else if (type === 'curator') {
      setEmail('curator@aureva-studios.demo')
      setPassword('AurevaAdmin2026!')
    } else if (type === 'customer') {
      setEmail('patron@aureva-studios.demo')
      setPassword('AurevaSalon2026!')
    }
  }

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col justify-between selection:bg-[#B8FF00] selection:text-[#090909]">
      {/* Top Bar with Discreet Return to Storefront */}
      <div className="px-6 sm:px-12 py-5 flex items-center justify-between border-b border-[#1A1A1A]">
        <Link to="/vault" className="flex items-center gap-2.5">
          <div className="w-5 h-5 bg-[#B8FF00] text-[#090909] font-black text-[10px] flex items-center justify-center font-mono">
            V
          </div>
          <span className="font-['Syne'] font-extrabold text-xs tracking-[0.25em] text-[#F5F5F5]">
            AUREVA VAULT
          </span>
        </Link>
        <Link
          to="/"
          className="text-[10px] uppercase font-mono tracking-wider text-[#737373] hover:text-[#B8FF00] transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={12} />
          <span>CUSTOMER BOUTIQUE</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          {/* Header Branding */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#121212] border border-[#B8FF00]/60 mx-auto flex items-center justify-center text-[#B8FF00] shadow-[0_0_25px_rgba(184,255,0,0.1)]">
              <KeyRound size={22} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#B8FF00] block pt-2">
              RESTRICTED ACCESS
            </span>
            <h1 className="font-['Syne'] text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-[#F5F5F5]">
              VAULT AUTHENTICATION
            </h1>
            <p className="text-xs text-[#888888] font-mono tracking-wider max-w-xs mx-auto">
              Administrator verification required. All entry attempts are recorded in the security audit trail.
            </p>
          </div>

          {/* Quick-Fill Helpers for Testing */}
          <div className="p-3.5 bg-[#101010] border border-[#222222] space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#A6A6A6]">
              <span className="text-[#B8FF00] font-bold">CREDENTIAL TESTING</span>
              <span>1-CLICK QUICK FILL</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPopulate('admin')}
                className="py-1.5 px-2 bg-[#171717] hover:bg-[#202020] border border-[#2B2B2B] hover:border-[#B8FF00] text-[10px] font-mono uppercase tracking-wider text-[#F5F5F5] transition-colors cursor-pointer text-center"
              >
                Admin Root
              </button>
              <button
                type="button"
                onClick={() => handleQuickPopulate('curator')}
                className="py-1.5 px-2 bg-[#171717] hover:bg-[#202020] border border-[#2B2B2B] hover:border-[#B8FF00] text-[10px] font-mono uppercase tracking-wider text-[#F5F5F5] transition-colors cursor-pointer text-center"
              >
                Curator
              </button>
              <button
                type="button"
                onClick={() => handleQuickPopulate('customer')}
                className="py-1.5 px-2 bg-[#171717] hover:bg-[#202020] border border-[#8B0000]/60 hover:border-[#FF4D4D] text-[10px] font-mono uppercase tracking-wider text-[#FF7070] transition-colors cursor-pointer text-center"
                title="Tests Customer 403 Forbidden rejection"
              >
                Customer (403)
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-[#101010] border border-[#222222] p-6 sm:p-8 space-y-5 shadow-2xl"
          >
            {/* Error Banner */}
            {error && (
              <div
                id="vault-login-error"
                className={`p-3.5 text-xs font-mono border flex items-start gap-2.5 ${
                  error === 'Vault access is restricted.'
                    ? 'border-[#8B0000] bg-[#210D0D] text-[#FF4D4D]'
                    : 'border-[#8B0000]/60 bg-[#1A1111] text-[#FF7A7A]'
                }`}
              >
                <AlertTriangle size={16} className="text-[#FF4D4D] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold block">{error}</span>
                  {error === 'Vault access is restricted.' && (
                    <span className="text-[10px] opacity-80 block">
                      Customer accounts cannot access the AUREVA Vault.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="vault-email"
                className="text-[11px] uppercase tracking-widest font-mono text-[#A6A6A6] flex items-center gap-1.5"
              >
                <Mail size={12} className="text-[#737373]" />
                <span>Email</span>
              </label>
              <input
                id="vault-email"
                type="text"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="curator@aureva-studios.demo"
                className="w-full px-3.5 py-3 bg-[#151515] border border-[#2A2A2A] text-xs font-mono text-[#F5F5F5] placeholder-[#555555] focus:outline-none focus:border-[#B8FF00] focus:ring-1 focus:ring-[#B8FF00] transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="vault-password"
                className="text-[11px] uppercase tracking-widest font-mono text-[#A6A6A6] flex items-center gap-1.5"
              >
                <Lock size={12} className="text-[#737373]" />
                <span>Password</span>
              </label>
              <input
                id="vault-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-3 bg-[#151515] border border-[#2A2A2A] text-xs font-mono text-[#F5F5F5] placeholder-[#555555] focus:outline-none focus:border-[#B8FF00] focus:ring-1 focus:ring-[#B8FF00] transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              id="access-vault-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#B8FF00] hover:bg-[#D1FF38] text-[#090909] font-['Syne'] font-extrabold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(184,255,0,0.15)] mt-6"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#090909] border-t-transparent rounded-full animate-spin" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <span>ACCESS VAULT</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Security Footer Notice */}
      <div className="px-6 py-4 border-t border-[#141414] text-center text-[10px] font-mono text-[#555555] uppercase tracking-wider">
        <span>AUREVA SECURE VAULT GATEWAY • UNAUTHORIZED ACCESS PROHIBITED</span>
      </div>
    </div>
  )
}
