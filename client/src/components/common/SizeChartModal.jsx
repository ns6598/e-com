import React, { useState, useEffect } from 'react'
import { X, Ruler, Sparkles, Check, Info, ChevronRight } from 'lucide-react'

// Comprehensive measurement tables
const WOMEN_GARMENTS = {
  columns: ['Size', 'IN / UK', 'US', 'EU', 'Bust', 'Waist', 'Hips', 'Shoulder'],
  rowsCm: [
    { size: 'XS', inUk: '6', us: '2', eu: '34', bust: '82–86', waist: '64–68', hips: '88–92', shoulder: '38' },
    { size: 'S', inUk: '8', us: '4', eu: '36', bust: '86–92', waist: '68–74', hips: '92–98', shoulder: '39.5' },
    { size: 'M', inUk: '10', us: '6', eu: '38', bust: '92–98', waist: '74–80', hips: '98–104', shoulder: '41' },
    { size: 'L', inUk: '12', us: '8', eu: '40', bust: '98–106', waist: '80–88', hips: '104–112', shoulder: '42.5' },
    { size: 'XL', inUk: '14', us: '10', eu: '42', bust: '106–114', waist: '88–96', hips: '112–120', shoulder: '44' },
  ],
  rowsIn: [
    { size: 'XS', inUk: '6', us: '2', eu: '34', bust: '32–34', waist: '25–27', hips: '34.5–36', shoulder: '15' },
    { size: 'S', inUk: '8', us: '4', eu: '36', bust: '34–36', waist: '27–29', hips: '36–38.5', shoulder: '15.5' },
    { size: 'M', inUk: '10', us: '6', eu: '38', bust: '36–38.5', waist: '29–31.5', hips: '38.5–41', shoulder: '16.1' },
    { size: 'L', inUk: '12', us: '8', eu: '40', bust: '38.5–41.5', waist: '31.5–34.5', hips: '41–44', shoulder: '16.7' },
    { size: 'XL', inUk: '14', us: '10', eu: '42', bust: '41.5–45', waist: '34.5–37.8', hips: '44–47', shoulder: '17.3' },
  ],
}

const MEN_GARMENTS = {
  columns: ['Size', 'Chest', 'Waist', 'Hip / Seat', 'Sleeve Length', 'Collar'],
  rowsCm: [
    { size: 'S (38)', chest: '92–96', waist: '76–81', hips: '92–97', sleeve: '83–85', collar: '38–39' },
    { size: 'M (40)', chest: '96–104', waist: '81–89', hips: '97–104', sleeve: '85–87', collar: '39–40' },
    { size: 'L (42)', chest: '104–112', waist: '89–97', hips: '104–112', sleeve: '87–89', collar: '41–42' },
    { size: 'XL (44)', chest: '112–120', waist: '97–107', hips: '112–120', sleeve: '89–91', collar: '43–44' },
  ],
  rowsIn: [
    { size: 'S (38)', chest: '36–38', waist: '30–32', hips: '36–38', sleeve: '32.6–33.5', collar: '15' },
    { size: 'M (40)', chest: '38–41', waist: '32–35', hips: '38–41', sleeve: '33.5–34.2', collar: '15.5–15.7' },
    { size: 'L (42)', chest: '41–44', waist: '35–38', hips: '41–44', sleeve: '34.2–35.0', collar: '16.1–16.5' },
    { size: 'XL (44)', chest: '44–47', waist: '38–42', hips: '44–47', sleeve: '35.0–35.8', collar: '16.9–17.3' },
  ],
}

const TROUSERS_MEASUREMENTS = {
  columns: ['Waist Size', 'Natural Waist', 'Seat / Hips', 'Thigh Circumference', 'Standard Inseam'],
  rowsCm: [
    { size: '28', waist: '71–74', hips: '89–92', thigh: '54', inseam: '79' },
    { size: '30', waist: '76–79', hips: '94–97', thigh: '56', inseam: '81' },
    { size: '32', waist: '81–84', hips: '99–102', thigh: '59', inseam: '81' },
    { size: '34', waist: '86–89', hips: '104–107', thigh: '62', inseam: '82' },
    { size: '36', waist: '91–94', hips: '109–112', thigh: '65', inseam: '82' },
  ],
  rowsIn: [
    { size: '28', waist: '28–29', hips: '35–36', thigh: '21.2', inseam: '31' },
    { size: '30', waist: '30–31', hips: '37–38', thigh: '22.0', inseam: '32' },
    { size: '32', waist: '32–33', hips: '39–40', thigh: '23.2', inseam: '32' },
    { size: '34', waist: '34–35', hips: '41–42', thigh: '24.4', inseam: '32.3' },
    { size: '36', waist: '36–37', hips: '43–44', thigh: '25.6', inseam: '32.3' },
  ],
}

