import React, { useState } from 'react'
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

/**
 * NewsletterForm Component
 * Shared across Homepage and Footer for consistent email validation & demo feedback.
 * Explicitly communicates frontend demonstration status without claiming remote subscriptions.
 */
export default function NewsletterForm({ variant = 'light', className = '' }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'success'

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

    // Simulate prompt response without claims of real remote database
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
        className={`p-5 border transition-all animate-in fade-in duration-300 ${
          isDark
            ? 'bg-[#212121] border-[#6D202D]/60 text-[#F6F2EA]'
            : 'bg-[#FAF8F5] border-[#171717]/20 text-[#171717]'
        } ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2
            size={18}
            className={`shrink-0 mt-0.5 ${isDark ? 'text-[#D8D0C4]' : 'text-[#6D202D]'}`}
          />
          <div className="space-y-1.5 text-left">
            <p className="font-serif text-sm font-medium tracking-wide">
              Welcome to the Atelier Dispatch
            </p>
            <p
              className={`text-xs leading-relaxed ${
                isDark ? 'text-[#F6F2EA]/75' : 'text-[#171717]/70'
              }`}
            >
              Your address (<span className="font-mono">{email}</span>) has been recorded for demo dispatches. Apply courtesy code{' '}
              <strong className="font-mono text-[#6D202D] bg-[#6D202D]/10 px-1 py-0.5">
                AUREVA15
              </strong>{' '}
              at checkout for 15% off.
            </p>
            <p
              className={`text-[10px] tracking-wider uppercase font-mono ${
                isDark ? 'text-[#D8D0C4]/60' : 'text-[#171717]/50'
              }`}
            >
              [DEMO DISPATCH — Frontend demonstration only. No remote service contacted.]
            </p>
            <button
              type="button"
              onClick={handleReset}
              className={`text-[11px] underline tracking-widest uppercase transition-colors pt-1 block cursor-pointer ${
                isDark ? 'text-[#D8D0C4] hover:text-[#FFFFFF]' : 'text-[#6D202D] hover:text-[#171717]'
              }`}
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
            ? 'border-[#6D202D]'
            : isDark
            ? 'border-[#F6F2EA]/30 focus-within:border-[#F6F2EA]'
            : 'border-[#171717] focus-within:border-[#6D202D]'
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
          className={`w-full bg-transparent text-xs tracking-[0.16em] uppercase py-2.5 px-2 focus:outline-none transition-colors ${
            isDark
              ? 'text-[#F6F2EA] placeholder:text-[#F6F2EA]/40'
              : 'text-[#171717] placeholder:text-[#171717]/40'
          }`}
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className={`px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer shrink-0 inline-flex items-center justify-center gap-1.5 disabled:opacity-50 ${
            isDark
              ? 'bg-[#F6F2EA] text-[#171717] hover:bg-[#6D202D] hover:text-[#FFFFFF]'
              : 'bg-[#171717] text-[#F6F2EA] hover:bg-[#6D202D] hover:text-[#FFFFFF]'
          }`}
        >
          <span>{status === 'submitting' ? 'VERIFYING...' : 'SUBSCRIBE'}</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Field-level error indicator */}
      {error && (
        <div
          id={`newsletter-error-${variant}`}
          className="flex items-center gap-2 text-xs text-[#6D202D] font-medium pt-1 animate-in fade-in duration-150"
          role="alert"
        >
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <p
        className={`text-[10px] tracking-wider uppercase font-mono ${
          isDark ? 'text-[#F6F2EA]/40' : 'text-[#171717]/40'
        }`}
      >
        Simulated Demo Dispatch • Unsubscribe anytime with zero friction
      </p>
    </form>
  )
}
