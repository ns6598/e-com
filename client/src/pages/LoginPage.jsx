import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
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
      setError('Please provide both your registered salon email and password.')
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

  const handleQuickFill = (type) => {
    setError('')
    if (type === 'patron') {
      setFormData({
        email: 'patron@aureva-studios.demo',
        password: 'AurevaSalon2026!',
      })
    } else if (type === 'admin') {
      setFormData({
        email: 'curator@aureva-studios.demo',
        password: 'AurevaAdmin2026!',
      })
    }
  }

  return (
    <PageTransition className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-white">
      <div className="w-full max-w-md space-y-8">
        {/* Editorial Heading */}
        <div className="text-center space-y-2">
          <span className="tag-overline text-[#D4AF37] font-mono">ATELIER PRIVÉ</span>
          <h1 className="editorial-title text-3xl sm:text-4xl font-serif text-white tracking-tight">
            Patron Sign In
          </h1>
          <p className="text-xs text-gray-400 font-mono tracking-wider max-w-xs mx-auto">
            Access your curated salon acquisitions, saved bespoke silhouettes, and order dispatch records.
          </p>
        </div>

        {/* Demo Account Quick-Fill Card */}
        <div className="glass-panel p-4 rounded-xs border-white/10 space-y-3 bg-[#111420]/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-gray-300">
            <span className="flex items-center gap-1.5 text-[#D4AF37]">
              <Sparkles size={12} />
              <span>TEST CREDENTIALS</span>
            </span>
            <span className="text-[10px] text-gray-500 uppercase">One-Click Fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('patron')}
              className="px-3 py-2 text-[10px] uppercase tracking-wider font-mono border border-white/15 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all cursor-pointer text-left flex flex-col justify-center"
            >
              <span className="font-semibold text-white">Patron (Client)</span>
              <span className="text-gray-400 text-[9px] truncate">patron@aureva-studios.demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="px-3 py-2 text-[10px] uppercase tracking-wider font-mono border border-white/15 bg-white/5 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all cursor-pointer text-left flex flex-col justify-center"
            >
              <span className="font-semibold text-[#D4AF37]">Curator (Admin)</span>
              <span className="text-gray-400 text-[9px] truncate">curator@aureva-studios.demo</span>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-xs border-white/10 space-y-6 bg-[#0E1018]/90 shadow-2xl">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 border border-[#6D202D] bg-[#6D202D]/20 text-red-200 text-xs flex items-center gap-2.5 rounded-xs"
            >
              <AlertCircle size={15} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wider font-mono text-gray-300">
                Salon Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="patron@aureva-studios.demo"
                  required
                  className="w-full bg-[#141724] border border-white/15 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <Mail size={15} className="text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] uppercase tracking-wider font-mono text-gray-300">
                  Password
                </label>
                <span className="text-[10px] text-gray-500 font-mono cursor-not-allowed">
                  Encrypted SHA-256
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#141724] border border-white/15 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <Lock size={15} className="text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Atelier'}
            </Button>
          </form>

          <div className="border-t border-white/10 pt-4 text-center">
            <p className="text-xs text-gray-400 font-mono">
              Do not hold an active account?{' '}
              <Link
                to="/register"
                state={{ from: redirectPath }}
                className="text-[#D4AF37] hover:underline font-semibold"
              >
                Register as Patron
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
