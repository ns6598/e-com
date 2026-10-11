import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
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
      setError('Please provide your full patron name.')
      return
    }
    if (!formData.email.trim()) {
      setError('A valid salon email address is required.')
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
    <PageTransition className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <span className="tag-overline text-[#D4AF37] font-mono">CLIENT ADMISSION</span>
          <h1 className="editorial-title text-3xl sm:text-4xl font-serif text-white tracking-tight">
            Register As Patron
          </h1>
          <p className="text-xs text-gray-400 font-mono tracking-wider max-w-xs mx-auto">
            Create your bespoke profile to enjoy priority runway allocations, order tracking, and complimentary white-glove courier services.
          </p>
        </div>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wider font-mono text-gray-300">
                Full Legal Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Elena Rostova"
                  required
                  className="w-full bg-[#141724] border border-white/15 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <User size={15} className="text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wider font-mono text-gray-300">
                Salon Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="patron@domain.com"
                  required
                  className="w-full bg-[#141724] border border-white/15 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <Mail size={15} className="text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wider font-mono text-gray-300">
                Password (min 8 characters)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  required
                  minLength={8}
                  className="w-full bg-[#141724] border border-white/15 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <Lock size={15} className="text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wider font-mono text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#141724] border border-white/15 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <Lock size={15} className="text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Establishing Profile...' : 'Create Patron Account'}
              </Button>
            </div>
          </form>

          <div className="border-t border-white/10 pt-4 text-center">
            <p className="text-xs text-gray-400 font-mono">
              Already possess an active salon account?{' '}
              <Link
                to="/login"
                state={{ from: redirectPath }}
                className="text-[#D4AF37] hover:underline font-semibold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
