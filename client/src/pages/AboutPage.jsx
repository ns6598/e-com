import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Compass, Layers, Scissors, ShieldCheck, Flame } from 'lucide-react'
import PageTransition from '../components/motion/PageTransition'
import FadeInView from '../components/motion/FadeInView'

export default function AboutPage() {
  return (
    <PageTransition className="space-y-24 sm:space-y-36 py-6 sm:py-14 text-[#F5F5F5]">
      {/* Manifesto Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[#292929] pb-8 sm:pb-12">
          {/* Overline & Coordinates */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-6 border-b border-[#292929] mb-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#B8FF00] block">
                THE AUREVA MANIFESTO • VOL. 01
              </span>
              <p className="text-xs uppercase tracking-[0.2em] text-[#A6A6A6] font-mono mt-0.5">
                STYLE WITHOUT BOUNDARIES
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <span className="text-[11px] font-mono tracking-widest text-[#A6A6A6]">
                DARK ALTERNATIVE ATELIER
              </span>
            </div>
          </div>

          {/* Hero Typography */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-block text-[10px] tracking-[0.28em] uppercase font-mono text-[#B8FF00] font-bold">
                CORE STATEMENT
              </span>
              <h1 className="font-['Syne'] text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold uppercase text-[#F5F5F5] tracking-tight leading-[0.92]">
                BOLD TEXTURE. <br />
                <span className="text-[#B8FF00]">DARK ATTITUDE.</span>
              </h1>
            </div>
            <div className="lg:col-span-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#A6A6A6] leading-relaxed font-mono border-l-2 border-[#B8FF00] pl-4">
                Clothing is armor. We reject trend conformity to create subversive tailoring, gothic minimalism, and fearless silhouettes for those who dwell beyond the mainstream.
              </p>
            </div>
          </div>
        </div>

        {/* Hero Editorial Photograph & Thesis */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          <div className="lg:col-span-7">
            <div className="relative aspect-[16/10] bg-[#111111] border border-[#292929] overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85"
                alt="AUREVA Dark Alternative Tailoring and Hardware Study"
                className="w-full h-full object-cover object-center hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 bg-[#090909]/90 text-[#F5F5F5] px-3.5 py-1.5 text-[9px] font-mono uppercase tracking-widest border border-[#292929]">
                ARCHIVE SILHOUETTE 01 — SUBVERSIVE DRAPE & HEAVY HARDWARE
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-[#B8FF00] block">
              THE PHILOSOPHY
            </span>
            <blockquote className="font-['Syne'] text-2xl sm:text-3xl text-[#F5F5F5] font-bold uppercase leading-snug">
              "WE STRIP AWAY TRIVIAL NOVELTY TO EXPOSE PURE FORM, DEEP OBSIDIAN TONES, AND REBELLIOUS INTENT."
            </blockquote>
            <p className="text-xs text-[#A6A6A6] leading-relaxed font-sans">
              AUREVA was engineered as a bold rebellion against cookie-cutter fast fashion. We fuse occult symbolism, industrial hardware, and dramatic architectural drape into everyday wearable statement pieces that command attention.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#B8FF00] hover:bg-[#cbfb27] text-[#090909] font-['Oswald'] text-xs uppercase tracking-wider font-bold transition-all"
              >
                <span>EXPLORE ALL DROPS</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Pillars */}
      <section className="bg-[#111111] py-20 sm:py-28 border-y border-[#292929] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-xl space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#B8FF00] block">
              PILLARS OF REBELLION
            </span>
            <h2 className="font-['Syne'] text-3xl sm:text-4xl uppercase font-bold tracking-wider text-[#F5F5F5]">
              CRAFTED WITHOUT COMPROMISE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#171717] border border-[#292929] space-y-4">
              <div className="w-12 h-12 flex items-center justify-center bg-[#111111] border border-[#292929] text-[#B8FF00]">
                <Scissors size={20} />
              </div>
              <h3 className="font-['Oswald'] uppercase text-lg font-bold text-[#F5F5F5]">
                SUBVERSIVE TAILORING
              </h3>
              <p className="text-xs text-[#A6A6A6] leading-relaxed font-sans">
                Asymmetric hems, oversized dropped shoulders, and deconstructed collars engineered for kinetic drape and darkwear silhouettes.
              </p>
            </div>

            <div className="p-6 bg-[#171717] border border-[#292929] space-y-4">
              <div className="w-12 h-12 flex items-center justify-center bg-[#111111] border border-[#292929] text-[#B8FF00]">
                <Layers size={20} />
              </div>
              <h3 className="font-['Oswald'] uppercase text-lg font-bold text-[#F5F5F5]">
                OBSIDIAN FABRICATION
              </h3>
              <p className="text-xs text-[#A6A6A6] leading-relaxed font-sans">
                Dense ring-spun organic cottons, cruelty-free vegan leathers, and deep-dyed yarns that maintain rich jet black saturation wash after wash.
              </p>
            </div>

            <div className="p-6 bg-[#171717] border border-[#292929] space-y-4">
              <div className="w-12 h-12 flex items-center justify-center bg-[#111111] border border-[#292929] text-[#B8FF00]">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-['Oswald'] uppercase text-lg font-bold text-[#F5F5F5]">
                INDUSTRIAL HARDWARE
              </h3>
              <p className="text-xs text-[#A6A6A6] leading-relaxed font-sans">
                Gunmetal D-rings, heavy-gauge YKK zippers, harness buckles, and reinforced grommets built to withstand the test of underground subculture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lookbook Visual Campaign */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#292929] pb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#B8FF00] block">
              SEASONAL ARCHIVE
            </span>
            <h2 className="font-['Syne'] text-3xl sm:text-5xl uppercase font-bold text-[#F5F5F5] mt-1">
              CAMPAIGN VISUALS
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs uppercase tracking-wider font-['Oswald'] font-bold text-[#B8FF00] hover:underline font-mono inline-flex items-center gap-1.5"
          >
            <span>SHOP THE COLLECTION</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
              title: 'CYBER GRUNGE CORSET',
              coord: 'DROP 01 // NOCTURNE',
            },
            {
              src: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85',
              title: 'SUBVERSIVE TRENCH',
              coord: 'DROP 02 // OBSIDIAN',
            },
            {
              src: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85',
              title: 'TACTICAL CARGO DRESS',
              coord: 'DROP 03 // DARKWEAR',
            },
            {
              src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',
              title: 'INDUSTRIAL CHOKER TIE',
              coord: 'DROP 04 // HARDWARE',
            },
          ].map((item, idx) => (
            <div key={idx} className="group relative aspect-[3/4] bg-[#111111] border border-[#292929] overflow-hidden">
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-5 flex flex-col justify-end">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#B8FF00] block">
                  {item.coord}
                </span>
                <h4 className="font-['Syne'] text-sm uppercase font-bold text-[#F5F5F5] mt-1">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final Brand Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-14 bg-[#171717] border border-[#292929] text-center space-y-6">
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#B8FF00] block">
            JOIN THE UNDERGROUND
          </span>
          <h2 className="font-['Syne'] text-3xl sm:text-5xl uppercase font-bold text-[#F5F5F5]">
            BE UNAPOLOGETICALLY YOU
          </h2>
          <p className="text-xs text-[#A6A6A6] font-sans max-w-lg mx-auto leading-relaxed">
            Ready to elevate your wardrobe with dark alternative tailoring? Browse our complete collection with complimentary express delivery on orders over ₹2,999.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#B8FF00] hover:bg-[#cbfb27] text-[#090909] font-['Oswald'] text-sm uppercase tracking-[0.18em] font-bold shadow-[0_0_20px_rgba(184,255,0,0.25)] transition-all"
            >
              <span>SHOP THE FULL REPERTOIRE</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  )
}