const FOOTWEAR_SIZING = {
  columns: ['EU Sizing', 'UK / IN', 'US Men', 'US Women', 'Foot Length (cm)', 'Foot Length (in)'],
  rows: [
    { eu: '40', uk: '6.0', usM: '7.0', usW: '8.5', cm: '25.3', in: '10.0' },
    { eu: '41', uk: '7.0', usM: '8.0', usW: '9.5', cm: '26.0', in: '10.2' },
    { eu: '42', uk: '8.0', usM: '9.0', usW: '10.5', cm: '26.7', in: '10.5' },
    { eu: '43', uk: '9.0', usM: '10.0', usW: '11.5', cm: '27.3', in: '10.7' },
    { eu: '44', uk: '10.0', usM: '11.0', usW: '12.5', cm: '28.0', in: '11.0' },
    { eu: '45', uk: '11.0', usM: '12.0', usW: '13.5', cm: '28.7', in: '11.3' },
  ],
}

const BELT_SIZING = {
  columns: ['Nominal Belt Size', 'Total Length', 'Waist Fit (cm)', 'Waist Fit (in)', 'Pants Size Equiv.'],
  rows: [
    { size: '80 cm', length: '95 cm', waistCm: '75–85 cm', waistIn: '29–33 in', pants: '28–30' },
    { size: '85 cm', length: '100 cm', waistCm: '80–90 cm', waistIn: '31–35 in', pants: '30–32' },
    { size: '90 cm', length: '105 cm', waistCm: '85–95 cm', waistIn: '33–37 in', pants: '32–34' },
    { size: '95 cm', length: '110 cm', waistCm: '90–100 cm', waistIn: '35–39 in', pants: '34–36' },
    { size: '100 cm', length: '115 cm', waistCm: '95–105 cm', waistIn: '37–41 in', pants: '36–38' },
  ],
}

