import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from '../cart/CartDrawer'
import ScrollToTop from './ScrollToTop'
import ScrollProgress from '../motion/ScrollProgress'
import CustomCursorSpotlight from '../motion/CustomCursorSpotlight'
import CartFlyToast from '../motion/CartFlyToast'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#08090D] text-[#F3F4F6] relative overflow-x-hidden selection:bg-[#D4AF37] selection:text-[#08090D]">
      <ScrollToTop />

      {/* Global Scroll Reading Progress Bar */}
      <ScrollProgress />

      {/* Interactive Cursor Following Spotlight & Context Badge */}
      <CustomCursorSpotlight />

      {/* Atmospheric Ambient Lighting Gradients */}
      <div className="ambient-glow-gold top-0 left-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="ambient-glow-crimson top-[800px] right-0 w-[700px] h-[700px] pointer-events-none" />
      <div className="ambient-glow-gold bottom-[1200px] left-0 w-[500px] h-[500px] pointer-events-none" />

      {/* Skip to Content Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-[#D4AF37] text-[#08090D] px-5 py-2.5 text-xs font-semibold tracking-widest uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Skip to main content
      </a>

      {/* Persistent Liquid Glass Navigation Header */}
      <Header />

      {/* Main Dynamic View Outlet */}
      <main id="main-content" className="flex-1 relative z-10">
        <Outlet />
      </main>

      {/* Instant Feedback Cart Toast */}
      <CartFlyToast />

      {/* Cart Flyout / Drawer */}
      <CartDrawer />

      {/* Persistent Neo-Luxury Footer */}
      <Footer />
    </div>
  )
}
