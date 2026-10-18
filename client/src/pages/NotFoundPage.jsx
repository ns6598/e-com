import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, AlertTriangle } from 'lucide-react'
import PageTransition from '../components/motion/PageTransition'

export default function NotFoundPage() {
  return (
    <PageTransition className="max-w-2xl mx-auto px-4 py-28 text-center space-y-6 text-[#F5F5F5]">
      <div className="inline-flex p-4 rounded-full bg-[#171717] border border-[#292929] text-[#B8FF00]">
        <AlertTriangle size={36} />
      </div>
      <span className="text-[10px] uppercase tracking-[0.3em] font-mono text-[#B8FF00] block">
        404 — VOID IN SPACE
      </span>
      <h1 className="font-['Syne'] text-4xl sm:text-6xl uppercase font-extrabold text-[#F5F5F5]">
        PAGE NOT FOUND
      </h1>
      <p className="text-xs text-[#A6A6A6] font-mono max-w-md mx-auto leading-relaxed">
        The drop, silhouette, or archive document you are attempting to locate does not exist or has been relocated.
      </p>
      <div className="pt-4 flex justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#B8FF00] hover:bg-[#cbfb27] text-[#090909] font-['Oswald'] text-sm uppercase tracking-wider font-bold transition-all shadow-[0_0_20px_rgba(184,255,0,0.2)]"
        >
          <span>RETURN HOME</span>
          <ArrowRight size={15} />
        </Link>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3.5 border border-[#292929] bg-[#111111] hover:border-[#B8FF00] hover:text-[#B8FF00] text-[#F5F5F5] font-['Oswald'] text-sm uppercase tracking-wider font-bold transition-all"
        >
          <span>BROWSE ALL DROPS</span>
        </Link>
      </div>
    </PageTransition>
  )
}