export default function SizeChartModal({ isOpen, onClose, initialDepartment = 'Women' }) {
  const [activeTab, setActiveTab] = useState('women')
  const [unit, setUnit] = useState('cm') // 'cm' | 'in'

  // Pre-select appropriate tab if initial department or category is provided
  useEffect(() => {
    if (initialDepartment) {
      const dep = initialDepartment.toLowerCase()
      if (dep.includes('footwear') || dep.includes('derby') || dep.includes('shoe')) {
        setActiveTab('footwear')
      } else if (dep.includes('men')) {
        setActiveTab('men')
      } else if (dep.includes('belt') || dep.includes('accessory')) {
        setActiveTab('accessories')
      } else {
        setActiveTab('women')
      }
    }
  }, [initialDepartment, isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="AUREVA Interactive Size Chart & Atelier Measurement Guide"
    >
      {/* Dark frosted overlay */}
      <div
        className="fixed inset-0 bg-[#050609]/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="relative w-full max-w-4xl glass-panel-gold bg-[#0A0C14]/98 border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-white my-8 rounded-xs overflow-hidden">
          {/* Header Strip */}
          <div className="p-6 sm:p-8 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0C0E1A] to-[#121626]">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                <span className="text-[10px] tracking-[0.28em] uppercase text-[#D4AF37] font-mono font-bold">
                  ATELIER ARCHITECTURAL FITTING
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-white font-light tracking-wide mt-1">
                Size Chart & Conversion Matrix
              </h2>
              <p className="text-xs text-gray-300 font-sans mt-1">
                Precision measurements calibrated in Indian, UK, European and US standard scales.
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              {/* Unit Switcher */}
              <div className="inline-flex items-center border border-white/20 p-0.5 bg-[#121522] rounded-xs">
                <button
                  type="button"
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1 font-mono uppercase tracking-wider text-[11px] transition-all cursor-pointer ${
                    unit === 'cm'
                      ? 'gold-gradient-bg text-[#08090D] font-bold shadow-xs'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Metric (cm)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('in')}
                  className={`px-3 py-1 font-mono uppercase tracking-wider text-[11px] transition-all cursor-pointer ${
                    unit === 'in'
                      ? 'gold-gradient-bg text-[#08090D] font-bold shadow-xs'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Imperial (in)
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close size chart modal"
                className="p-2 border border-white/15 bg-white/5 text-gray-300 hover:text-white hover:border-[#D4AF37] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Department Category Tab Bar */}
          <div className="flex items-center overflow-x-auto border-b border-white/10 bg-[#0E111D] px-6">
            <button
              type="button"
              onClick={() => setActiveTab('women')}
              className={`py-3.5 px-4 font-mono text-xs uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'women'
                  ? 'border-[#D4AF37] text-[#D4AF37] font-bold'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Women Ready-to-Wear
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('men')}
              className={`py-3.5 px-4 font-mono text-xs uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'men'
                  ? 'border-[#D4AF37] text-[#D4AF37] font-bold'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Men Ready-to-Wear
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('trousers')}
              className={`py-3.5 px-4 font-mono text-xs uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'trousers'
                  ? 'border-[#D4AF37] text-[#D4AF37] font-bold'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Tailored Trousers & Pants
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('footwear')}
              className={`py-3.5 px-4 font-mono text-xs uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'footwear'
                  ? 'border-[#D4AF37] text-[#D4AF37] font-bold'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Footwear & Derbies
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('accessories')}
              className={`py-3.5 px-4 font-mono text-xs uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'accessories'
                  ? 'border-[#D4AF37] text-[#D4AF37] font-bold'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Belts & Leather Objects
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 space-y-8 max-h-[65vh] overflow-y-auto">
            {/* Table Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                <span className="uppercase tracking-widest text-[#D4AF37]">
                  {activeTab === 'women' && 'Women Tops, Dresses & Outerwear'}
                  {activeTab === 'men' && 'Men Outerwear, Shirts & Knitwear'}
                  {activeTab === 'trousers' && 'Pleated Trousers & Tailored Bottoms'}
                  {activeTab === 'footwear' && 'Square-Toe Vibram Derbies & Footwear'}
                  {activeTab === 'accessories' && 'Anatomic Bridle Leather Belts'}
                </span>
                <span className="text-[11px] text-gray-400">
                  Units displayed in: <strong className="text-white uppercase">{unit === 'cm' ? 'Centimeters (cm)' : 'Inches (in)'}</strong>
                </span>
              </div>

              {/* Dynamic Table */}
              <div className="overflow-x-auto border border-white/10 rounded-xs bg-[#0C0E1A]">
                {activeTab === 'women' && (
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/20 bg-white/5 text-[#D4AF37]">
                        {WOMEN_GARMENTS.columns.map((col) => (
                          <th key={col} className="py-3 px-4 font-semibold uppercase tracking-wider">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-gray-300">
                      {(unit === 'cm' ? WOMEN_GARMENTS.rowsCm : WOMEN_GARMENTS.rowsIn).map((row) => (
                        <tr key={row.size} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-bold text-white bg-white/5">{row.size}</td>
                          <td className="py-3 px-4">{row.inUk}</td>
                          <td className="py-3 px-4">{row.us}</td>
                          <td className="py-3 px-4">{row.eu}</td>
                          <td className="py-3 px-4 text-white font-medium">{row.bust} {unit}</td>
                          <td className="py-3 px-4 text-white font-medium">{row.waist} {unit}</td>
                          <td className="py-3 px-4 text-white font-medium">{row.hips} {unit}</td>
                          <td className="py-3 px-4">{row.shoulder} {unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'men' && (
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/20 bg-white/5 text-[#D4AF37]">
                        {MEN_GARMENTS.columns.map((col) => (
                          <th key={col} className="py-3 px-4 font-semibold uppercase tracking-wider">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-gray-300">
                      {(unit === 'cm' ? MEN_GARMENTS.rowsCm : MEN_GARMENTS.rowsIn).map((row) => (
                        <tr key={row.size} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-bold text-white bg-white/5">{row.size}</td>
                          <td className="py-3 px-4 text-white font-medium">{row.chest} {unit}</td>
                          <td className="py-3 px-4 text-white font-medium">{row.waist} {unit}</td>
                          <td className="py-3 px-4 text-white font-medium">{row.hips} {unit}</td>
                          <td className="py-3 px-4">{row.sleeve} {unit}</td>
                          <td className="py-3 px-4">{row.collar} {unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'trousers' && (
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/20 bg-white/5 text-[#D4AF37]">
                        {TROUSERS_MEASUREMENTS.columns.map((col) => (
                          <th key={col} className="py-3 px-4 font-semibold uppercase tracking-wider">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-gray-300">
                      {(unit === 'cm' ? TROUSERS_MEASUREMENTS.rowsCm : TROUSERS_MEASUREMENTS.rowsIn).map((row) => (
                        <tr key={row.size} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-bold text-white bg-white/5">{row.size}</td>
                          <td className="py-3 px-4 text-white font-medium">{row.waist} {unit}</td>
                          <td className="py-3 px-4 text-white font-medium">{row.hips} {unit}</td>
                          <td className="py-3 px-4">{row.thigh} {unit}</td>
                          <td className="py-3 px-4">{row.inseam} {unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'footwear' && (
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/20 bg-white/5 text-[#D4AF37]">
                        {FOOTWEAR_SIZING.columns.map((col) => (
                          <th key={col} className="py-3 px-4 font-semibold uppercase tracking-wider">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-gray-300">
                      {FOOTWEAR_SIZING.rows.map((row) => (
                        <tr key={row.eu} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-bold text-white bg-white/5">EU {row.eu}</td>
                          <td className="py-3 px-4 text-white font-medium">UK / IN {row.uk}</td>
                          <td className="py-3 px-4">US {row.usM}</td>
                          <td className="py-3 px-4">US {row.usW}</td>
                          <td className="py-3 px-4">{row.cm} cm</td>
                          <td className="py-3 px-4">{row.in} in</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === 'accessories' && (
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/20 bg-white/5 text-[#D4AF37]">
                        {BELT_SIZING.columns.map((col) => (
                          <th key={col} className="py-3 px-4 font-semibold uppercase tracking-wider">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-gray-300">
                      {BELT_SIZING.rows.map((row) => (
                        <tr key={row.size} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-bold text-white bg-white/5">{row.size}</td>
                          <td className="py-3 px-4">{row.length}</td>
                          <td className="py-3 px-4 text-white font-medium">{row.waistCm}</td>
                          <td className="py-3 px-4">{row.waistIn}</td>
                          <td className="py-3 px-4">{row.pants}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* How to Measure Instructions */}
            <div className="border border-white/10 p-5 sm:p-6 bg-[#0E1220] rounded-xs space-y-4">
              <div className="flex items-center gap-2">
                <Ruler size={16} className="text-[#D4AF37]" />
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white font-bold">
                  How To Accurately Measure Yourself
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans text-gray-300">
                <div className="space-y-1 p-3 border border-white/10 bg-white/5">
                  <span className="font-mono text-[11px] font-bold text-[#D4AF37] block uppercase">
                    1. Bust / Chest
                  </span>
                  <p className="text-[11px] leading-relaxed text-gray-300">
                    Wrap tape around the fullest part of your chest or bust, keeping the measuring tape horizontal and relaxed.
                  </p>
                </div>

                <div className="space-y-1 p-3 border border-white/10 bg-white/5">
                  <span className="font-mono text-[11px] font-bold text-[#D4AF37] block uppercase">
                    2. Natural Waist
                  </span>
                  <p className="text-[11px] leading-relaxed text-gray-300">
                    Measure around your narrowest waistline, roughly 2 inches above the belly button, without pulling tightly.
                  </p>
                </div>

                <div className="space-y-1 p-3 border border-white/10 bg-white/5">
                  <span className="font-mono text-[11px] font-bold text-[#D4AF37] block uppercase">
                    3. Hips / Seat
                  </span>
                  <p className="text-[11px] leading-relaxed text-gray-300">
                    Stand with heels together and measure around the fullest circumference of your hips and rear.
                  </p>
                </div>

                <div className="space-y-1 p-3 border border-white/10 bg-white/5">
                  <span className="font-mono text-[11px] font-bold text-[#D4AF37] block uppercase">
                    4. Inseam / Length
                  </span>
                  <p className="text-[11px] leading-relaxed text-gray-300">
                    Measure from the crotch point down the inside leg seam to the bottom ankle bone for exact trouser drape.
                  </p>
                </div>
              </div>
            </div>

            {/* Atelier Fit Philosophy Guidance */}
            <div className="p-4 sm:p-5 border border-[#D4AF37]/30 bg-[#14120D] text-xs text-gray-300 space-y-2 rounded-xs">
              <div className="flex items-center gap-2 text-[#D4AF37] font-mono text-[11px] uppercase tracking-wider font-semibold">
                <Sparkles size={13} />
                <span>Atelier Fitting Philosophy</span>
              </div>
              <p className="leading-relaxed font-sans text-[11px]">
                AUREVA silhouettes are engineered with architectural ease. For an oversized runway drape with fluid volume, select your standard size. For a tailored, closer form, order one size down. If your measurements fall between sizes, we recommend sizing up for structured outer coats and sizing down for fluid silks.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-white/10 bg-[#0C0E1A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
            <span className="text-gray-400 text-[11px]">
              Need personal styling or custom bespoke measurements?
            </span>
            <div className="flex items-center gap-3">
              <a
                href="/contact"
                className="text-[#D4AF37] hover:underline uppercase tracking-wider text-[11px] flex items-center gap-1"
              >
                <span>Contact Atelier Concierge</span>
                <ChevronRight size={13} />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 gold-gradient-bg text-[#08090D] font-bold uppercase tracking-wider text-[11px] hover:opacity-90 transition-opacity cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
