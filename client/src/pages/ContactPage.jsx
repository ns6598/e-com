import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ArrowRight,
  Send,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react'
import api from '../services/api'
import PageTransition from '../components/motion/PageTransition'

const FAQ_ITEMS = [
  {
    id: 'faq-shipping',
    category: 'SHIPPING & DISPATCH',
    question: "What is AUREVA's dispatch timeline and delivery courier?",
    answer:
      'We provide complimentary standard express delivery on orders of ₹2,999 and above. Orders below ₹2,999 carry a nominal flat rate of ₹199. Major metropolitan destinations arrive within 2 to 4 business days. All dispatches include real-time signature courier tracking.',
  },
  {
    id: 'faq-returns',
    category: 'RETURNS & EXCHANGES',
    question: 'What is your return and size exchange policy?',
    answer:
      'We provide a 14-day hassle-free return and size exchange window from the date of physical receipt. Garments must remain unwashed, unworn, and in original packaging with all security tags intact.',
  },
  {
    id: 'faq-sizing',
    category: 'FIT & SIZING',
    question: 'How do AUREVA dark alternative silhouettes fit?',
    answer:
      'Our pieces are engineered with deliberate darkwear volume, dropped shoulder seams, and relaxed kinetic drape. Choose your standard size for the intended oversized alternative silhouette, or size down if you prefer a tighter fit. Refer to the size guide on any product page.',
  },
  {
    id: 'faq-care',
    category: 'FABRIC CARE',
    question: 'How should I care for dark-dyed garments, hardware, and fabrics?',
    answer:
      'Wash cold (under 30°C) inside out with mild liquid detergent to preserve deep obsidian dyes. Air dry away from direct scorching sun. For garments featuring metal hardware or vegan leather trims, avoid bleach and tumble drying.',
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submittedMessage, setSubmittedMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [openFaqId, setOpenFaqId] = useState('faq-shipping')

  const validateField = (name, value) => {
    const val = (value || '').trim()
    switch (name) {
      case 'name':
        if (!val) return 'Full name is required.'
        if (val.length < 2) return 'Minimum 2 characters required.'
        return ''
      case 'email':
        if (!val) return 'Email address is required.'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          return 'Please provide a valid email format (e.g. name@domain.com).'
        }
        return ''
      case 'subject':
        if (!val) return 'Subject line is required.'
        if (val.length < 3) return 'Subject must be at least 3 characters.'
        return ''
      case 'message':
        if (!val) return 'Message is required.'
        if (val.length < 10) return 'Please provide at least 10 characters detailing your inquiry.'
        return ''
      default:
        return ''
    }
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const errorMsg = validateField(field, formData[field])
    setErrors((prev) => ({ ...prev, [field]: errorMsg }))
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (touched[field]) {
      const errorMsg = validateField(field, value)
      setErrors((prev) => ({ ...prev, [field]: errorMsg }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError(null)

    const allTouched = { name: true, email: true, subject: true, message: true }
    setTouched(allTouched)

    const newErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      subject: validateField('subject', formData.subject),
      message: validateField('message', formData.message),
    }
    setErrors(newErrors)

    const hasErrors = Object.values(newErrors).some(Boolean)
    if (hasErrors) {
      return
    }

    setIsSubmitting(true)

    try {
      // Connect to real backend REST endpoint POST /api/contact
      const response = await api.post('/contact', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      })

      const data = response?.data || response
      setSubmittedMessage({
        ref: data?.id || `INQ-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      })
    } catch (err) {
      console.error('[ContactPage] Submission Error:', err)
      setApiError(err.message || 'Unable to submit your inquiry. Please verify your details and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setSubmittedMessage(null)
    setFormData({ name: '', email: '', subject: '', message: '' })
    setErrors({})
    setTouched({})
    setApiError(null)
  }

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id))
  }

  return (
    <PageTransition className="space-y-20 sm:space-y-28 py-6 sm:py-12 text-[#F5F5F5]">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#292929] pb-8 sm:pb-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-6 border-b border-[#292929] mb-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#B8FF00] block">
                AUREVA CONCIERGE & SUPPORT
              </span>
              <p className="text-xs uppercase tracking-[0.2em] text-[#A6A6A6] font-mono mt-0.5">
                DARK ALTERNATIVE ATELIER DISPATCH
              </p>
            </div>
            <Link
              to="/shop"
              className="text-xs uppercase tracking-[0.2em] font-['Oswald'] font-bold text-[#B8FF00] hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              <span>EXPLORE ALL DROPS</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-3">
              <h1 className="font-['Syne'] text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#F5F5F5]">
                CONTACT AUREVA
              </h1>
              <p className="text-sm text-[#A6A6A6] max-w-2xl font-sans leading-relaxed">
                Have questions regarding a drop, sizing, order dispatch, or custom collaboration? Send our client concierge a direct dispatch below.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form and Details */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left: Contact Form or Confirmation */}
          <div className="lg:col-span-7">
            {submittedMessage ? (
              <div className="p-8 sm:p-10 bg-[#171717] border border-[#B8FF00]/40 space-y-6">
                <div className="inline-flex p-3 rounded-full bg-[#111111] border border-[#B8FF00]/50 text-[#B8FF00]">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B8FF00] block">
                    INQUIRY RECORD ARCHIVED
                  </span>
                  <h3 className="font-['Syne'] text-2xl uppercase font-bold text-[#F5F5F5]">
                    MESSAGE RECEIVED
                  </h3>
                  <p className="text-xs text-[#A6A6A6] font-mono leading-relaxed">
                    Thank you, <strong className="text-[#F5F5F5]">{submittedMessage.name}</strong>. Your inquiry has been securely stored in our PostgreSQL database under reference ID <strong className="text-[#B8FF00] font-mono">{submittedMessage.ref}</strong>.
                  </p>
                </div>

                <div className="p-4 bg-[#111111] border border-[#292929] text-xs font-mono space-y-2 text-[#A6A6A6]">
                  <div className="flex justify-between">
                    <span>DISPATCH REF:</span>
                    <span className="text-[#F5F5F5] font-bold">{submittedMessage.ref}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SENDER EMAIL:</span>
                    <span className="text-[#F5F5F5]">{submittedMessage.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SUBJECT:</span>
                    <span className="text-[#F5F5F5]">{submittedMessage.subject}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 bg-[#B8FF00] hover:bg-[#cbfb27] text-[#090909] font-['Oswald'] text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
                  >
                    SEND ANOTHER MESSAGE
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 bg-[#111111] border border-[#292929] space-y-6 shadow-2xl" noValidate>
                <div className="border-b border-[#292929] pb-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#B8FF00] block">
                    CLIENT DISPATCH
                  </span>
                  <h2 className="font-['Oswald'] uppercase text-xl font-bold tracking-wider text-[#F5F5F5] mt-1">
                    SUBMIT INQUIRY
                  </h2>
                </div>

                {apiError && (
                  <div className="p-3.5 border border-[#8B0000] bg-[#171717] text-[#F5F5F5] text-xs flex items-center gap-2 font-mono">
                    <AlertCircle size={15} className="shrink-0 text-[#8B0000]" />
                    <span>{apiError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono flex justify-between">
                      <span>NAME *</span>
                      {touched.name && errors.name && <span className="text-[#8B0000]">{errors.name}</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      placeholder="e.g. Alex Vance"
                      className={`w-full bg-[#171717] border p-3 text-xs text-[#F5F5F5] placeholder:text-[#A6A6A6]/40 focus:outline-none transition-colors font-mono ${
                        touched.name && errors.name ? 'border-[#8B0000]' : 'border-[#292929] focus:border-[#B8FF00]'
                      }`}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono flex justify-between">
                      <span>EMAIL *</span>
                      {touched.email && errors.email && <span className="text-[#8B0000]">{errors.email}</span>}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="alex@aureva-fashion.com"
                      className={`w-full bg-[#171717] border p-3 text-xs text-[#F5F5F5] placeholder:text-[#A6A6A6]/40 focus:outline-none transition-colors font-mono ${
                        touched.email && errors.email ? 'border-[#8B0000]' : 'border-[#292929] focus:border-[#B8FF00]'
                      }`}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono flex justify-between">
                    <span>SUBJECT *</span>
                    {touched.subject && errors.subject && <span className="text-[#8B0000]">{errors.subject}</span>}
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    onBlur={() => handleBlur('subject')}
                    placeholder="e.g. Sizing inquiry regarding Obsidian Trench Coat"
                    className={`w-full bg-[#171717] border p-3 text-xs text-[#F5F5F5] placeholder:text-[#A6A6A6]/40 focus:outline-none transition-colors font-mono ${
                      touched.subject && errors.subject ? 'border-[#8B0000]' : 'border-[#292929] focus:border-[#B8FF00]'
                    }`}
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#A6A6A6] font-mono flex justify-between">
                    <span>MESSAGE *</span>
                    {touched.message && errors.message && <span className="text-[#8B0000]">{errors.message}</span>}
                  </label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    onBlur={() => handleBlur('message')}
                    placeholder="Provide details about your question, order number, or custom request..."
                    className={`w-full bg-[#171717] border p-3 text-xs text-[#F5F5F5] placeholder:text-[#A6A6A6]/40 focus:outline-none transition-colors font-mono resize-none ${
                      touched.message && errors.message ? 'border-[#8B0000]' : 'border-[#292929] focus:border-[#B8FF00]'
                    }`}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#B8FF00] hover:bg-[#cbfb27] text-[#090909] font-['Oswald'] text-sm uppercase tracking-[0.2em] font-bold transition-all shadow-[0_0_15px_rgba(184,255,0,0.2)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-[#090909] border-t-transparent rounded-full animate-spin" />
                        <span>TRANSMITTING MESSAGE...</span>
                      </span>
                    ) : (
                      <>
                        <span>SEND MESSAGE</span>
                        <Send size={15} />
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-[#A6A6A6] font-mono uppercase tracking-widest mt-2 flex items-center justify-center gap-1.5">
                    <ShieldCheck size={12} className="text-[#B8FF00]" />
                    <span>POSTGRESQL-BACKED CONCIERGE QUEUE</span>
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Right: Studio Direct Channels & Concierge Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-[#171717] border border-[#292929] space-y-5">
              <h3 className="font-['Oswald'] uppercase text-lg font-bold tracking-wider text-[#F5F5F5] border-b border-[#292929] pb-3">
                STUDIO DIRECT CHANNELS
              </h3>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-[#B8FF00] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#A6A6A6] uppercase text-[10px] block">CLIENT INQUIRIES</span>
                    <a href="mailto:concierge@aureva-fashion.com" className="text-[#F5F5F5] hover:text-[#B8FF00] transition-colors font-bold">
                      concierge@aureva-fashion.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-[#B8FF00] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#A6A6A6] uppercase text-[10px] block">DISPATCH HOTLINE</span>
                    <a href="tel:+911800287382" className="text-[#F5F5F5] hover:text-[#B8FF00] transition-colors font-bold">
                      +91 (1800) AUREVA-HOTLINE
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-[#B8FF00] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#A6A6A6] uppercase text-[10px] block">CONCIERGE HOURS</span>
                    <span className="text-[#F5F5F5]">Mon – Sat • 10:00 to 20:00 IST</span>
                    <p className="text-[10px] text-[#A6A6A6] mt-0.5">Average dispatch response under 4 business hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Sizing and Delivery Card */}
            <div className="p-6 bg-[#111111] border border-[#292929] space-y-3">
              <h4 className="font-['Oswald'] uppercase text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
                <HelpCircle size={15} className="text-[#B8FF00]" />
                <span>EXPRESS COURIER GUARANTEE</span>
              </h4>
              <p className="text-xs text-[#A6A6A6] leading-relaxed font-sans">
                Complimentary tracked express shipping on orders over ₹2,999. Garments are hand-inspected, packed in archival protective garment sleeves, and dispatched via insured courier.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#292929] pt-16">
        <div className="text-center space-y-2 mb-12">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#B8FF00] block">
            KNOWLEDGE ARCHIVE
          </span>
          <h2 className="font-['Syne'] text-3xl sm:text-4xl uppercase font-bold tracking-wider text-[#F5F5F5]">
            FREQUENTLY ASKED QUESTIONS
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQ_ITEMS.map((item) => (
            <div
              key={item.id}
              className="border border-[#292929] bg-[#111111] overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleFaq(item.id)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#171717] transition-colors"
              >
                <div>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-[#B8FF00] block mb-1">
                    {item.category}
                  </span>
                  <span className="font-['Oswald'] text-base uppercase font-bold text-[#F5F5F5]">
                    {item.question}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-[#A6A6A6] shrink-0 transition-transform duration-300 ${
                    openFaqId === item.id ? 'rotate-180 text-[#B8FF00]' : ''
                  }`}
                />
              </button>
              {openFaqId === item.id && (
                <div className="p-4 sm:p-5 pt-0 border-t border-[#292929]/50 text-xs text-[#A6A6A6] leading-relaxed font-sans">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </PageTransition>
  )
}
