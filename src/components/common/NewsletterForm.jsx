import React, { useState } from 'react'
import { AlertCircle, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'

/**
 * NewsletterForm Component
 * Shared across Homepage and Footer for email validation & demo feedback.
 * Elevated with Neo-Luxury Noir styling and gold interactive states.
 */
export default function NewsletterForm({ variant = 'dark', className = '' }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')

  const isDark = variant === 'dark'

  const validateEmail = (val) => {
    const trimmed = (val || '').trim()
    if (!trimmed) {
      return 'Please enter your email address to receive salon dispatches.'
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(trimmed)) {
      return 'Please provide a valid email format (e.g., name@domain.com).'
    }
    return ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationError = validateEmail(email)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setStatus('submitting')

    setTimeout(() => {
      setStatus('success')
    }, 400)
  }

  const handleReset = () => {
    setStatus('idle')
    setEmail('')
    setError('')
  }

  if (status === 'success') {
    return (
      <div
        className={`p-5 glass-panel-gold rounded-xs transition-all animate-in fade-in duration-300 text-white ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2
            size={18}
            className="shrink-0 mt-0.5 text-[#D4AF37]"
          />
          <div className="space-y-1.5 text-left">
            <p className="font-serif text-sm font-medium tracking-wide text-white">
              Welcome to the Atelier Dispatch
            </p>
            <p className="text-xs leading-relaxed text-gray-300">
              Your address (<span className="font-mono text-[#D4AF37]">{email}</span>) has been recorded for demo dispatches. Apply courtesy code{' '}
              <strong className="font-mono text-[#08090D] gold-gradient-bg px-1.5 py-0.5 font-bold">
                AUREVA15
              </strong>{' '}
              at checkout for 15% off.
            </p>
            <p className="text-[10px] tracking-wider uppercase font-mono text-gray-400">
              [DEMO DISPATCH — Frontend demonstration. No remote service contacted.]
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] underline tracking-widest uppercase transition-colors pt-1 block cursor-pointer text-[#D4AF37] hover:text-white"
            >
              Register another address
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`space-y-3 ${className}`}>
      <div
        className={`flex flex-col sm:flex-row gap-2 border-b transition-colors pb-1 ${
          error
            ? 'border-[#A3283E]'
            : 'border-white/20 focus-within:border-[#D4AF37]'
        }`}
      >
        <label htmlFor={`newsletter-email-${variant}`} className="sr-only">
          Email address for atelier newsletter dispatch
        </label>
        <input
          id={`newsletter-email-${variant}`}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError('')
          }}
          placeholder="ENTER YOUR EMAIL FOR SALON ACCESS"
          disabled={status === 'submitting'}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `newsletter-error-${variant}` : undefined}
          className="w-full bg-transparent text-xs tracking-[0.16em] uppercase py-2.5 px-2 focus:outline-none transition-colors text-white placeholder:text-gray-500 font-mono"
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold transition-all cursor-pointer shrink-0 inline-flex items-center justify-center gap-1.5 disabled:opacity-50 gold-gradient-bg text-[#08090D] hover:opacity-90 shadow-sm"
        >
          <span>{status === 'submitting' ? 'VERIFYING...' : 'SUBSCRIBE'}</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {error && (
        <div
          id={`newsletter-error-${variant}`}
          className="flex items-center gap-2 text-xs text-[#E57373] font-medium pt-1 animate-in fade-in duration-150"
          role="alert"
        >
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-[10px] tracking-wider uppercase font-mono text-gray-500">
        Simulated Demo Dispatch • Unsubscribe anytime with zero friction
      </p>
    </form>
  )
}
