import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import PageTransition from '../components/motion/PageTransition'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectPath = location.state?.from || '/account'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!formData.email.trim() || !formData.password) {
      setError('Please provide both your registered email and password.')
      return
    }

    setIsSubmitting(true)
    const result = await login(formData.email.trim(), formData.password)
    setIsSubmitting(false)

    if (result.success) {
      navigate(redirectPath, { replace: true })
    } else {
      setError(result.message || 'Authentication failed. Please verify your credentials.')
    }
  }

  const handleQuickFill = () => {
    setError('')
    setFormData({
      email: 'patron@aureva-studios.demo',
      password: 'AurevaSalon2026!',
    })
  }

  return (
    <PageTransition className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-[#F5F5F5]">
      <div className="w-full max-w-md space-y-8">
        {/* Heading */}
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#B8FF00] block">
            AUREVA PATRON ACCESS
          </span>
          <h1 className="font-['Syne'] text-3xl sm:text-4xl uppercase font-bold tracking-wider text-[#F5F5F5]">
            SIGN IN
          </h1>
          <p className="text-xs text-[#A6A6A6] font-mono tracking-wider max-w-xs mx-auto">
            Access your order tracking, saved wishlist items, and member exclusives.
          </p>
        </div>

        {/* Demo Account Quick-Fill Card */}
        <div className="p-4 bg-[#171717] border border-[#292929] space-y-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#A6A6A6]">
            <span className="flex items-center gap-1.5 text-[#B8FF00] font-bold">
              <span>TEST CREDENTIALS</span>
            </span>
            <span className="text-[10px] text-[#A6A6A6] uppercase">1-CLICK POPULATE</span>
          </div>
          <button
            type="button"
            onClick={handleQuickFill}
            className="w-full px-3 py-2.5 text-[10px] uppercase tracking-wider font-mono border border-[#292929] bg-[#111111] hover:border-[#B8FF00] hover:text-[#B8FF00] transition-all cursor-pointer text-left flex flex-col justify-center"
          >
            <span className="font-bold text-[#F5F5F5]">Customer / Patron</span>
            <span className="text-[#A6A6A6] text-[9px] truncate">patron@aureva-studios.demo</span>
          </button>
        </div>

        {/* Login Form Card */}
        <div className="p-6 sm:p-8 bg-[#111111] border border-[#292929] space-y-6 shadow-2xl">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 border border-[#8B0000] bg-[#171717] text-[#F5F5F5] text-xs flex items-center gap-2.5"
            >
              <AlertCircle size={15} className="shrink-0 text-[#8B0000]" />
              <span className="font-mono text-xs">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider font-mono text-[#A6A6A6]">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="patron@aureva-studios.demo"
                  required
                  className="w-full bg-[#171717] border border-[#292929] pl-10 pr-4 py-3 text-xs text-[#F5F5F5] placeholder:text-[#A6A6A6]/50 focus:outline-none focus:border-[#B8FF00] transition-colors font-mono"
                />
                <Mail size={15} className="text-[#A6A6A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] uppercase tracking-wider font-mono text-[#A6A6A6]">
                  PASSWORD
                </label>
                <span className="text-[10px] uppercase tracking-wider font-mono text-[#A6A6A6]">
                  MIN 8 CHARS
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#171717] border border-[#292929] pl-10 pr-4 py-3 text-xs text-[#F5F5F5] placeholder:text-[#A6A6A6]/50 focus:outline-none focus:border-[#B8FF00] transition-colors font-mono"
                />
                <Lock size={15} className="text-[#A6A6A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#B8FF00] hover:bg-[#cbfb27] text-[#090909] font-['Oswald'] text-sm uppercase tracking-[0.2em] font-bold transition-all shadow-[0_0_15px_rgba(184,255,0,0.2)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-[#090909] border-t-transparent rounded-full animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </span>
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="border-t border-[#292929] pt-4 text-center space-y-3">
            <p className="text-xs text-[#A6A6A6] font-mono">
              Do not possess an AUREVA account?{' '}
              <Link to="/register" className="text-[#B8FF00] hover:underline font-bold">
                Create Account
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#A6A6A6] font-mono">
              <ShieldCheck size={12} className="text-[#B8FF00]" />
              <span>HTTP-ONLY SECURE COOKIE AUTHENTICATION</span>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
