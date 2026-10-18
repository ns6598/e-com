import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import PageTransition from '../components/motion/PageTransition'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectPath = location.state?.from || '/account'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Please provide your full legal name.')
      return
    }
    if (!formData.email.trim()) {
      setError('A valid email address is required.')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('The passwords entered do not match.')
      return
    }

    setIsSubmitting(true)
    const result = await register(formData.email.trim(), formData.password, formData.name.trim())
    setIsSubmitting(false)

    if (result.success) {
      navigate(redirectPath, { replace: true })
    } else {
      setError(result.message || 'Registration failed. An account may already exist with this email.')
    }
  }

  return (
    <PageTransition className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-[#F5F5F5]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#B8FF00] block">
            AUREVA PATRON MEMBERSHIP
          </span>
          <h1 className="font-['Syne'] text-3xl sm:text-4xl uppercase font-bold tracking-wider text-[#F5F5F5]">
            CREATE ACCOUNT
          </h1>
          <p className="text-xs text-[#A6A6A6] font-mono tracking-wider max-w-xs mx-auto">
            Create your account to unlock order tracking, wishlist synchronization, and early drop alerts.
          </p>
        </div>

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
                FULL NAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Vance"
                  required
                  className="w-full bg-[#171717] border border-[#292929] pl-10 pr-4 py-3 text-xs text-[#F5F5F5] placeholder:text-[#A6A6A6]/50 focus:outline-none focus:border-[#B8FF00] transition-colors font-mono"
                />
                <User size={15} className="text-[#A6A6A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider font-mono text-[#A6A6A6]">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@aureva-fashion.com"
                  required
                  className="w-full bg-[#171717] border border-[#292929] pl-10 pr-4 py-3 text-xs text-[#F5F5F5] placeholder:text-[#A6A6A6]/50 focus:outline-none focus:border-[#B8FF00] transition-colors font-mono"
                />
                <Mail size={15} className="text-[#A6A6A6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider font-mono text-[#A6A6A6]">
                PASSWORD (MIN 8 CHARACTERS)
              </label>
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

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider font-mono text-[#A6A6A6]">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                    <span>REGISTERING...</span>
                  </span>
                ) : (
                  <>
                    <span>CREATE PATRON ACCOUNT</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="border-t border-[#292929] pt-4 text-center space-y-3">
            <p className="text-xs text-[#A6A6A6] font-mono">
              Already possess an AUREVA account?{' '}
              <Link to="/login" className="text-[#B8FF00] hover:underline font-bold">
                Sign In
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#A6A6A6] font-mono">
              <ShieldCheck size={12} className="text-[#B8FF00]" />
              <span>SECURE BCRYPT PASSWORD ENCRYPTION</span>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
