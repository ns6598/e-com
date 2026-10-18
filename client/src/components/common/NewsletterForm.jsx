import React, { useState } from 'react'
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import api from '../../services/api'

/**
 * Editorial Newsletter Form Component
 * Connected directly to backend API (/api/newsletter/subscribe) with server-side validation.
 * Styled in warm ivory (#F6F2EA), ink black (#171717), and oxblood (#6D202D).
 */
export default function NewsletterForm({ variant = 'dark', className = '' }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')
  const [serverMessage, setServerMessage] = useState('')

  const isDark = variant === 'dark'

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = (email || '').trim()
    if (!trimmed) {
      setError('Please enter your email address to receive salon dispatches.')
      return
    }

    setError('')
    setStatus('submitting')

    try {
      const res = await api.post('/newsletter/subscribe', { email: trimmed })
      setStatus('success')
      setServerMessage(res.message || 'You have been enrolled in the AUREVA Atelier Dispatch.')
    } catch (err) {
      setStatus('idle')
      setError(err.message || 'Unable to subscribe at this moment. Please verify your address.')
    }
  }

  const handleReset = () => {
    setStatus('idle')
    setEmail('')
    setError('')
    setServerMessage('')
  }

  if (status === 'success') {
    return (
      <div
        className={`p-6 border ${
          isDark
            ? 'border-[#D8D0C4]/20 bg-[#171717] text-[#F6F2EA]'
            : 'border-[#171717]/15 bg-[#F6F2EA] text-[#171717]'
        } text-left transition-all animate-in fade-in duration-300 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3.5">
          <CheckCircle2
            size={18}
            className="shrink-0 mt-0.5 text-[#6D202D]"
          />
          <div className="space-y-2">
            <p className="font-serif text-base tracking-wide font-medium">
              Welcome to the AUREVA Atelier
            </p>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-[#D8D0C4]' : 'text-[#77716A]'}`}>
              {serverMessage} Apply code{' '}
              <strong className="font-mono bg-[#6D202D] text-white px-1.5 py-0.5 text-[10px] tracking-wider uppercase">
                AUREVA15
              </strong>{' '}
              for 15% off your inaugural order.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="text-[10px] underline tracking-[0.2em] uppercase transition-colors pt-1 block cursor-pointer text-[#6D202D] hover:opacity-80"
            >
              Enroll another address
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`space-y-3.5 ${className}`}>
      <div
        className={`flex flex-col sm:flex-row gap-0 border transition-all ${
          error
            ? 'border-[#6D202D]'
            : isDark
            ? 'border-[#D8D0C4]/30 focus-within:border-[#F6F2EA]'
            : 'border-[#171717]/30 focus-within:border-[#171717]'
        }`}
      >
        <label htmlFor={`newsletter-email-${variant}`} className="sr-only">
          Email address for AUREVA fashion dispatches
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
          className={`w-full bg-transparent text-xs tracking-[0.18em] uppercase py-3.5 px-4 focus:outline-none transition-colors font-mono ${
            isDark
              ? 'text-[#F6F2EA] placeholder:text-[#D8D0C4]/50'
              : 'text-[#171717] placeholder:text-[#77716A]'
          }`}
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="px-7 py-3.5 text-[10px] uppercase tracking-[0.25em] font-semibold transition-all cursor-pointer shrink-0 inline-flex items-center justify-center gap-2 disabled:opacity-50 bg-[#171717] text-[#F6F2EA] hover:bg-[#6D202D] hover:text-white border-l border-[#D8D0C4]/20"
        >
          {status === 'submitting' ? (
            <>
              <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
              <span>ENROLLING...</span>
            </>
          ) : (
            <>
              <span>SUBSCRIBE</span>
              <ArrowRight size={13} />
            </>
          )}
        </button>
      </div>

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

      <p className={`text-[10px] tracking-wider uppercase font-mono ${isDark ? 'text-[#D8D0C4]/60' : 'text-[#77716A]'}`}>
        Encrypted Atelier Dispatch • Instant Unsubscribe • Zero Spam
      </p>
    </form>
  )
}
