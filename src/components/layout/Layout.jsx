import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from '../cart/CartDrawer'
import ScrollToTop from './ScrollToTop'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2EA] text-[#171717]">
      <ScrollToTop />
      {/* Skip to Content Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-[#171717] text-[#F6F2EA] px-4 py-2 text-xs tracking-widest uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D202D]"
      >
        Skip to main content
      </a>

      {/* Persistent Navigation Header */}
      <Header />

      {/* Main Dynamic View Outlet */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* Cart Flyout / Drawer */}
      <CartDrawer />

      {/* Persistent Editorial Footer */}
      <Footer />
    </div>
  )
}
