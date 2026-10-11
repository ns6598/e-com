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
  Sparkles,
} from 'lucide-react'
import Button from '../components/ui/Button'

// FAQ Data covering Shipping, Returns, Sizing, Orders, and Maintenance
const FAQ_ITEMS = [
  {
    id: 'faq-shipping',
    category: 'Shipping & Delivery',
    question: "What is AUREVA's delivery timeline and shipping policy?",
    answer:
      'We provide complimentary white-glove courier delivery on all orders of ₹25,000 and above. Orders below ₹25,000 carry a standard courier fee of ₹1,500. Standard delivery timeframes are 3 to 5 business days for major metropolitan areas. Each shipment is packaged in archival garment sleeves and tracked with real-time signature courier dispatches.',
  },
  {
    id: 'faq-returns',
    category: 'Returns & Exchanges',
    question: 'What is your complimentary return and exchange window?',
    answer:
      'We offer a 14-day return and exchange window from the date of package delivery. Garments must remain in unworn, unwashed condition with all original studio seals, ribbon tags, and dust covers intact. Complimentary courier collection can be arranged directly through our concierge.',
  },
  {
    id: 'faq-sizing',
    category: 'Sizing & Proportions',
    question: 'How do AUREVA silhouettes fit and which size should I select?',
    answer:
      'Our garments are engineered with deliberate architectural volume, dropped shoulder seams, and relaxed kinetic drape. We recommend choosing your standard size for the intended editorial runway silhouette. If you prefer a closer, traditional tailored fit, we suggest ordering one size down. Comprehensive dimensions are available in the Size Guide on each product detail page.',
  },
  {
    id: 'faq-demo',
    category: 'Order Questions',
    question: 'How does demo order creation and checkout work on this website?',
    answer:
      'This website is an interactive frontend demonstration. You can browse silhouettes, curate a shopping bag, test coupon codes (such as AUREVA15 or AUREVA10), and experience our complete checkout flow. No real credit card details are ever collected, and no actual financial transactions or order fulfillment will occur.',
  },
  {
    id: 'faq-care',
    category: 'Care & Maintenance',
    question: 'How should I care for dense wools, silks, and vegetal-tanned leathers?',
    answer:
      'We recommend professional specialist dry cleaning for all double-faced virgin wools, tailored outerwear, and mulberry silk items. Vegetal-tanned leather goods should be conditioned twice annually with neutral wax balm and rested in their protective breathable cotton bags away from prolonged sun exposure.',
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
  const [submittedOrder, setSubmittedOrder] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [openFaqId, setOpenFaqId] = useState('faq-shipping')

  const validateField = (name, value) => {
    const val = (value || '').trim()
    switch (name) {
      case 'name':
        if (!val) return 'Full name is required.'
        if (val.length < 2) return 'Please provide at least 2 characters.'
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
        if (!val) return 'Message content is required.'
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

  const handleSubmit = (e) => {
    e.preventDefault()

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
    setTimeout(() => {
      setIsSubmitting(false)
      const mockRef = `INQ-2026-${Math.floor(100000 + Math.random() * 900000)}`
      setSubmittedOrder({
        ref: mockRef,
        date: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        ...formData,
      })
    }, 450)
  }

  const handleReset = () => {
    setSubmittedOrder(null)
    setFormData({ name: '', email: '', subject: '', message: '' })
    setErrors({})
    setTouched({})
  }

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-24 sm:space-y-32 py-6 sm:py-12 text-white">
      {/* Page Header & Concierge Intro */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-white/10 pb-8 sm:pb-12">
          {/* Breadcrumb & Overline */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-6 border-b border-white/10 mb-8">
            <div>
              <span className="tag-overline text-[#D4AF37] font-mono">CLIENT CONCIERGE & ATELIER</span>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-mono mt-0.5">
                PARIS • TOKYO • NEW YORK DIRECT DISPATCH
              </p>
            </div>
            <Link
              to="/shop"
              className="text-xs uppercase tracking-[0.2em] font-medium text-[#D4AF37] hover:text-white transition-colors inline-flex items-center gap-1 font-mono"
            >
              <span>Explore The Collection</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-3">
              <h1 className="editorial-title text-4xl sm:text-6xl lg:text-7xl font-serif text-white">
                Atelier Inquiries & <br />
                <span className="italic font-light gold-gradient-text">Concierge Service.</span>
              </h1>
            </div>
            <div className="lg:col-span-4">
              <p className="text-xs uppercase tracking-[0.22em] text-gray-300 leading-relaxed font-sans border-l-2 border-[#D4AF37] pl-4 font-mono">
                Whether arranging a bespoke fitting consultation, requesting guidance on garment proportions, or asking questions about our collection, our team is at your disposal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Contact Form & Studio Details */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7">
            {submittedOrder ? (
              /* Success Feedback Panel */
              <div
                className="glass-panel-gold bg-[#0E1018]/95 border border-[#D4AF37]/50 p-8 sm:p-12 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-xs shadow-2xl text-white"
                role="status"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full glass-panel flex items-center justify-center text-[#D4AF37]">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <span className="tag-overline text-[#D4AF37] font-mono">DISPATCH RECEIVED</span>
                    <h2 className="font-serif text-2xl sm:text-3xl text-white">
                      Inquiry Transmitted
                    </h2>
                  </div>
                </div>

                <div className="border-t border-b border-white/10 py-5 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 uppercase tracking-wider font-mono">Reference Dossier</span>
                    <span className="font-mono font-bold text-[#D4AF37]">{submittedOrder.ref}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 uppercase tracking-wider font-mono">Client Name</span>
                    <span className="font-serif font-medium text-white">{submittedOrder.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 uppercase tracking-wider font-mono">Contact Email</span>
                    <span className="font-mono text-white">{submittedOrder.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 uppercase tracking-wider font-mono">Subject</span>
                    <span className="text-white font-medium">{submittedOrder.subject}</span>
                  </div>
                </div>

                <div className="p-4 glass-panel border border-white/10 space-y-1 rounded-xs">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold block">
                    [FRONTEND DEMONSTRATION NOTICE]
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    Thank you, {submittedOrder.name}. Your demo message has been registered in the frontend session state. No live outbound email or third-party CRM was contacted.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-4 items-center">
                  <Button variant="primary" size="md" to="/shop">
                    Continue To Collection
                  </Button>
                  <Button variant="secondary" size="md" onClick={handleReset}>
                    Submit Another Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              /* Interactive Contact Form */
              <div className="glass-panel p-8 sm:p-12 space-y-8 rounded-xs border-white/10">
                <div>
                  <span className="tag-overline text-[#D4AF37] font-mono">TRANSMIT AN INQUIRY</span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-white mt-1">
                    Send A Message to Our Concierge
                  </h2>
                  <p className="text-xs text-gray-400 font-sans mt-1">
                    Please provide your inquiry details below. All fields marked with (*) are required.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Full Name Field */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact-name"
                        className="text-[10px] uppercase tracking-widest text-gray-400 font-mono font-semibold block"
                      >
                        Full Name <span className="text-[#D4AF37]">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        placeholder="e.g. Eleanor Vance"
                        aria-invalid={Boolean(errors.name && touched.name)}
                        aria-describedby={errors.name && touched.name ? 'error-name' : undefined}
                        className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors ${
                          errors.name && touched.name
                            ? 'border-[#E57373]'
                            : 'border-white/15 focus:border-[#D4AF37]'
                        }`}
                      />
                      {errors.name && touched.name && (
                        <div id="error-name" className="flex items-center gap-1.5 text-xs text-[#E57373] pt-1 font-mono">
                          <AlertCircle size={13} className="shrink-0" />
                          <span>{errors.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact-email"
                        className="text-[10px] uppercase tracking-widest text-gray-400 font-mono font-semibold block"
                      >
                        Email Address <span className="text-[#D4AF37]">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        placeholder="client@domain.com"
                        aria-invalid={Boolean(errors.email && touched.email)}
                        aria-describedby={errors.email && touched.email ? 'error-email' : undefined}
                        className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors ${
                          errors.email && touched.email
                            ? 'border-[#E57373]'
                            : 'border-white/15 focus:border-[#D4AF37]'
                        }`}
                      />
                      {errors.email && touched.email && (
                        <div id="error-email" className="flex items-center gap-1.5 text-xs text-[#E57373] pt-1 font-mono">
                          <AlertCircle size={13} className="shrink-0" />
                          <span>{errors.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subject Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-subject"
                      className="text-[10px] uppercase tracking-widest text-gray-400 font-mono font-semibold block"
                    >
                      Subject / Topic <span className="text-[#D4AF37]">*</span>
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      onBlur={() => handleBlur('subject')}
                      placeholder="e.g. Private Sizing Consultation / Cocoon Coat Question"
                      aria-invalid={Boolean(errors.subject && touched.subject)}
                      aria-describedby={errors.subject && touched.subject ? 'error-subject' : undefined}
                      className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors ${
                        errors.subject && touched.subject
                          ? 'border-[#E57373]'
                          : 'border-white/15 focus:border-[#D4AF37]'
                      }`}
                    />
                    {errors.subject && touched.subject && (
                      <div id="error-subject" className="flex items-center gap-1.5 text-xs text-[#E57373] pt-1 font-mono">
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{errors.subject}</span>
                      </div>
                    )}
                  </div>

                  {/* Message Field */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-message"
                      className="text-[10px] uppercase tracking-widest text-gray-400 font-mono font-semibold block"
                    >
                      Message Details <span className="text-[#D4AF37]">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      onBlur={() => handleBlur('message')}
                      placeholder="Please describe your styling requirements, silhouettes of interest, or delivery questions..."
                      aria-invalid={Boolean(errors.message && touched.message)}
                      aria-describedby={errors.message && touched.message ? 'error-message' : undefined}
                      className={`w-full bg-[#121522] border p-3 text-xs tracking-wider text-white focus:outline-none transition-colors ${
                        errors.message && touched.message
                          ? 'border-[#E57373]'
                          : 'border-white/15 focus:border-[#D4AF37]'
                      }`}
                    />
                    {errors.message && touched.message && (
                      <div id="error-message" className="flex items-center gap-1.5 text-xs text-[#E57373] pt-1 font-mono">
                        <AlertCircle size={13} className="shrink-0" />
                        <span>{errors.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isSubmitting}
                      icon={isSubmitting ? undefined : Send}
                      iconPosition="right"
                      className="w-full sm:w-auto font-bold"
                    >
                      {isSubmitting ? 'TRANSMITTING...' : 'TRANSMIT INQUIRY'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Column: Support Channels & Hours */}
          <div className="lg:col-span-5 space-y-8">
            <div className="glass-panel-gold bg-[#0E1018]/90 p-8 space-y-6 rounded-xs border border-white/15">
              <span className="tag-overline text-[#D4AF37] font-mono">SUPPORT DIRECT DISPATCH</span>
              <h3 className="font-serif text-2xl text-white border-b border-white/10 pb-4">
                Atelier Concierge Desk
              </h3>

              <div className="space-y-5 text-xs text-gray-300">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#D4AF37]">
                    <Mail size={16} />
                    <span className="font-mono text-[10px] tracking-widest uppercase font-bold">
                      DEMO SUPPORT EMAIL
                    </span>
                  </div>
                  <a
                    href="mailto:concierge@aureva-studios.demo"
                    className="font-mono text-sm text-white hover:text-[#D4AF37] underline block pt-0.5 transition-colors"
                  >
                    concierge@aureva-studios.demo
                  </a>
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                    [DEMO CONTACT — SIMULATED CLIENT INBOX]
                  </p>
                </div>

                <div className="space-y-1 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-[#D4AF37]">
                    <Phone size={16} />
                    <span className="font-mono text-[10px] tracking-widest uppercase font-bold">
                      DEMO SALON HOTLINE
                    </span>
                  </div>
                  <p className="font-mono text-sm text-white">+33 (0)1 42 68 55 00</p>
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
                    [DEMO DIRECT LINE • TUESDAY – SATURDAY]
                  </p>
                </div>

                <div className="space-y-1 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 text-[#D4AF37]">
                    <Clock size={16} />
                    <span className="font-mono text-[10px] tracking-widest uppercase font-bold">
                      HOURS OF ATTENTION
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">
                    10:00 – 19:00 CET (Monday through Saturday)
                  </p>
                  <p className="text-[10px] text-gray-500 font-mono">
                    Average response timeframe within one business day.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="glass-panel p-8 space-y-4 rounded-xs border-white/10">
              <span className="tag-overline text-[#D4AF37] font-mono">STUDIO CHANNELS</span>
              <h3 className="font-serif text-xl text-white">Digital Archives & Moodboards</h3>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                Connect with our creative studio dispatches and runway soundscape archives:
              </p>

              <div className="space-y-2.5 pt-2 text-xs">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 glass-panel border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors group"
                >
                  <span className="font-serif font-medium">Instagram Studio Archives</span>
                  <span className="font-mono text-[10px] text-[#D4AF37] font-bold">[DEMO LINK]</span>
                </a>

                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 glass-panel border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors group"
                >
                  <span className="font-serif font-medium">Pinterest Silhouette Moodboard</span>
                  <span className="font-mono text-[10px] text-[#D4AF37] font-bold">[DEMO LINK]</span>
                </a>

                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 glass-panel border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors group"
                >
                  <span className="font-serif font-medium">X / Twitter Editorial Dispatch</span>
                  <span className="font-mono text-[10px] text-[#D4AF37] font-bold">[DEMO LINK]</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion in Liquid Glass */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 border-t border-white/10 pt-20">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 p-2 glass-panel-gold rounded-full mb-1">
            <HelpCircle size={18} className="text-[#D4AF37]" />
          </div>
          <span className="tag-overline text-[#D4AF37] block font-mono">FREQUENT INQUIRIES</span>
          <h2 className="editorial-title text-3xl sm:text-5xl font-serif text-white">
            Atelier Client Guide & FAQs
          </h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest max-w-md mx-auto font-mono">
            Clear answers regarding shipping, complimentary returns, garment sizing and demo orders.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openFaqId === item.id
            return (
              <div
                key={item.id}
                className={`border transition-colors rounded-xs ${
                  isOpen ? 'border-[#D4AF37]/60 glass-panel-gold' : 'border-white/10 glass-panel hover:border-white/30'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${item.id}`}
                  className="w-full text-left p-6 sm:p-7 flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37]"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-[0.25em] font-mono text-[#D4AF37] font-bold block">
                      {item.category}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl text-white font-medium">
                      {item.question}
                    </h3>
                  </div>
                  <div
                    className={`p-1.5 rounded-full border border-white/20 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 bg-[#D4AF37] text-[#08090D]' : 'text-gray-300'
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${item.id}`}
                    className="px-6 pb-6 sm:px-7 sm:pb-7 text-xs sm:text-sm text-gray-300 font-sans leading-relaxed border-t border-white/10 pt-4 animate-in fade-in duration-200 font-light"
                  >
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="text-center pt-4">
          <p className="text-xs text-gray-400 font-mono">
            Have an uncommon request?{' '}
            <a
              href="mailto:concierge@aureva-studios.demo"
              className="underline text-[#D4AF37] font-medium hover:text-white"
            >
              Inquire directly with our Concierge Desk
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
