import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from '../cart/CartDrawer'
import ScrollToTop from './ScrollToTop'
import ScrollProgress from '../motion/ScrollProgress'
import CustomCursorSpotlight from '../motion/CustomCursorSpotlight'
import CartFlyToast from '../motion/CartFlyToast'
import VaultAccessModal from '../vault/VaultAccessModal'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090909] text-[#F5F5F5] relative overflow-x-hidden selection:bg-[#B8FF00] selection:text-[#090909]">
      <ScrollToTop />

      {/* Global Scroll Reading Progress Bar */}
      <ScrollProgress />

      {/* Interactive Cursor Following Spotlight & Context Badge */}
      <CustomCursorSpotlight />

      {/* Dark Alternative Atmospheric Ambient Lighting Gradients */}
      <div className="ambient-glow-crimson top-[300px] -right-[150px] w-[500px] h-[500px] pointer-events-none" />
      <div className="ambient-glow-dark bottom-[900px] -left-[150px] w-[450px] h-[450px] pointer-events-none" />

      {/* Skip to Content Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-[#B8FF00] text-[#090909] px-5 py-2.5 text-xs font-bold tracking-widest uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white font-mono"
      >
        Skip to main content
      </a>

      {/* Persistent Dark Alternative Navigation Header */}
      <Header />

      {/* Main Dynamic View Outlet */}
      <main id="main-content" className="flex-1 relative z-10">
        <Outlet />
      </main>

      {/* Instant Feedback Cart Toast */}
      <CartFlyToast />

      {/* Cart Flyout / Drawer */}
      <CartDrawer />

      {/* Global Hidden Vault Access Reveal Modal */}
      <VaultAccessModal />

      {/* Persistent Dark Fashion Footer */}
      <Footer />
    </div>
  )
}
