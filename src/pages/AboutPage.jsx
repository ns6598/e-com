import React from 'react'
import { ArrowRight, Compass, Layers, Scissors } from 'lucide-react'
import Button from '../components/ui/Button'

export default function AboutPage() {
  return (
    <div className="space-y-24 sm:space-y-36 py-6 sm:py-12">
      {/* =========================================================================
          SECTION 1: Editorial Hero with Headline "DRESS LIKE YOU MEAN IT."
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#171717]/15 pb-8 sm:pb-12">
          {/* Top Overline & Monograph Coordinates */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-6 border-b border-[#171717]/10 mb-8">
            <div>
              <span className="tag-overline text-[#6D202D]">THE AUREVA MONOGRAPH • VOL. 01</span>
              <p className="text-xs uppercase tracking-[0.25em] text-[#171717]/60 font-mono mt-0.5">
                MANIFESTO & DESIGN ETHOS
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-[11px] font-mono tracking-widest text-[#171717]/50">
                FOUNDED ON PROPORTION & DRAPE
              </span>
            </div>
          </div>

          {/* Hero Typography & Intent */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-block text-[10px] tracking-[0.28em] uppercase font-mono text-[#6D202D] font-bold">
                CORE STATEMENT
              </span>
              <h1 className="editorial-title text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-serif text-[#171717] tracking-tight leading-[0.93]">
                DRESS LIKE YOU <br />
                <span className="italic font-light text-[#6D202D]">MEAN IT.</span>
              </h1>
            </div>
            <div className="lg:col-span-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[#171717]/70 leading-relaxed font-sans border-l-2 border-[#6D202D] pl-4">
                Clothing is the physical architecture you carry into the world. It is an intentional, unspoken declaration of presence, autonomy, and personal conviction.
              </p>
            </div>
          </div>
        </div>

        {/* Hero Editorial Photograph & Thesis Callout */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7">
            <div className="relative aspect-[16/10] bg-[#ECE5D8] border border-[#171717]/20 overflow-hidden shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85"
                alt="AUREVA Atelier Editorial Drapery and Sculptural Wool Study"
                className="w-full h-full object-cover object-center hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 bg-[#171717]/85 backdrop-blur-xs text-[#F6F2EA] px-3.5 py-1.5 text-[9px] font-mono uppercase tracking-widest">
                ARCHIVE STUDY NO. 01 — DOUBLE-FACED WOOL COCOON
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <span className="tag-overline text-[#6D202D]">THE INTENT</span>
            <blockquote className="font-serif text-2xl sm:text-3xl text-[#171717] leading-snug font-light">
              "We strip away superficial ornament to expose the raw authority of clean geometry, heavy weave, and gravity."
            </blockquote>
            <p className="text-xs text-[#171717]/70 leading-relaxed font-sans">
              AUREVA was conceived as a deliberate antidote to disposable novelty. We believe that true personal style is not bought from a trend forecasting deck; it is forged when garments are designed with quiet weight, sharp geometry, and structural integrity.
            </p>
            <div className="pt-2">
              <Button variant="secondary" size="md" to="/shop" icon={ArrowRight} iconPosition="right">
                Explore The Repertoire
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: Brand Philosophy — "The Geometry of Quiet Stature"
          ========================================================================= */}
      <section className="bg-[#171717] text-[#F6F2EA] py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-[#F6F2EA]/20 pb-8 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="tag-overline text-[#D8D0C4]">ATELIER THESIS</span>
              <h2 className="editorial-title text-3xl sm:text-5xl font-serif text-[#F6F2EA] mt-1">
                The Philosophy of Form
              </h2>
            </div>
            <p className="text-xs text-[#F6F2EA]/60 font-mono uppercase tracking-widest max-w-sm">
              Refusing the relentless churn of 52 micro-seasons.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5 space-y-6">
              <h3 className="font-serif text-2xl sm:text-3xl text-[#F6F2EA] leading-snug font-light">
                Quiet Authority in a Culture of Visual Noise.
              </h3>
              <p className="font-serif text-base text-[#F6F2EA]/80 font-light leading-relaxed">
                Modern fashion often mistakes excess for distinction. Giant logos, frantic patterns, and garments engineered to expire after three wears create a perpetual cycle of dissatisfaction.
              </p>
              <p className="font-serif text-base text-[#F6F2EA]/80 font-light leading-relaxed">
                At AUREVA, we design for stillness. Our garments do not scream for attention in a room; they command attention through proportion, silhouette balance, and the unmistakable confidence of someone who knows exactly who they are.
              </p>
              <div className="p-6 bg-[#212121] border border-[#F6F2EA]/15 space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#6D202D] font-bold">
                  THE RULE OF MEASURE
                </span>
                <p className="text-xs text-[#F6F2EA]/75 leading-relaxed font-sans">
                  Every curve, seam angle, and button pitch undergoes dozens of fitting iterations to ensure the garment moves naturally with human stride, preserving clean architectural sculpture at rest.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4 border-t border-[#F6F2EA]/20 pt-6">
                <span className="font-mono text-xs text-[#6D202D] font-bold">01 / TIMELESS SILHOUETTES</span>
                <h4 className="font-serif text-xl text-[#F6F2EA]">Permanent Wardrobe Archetypes</h4>
                <p className="text-xs text-[#F6F2EA]/70 leading-relaxed font-sans">
                  Instead of discarding silhouettes every quarter, our designs remain in a permanent living archive. We refine patterns over years rather than starting from scratch every three months.
                </p>
              </div>

              <div className="space-y-4 border-t border-[#F6F2EA]/20 pt-6">
                <span className="font-mono text-xs text-[#6D202D] font-bold">02 / SPATIAL AWARENESS</span>
                <h4 className="font-serif text-xl text-[#F6F2EA]">Sculptural Volume & Drape</h4>
                <p className="text-xs text-[#F6F2EA]/70 leading-relaxed font-sans">
                  Garments are engineered to engage three-dimensional space. Generous drop shoulders, high vents, and deep box pleats produce dynamic motion while holding crisp form.
                </p>
              </div>

              <div className="space-y-4 border-t border-[#F6F2EA]/20 pt-6">
                <span className="font-mono text-xs text-[#6D202D] font-bold">03 / FUNCTIONAL PURPOSE</span>
                <h4 className="font-serif text-xl text-[#F6F2EA]">Real Utility, Zero Pretense</h4>
                <p className="text-xs text-[#F6F2EA]/70 leading-relaxed font-sans">
                  Deep welt pockets, reinforced interior seams, and concealed closures. Every detail serves a functional purpose, eliminating decorative distractions that compromise wearable elegance.
                </p>
              </div>

              <div className="space-y-4 border-t border-[#F6F2EA]/20 pt-6">
                <span className="font-mono text-xs text-[#6D202D] font-bold">04 / THE OXBLOOD ACCENT</span>
                <h4 className="font-serif text-xl text-[#F6F2EA]">Restrained Color Discipline</h4>
                <p className="text-xs text-[#F6F2EA]/70 leading-relaxed font-sans">
                  A tightly curated spectrum of obsidian black, bone ecru, chalk stone, and our signature rich burgundy oxblood—colors designed to complement one another effortlessly across seasons.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: Individual Expression Through Clothing — "Clothing as Autonomy"
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Portrait Editorial Visual */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative aspect-[3/4] bg-[#ECE5D8] border border-[#171717]/20 overflow-hidden shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85"
                alt="Individual expression through architectural tailoring"
                className="w-full h-full object-cover object-top hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 bg-[#6D202D] text-[#FFFFFF] px-3 py-1 text-[9px] uppercase tracking-widest font-mono font-semibold">
                INDIVIDUAL EXPRESSION
              </div>
            </div>
          </div>

          {/* Narrative Column */}
          <div className="lg:col-span-7 space-y-8 order-1 lg:order-2">
            <div className="space-y-3">
              <span className="tag-overline text-[#6D202D]">PERSONAL SOVEREIGNTY</span>
              <h2 className="editorial-title text-3xl sm:text-5xl font-serif text-[#171717]">
                Clothes That Do Not Wear You.
              </h2>
            </div>

            <p className="font-serif text-lg sm:text-xl text-[#171717]/80 font-light leading-relaxed">
              We reject the premise that luxury clothing should turn the wearer into an advertising billboard. The garment does not define the person; the individual activates the silhouette.
            </p>

            <div className="space-y-4 text-xs text-[#171717]/75 font-sans leading-relaxed">
              <p>
                When you step into a tailored wool coat or structured twill trouser, getting dressed ceases to be a trivial routine. It becomes a tactile ritual of intention. You decide how the lapels fall, how the belt wraps, whether the sleeves are pushed up or cuffed sharp.
              </p>
              <p>
                Our designs provide the rigorous frame, but leave ample emotional and spatial freedom for your individuality to emerge. Whether you inhabit our pieces with relaxed ease or razor-sharp formality, the clothing adapts to your rhythm, not the other way around.
              </p>
            </div>

            <div className="pt-2 border-t border-[#171717]/15 flex items-center gap-6">
              <div className="text-left">
                <span className="font-mono text-xl sm:text-2xl font-bold text-[#171717]">100%</span>
                <p className="text-[10px] uppercase tracking-widest text-[#171717]/60">Design Autonomy</p>
              </div>
              <div className="h-8 w-px bg-[#171717]/20" />
              <div className="text-left">
                <span className="font-mono text-xl sm:text-2xl font-bold text-[#171717]">0</span>
                <p className="text-[10px] uppercase tracking-widest text-[#171717]/60">Ostentatious Logos</p>
              </div>
              <div className="h-8 w-px bg-[#171717]/20" />
              <div className="text-left">
                <span className="font-mono text-xl sm:text-2xl font-bold text-[#171717]">∞</span>
                <p className="text-[10px] uppercase tracking-widest text-[#171717]/60">Styling Configurations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: Design, Material Selection, and Versatility
          ========================================================================= */}
      <section className="bg-[#FAF8F5] border-y border-[#171717]/15 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="tag-overline text-[#6D202D]">ATELIER CRAFT & DISCIPLINES</span>
            <h2 className="editorial-title text-3xl sm:text-5xl font-serif text-[#171717]">
              Design, Matter & Versatility
            </h2>
            <p className="text-xs text-[#171717]/70 leading-relaxed uppercase tracking-wider font-sans">
              Three interconnected pillars governing every garment pattern that leaves our studio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Card 1: Architectural Design */}
            <div className="bg-[#F6F2EA] border border-[#171717]/15 p-8 space-y-6 flex flex-col justify-between hover:border-[#6D202D] transition-colors">
              <div className="space-y-4">
                <div className="p-3 bg-[#171717] text-[#F6F2EA] inline-flex">
                  <Scissors size={20} />
                </div>
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#6D202D] block font-bold">
                  PILLAR 01 • FORM & CUT
                </span>
                <h3 className="font-serif text-2xl text-[#171717]">Architectural Pattern Rigor</h3>
                <p className="text-xs text-[#171717]/75 leading-relaxed font-sans">
                  We approach pattern-cutting with the discipline of spatial engineering. Dropped armholes, articulated elbow darts, double inverted pleats, and split-yoke backs ensure natural kinetic freedom while maintaining razor-sharp silhouette discipline.
                </p>
              </div>
              <div className="pt-4 border-t border-[#171717]/10 text-[11px] font-mono text-[#171717]/60 uppercase">
                Focus: Balance, drape & proportion
              </div>
            </div>

            {/* Card 2: Material Selection */}
            <div className="bg-[#F6F2EA] border border-[#171717]/15 p-8 space-y-6 flex flex-col justify-between hover:border-[#6D202D] transition-colors">
              <div className="space-y-4">
                <div className="p-3 bg-[#171717] text-[#F6F2EA] inline-flex">
                  <Layers size={20} />
                </div>
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#6D202D] block font-bold">
                  PILLAR 02 • WEIGHT & HAND
                </span>
                <h3 className="font-serif text-2xl text-[#171717]">Honest Material Weight</h3>
                <p className="text-xs text-[#171717]/75 leading-relaxed font-sans">
                  We prioritize dense, tactile fabrics selected for how they drape, how they catch light, and how they age with the wearer: heavy 380gsm double-faced virgin wools, high-twist crisp cotton poplins, fluid raw-edge silk twill, and supple vegetal-tanned Tuscan calfskin.
                </p>
              </div>
              <div className="pt-4 border-t border-[#171717]/10 text-[11px] font-mono text-[#171717]/60 uppercase">
                Focus: Tactile memory, grain & density
              </div>
            </div>

            {/* Card 3: Versatility */}
            <div className="bg-[#F6F2EA] border border-[#171717]/15 p-8 space-y-6 flex flex-col justify-between hover:border-[#6D202D] transition-colors">
              <div className="space-y-4">
                <div className="p-3 bg-[#171717] text-[#F6F2EA] inline-flex">
                  <Compass size={20} />
                </div>
                <span className="font-mono text-[10px] tracking-widest uppercase text-[#6D202D] block font-bold">
                  PILLAR 03 • CONTEXT TRANSITION
                </span>
                <h3 className="font-serif text-2xl text-[#171717]">Day-to-Night Versatility</h3>
                <p className="text-xs text-[#171717]/75 leading-relaxed font-sans">
                  A wardrobe should not require midday overhauls. Our silhouettes transition seamlessly between day appointments, gallery vernissages, and evening dinners. A change of footwear, an unfastened collar, or a cinched waist transforms each archetype instantly.
                </p>
              </div>
              <div className="pt-4 border-t border-[#171717]/10 text-[11px] font-mono text-[#171717]/60 uppercase">
                Focus: Modular layering & fluid context
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: Visual Campaign & Studio Section
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#171717]/15 pb-6 mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="tag-overline text-[#6D202D]">ATELIER ARCHIVE STUDIES</span>
            <h2 className="editorial-title text-3xl sm:text-5xl font-serif text-[#171717] mt-1">
              Visual Campaign & Studio Monograph
            </h2>
          </div>
          <p className="text-xs font-mono tracking-widest text-[#171717]/60 uppercase">
            FORM STUDIES • AUTUMN/WINTER 2026
          </p>
        </div>

        {/* Editorial Photo Collage Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Gallery Item 1 */}
          <div className="group space-y-3">
            <div className="relative aspect-[3/4] bg-[#ECE5D8] border border-[#171717]/15 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80"
                alt="Textile pattern cut and chalk drafting"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-[#171717]/90 text-[#F6F2EA] px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest">
                MONO-01
              </div>
            </div>
            <div>
              <p className="font-serif text-sm text-[#171717] font-medium">Chalk Drafting & Bias Cut</p>
              <p className="text-[10px] text-[#171717]/60 font-mono uppercase tracking-wider">
                Precision pattern line verification
              </p>
            </div>
          </div>

          {/* Gallery Item 2 */}
          <div className="group space-y-3">
            <div className="relative aspect-[3/4] bg-[#ECE5D8] border border-[#171717]/15 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
                alt="Editorial runway drape and kinetic silhouette"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-[#171717]/90 text-[#F6F2EA] px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest">
                MONO-02
              </div>
            </div>
            <div>
              <p className="font-serif text-sm text-[#171717] font-medium">Kinetic Drape in Motion</p>
              <p className="text-[10px] text-[#171717]/60 font-mono uppercase tracking-wider">
                Volumetric drop-shoulder study
              </p>
            </div>
          </div>

          {/* Gallery Item 3 */}
          <div className="group space-y-3">
            <div className="relative aspect-[3/4] bg-[#ECE5D8] border border-[#171717]/15 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80"
                alt="Portrait with structured collar and sharp lapel"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-[#171717]/90 text-[#F6F2EA] px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest">
                MONO-03
              </div>
            </div>
            <div>
              <p className="font-serif text-sm text-[#171717] font-medium">Lapel Archival Geometry</p>
              <p className="text-[10px] text-[#171717]/60 font-mono uppercase tracking-wider">
                Concealed horn button placement
              </p>
            </div>
          </div>

          {/* Gallery Item 4 */}
          <div className="group space-y-3">
            <div className="relative aspect-[3/4] bg-[#ECE5D8] border border-[#171717]/15 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80"
                alt="Studio textile tactile inspection"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-[#171717]/90 text-[#F6F2EA] px-2 py-0.5 text-[8px] font-mono uppercase tracking-widest">
                MONO-04
              </div>
            </div>
            <div>
              <p className="font-serif text-sm text-[#171717] font-medium">Textile Grain & Hand Feel</p>
              <p className="text-[10px] text-[#171717]/60 font-mono uppercase tracking-wider">
                Dense high-twist weave evaluation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: Distinctive "Discover the Collection" Call to Action
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-[#171717]/20 bg-[#FAF8F5] p-8 sm:p-16 lg:p-20 relative overflow-hidden">
          {/* Subtle Burgundy Top Edge */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#6D202D]" />

          <div className="max-w-2xl space-y-6">
            <span className="tag-overline text-[#6D202D]">THE LIVING ARCHIVE</span>
            <h2 className="editorial-title text-3xl sm:text-5xl lg:text-6xl font-serif text-[#171717] tracking-tight leading-[0.98]">
              Experience The Collection.
            </h2>
            <p className="text-xs sm:text-sm text-[#171717]/75 font-sans leading-relaxed max-w-xl">
              Explore our permanent atelier coats, relaxed tailored trousers, raw silk blouses, and vegetable-tanned leather goods. Built for individuals who dress with intention.
            </p>
            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <Button variant="primary" size="lg" to="/shop" icon={ArrowRight} iconPosition="right">
                Discover The Collection
              </Button>
              <Button variant="secondary" size="lg" to="/contact">
                Book Atelier Appointment
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
