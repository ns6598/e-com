import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

const TITLE_MAP = {
  '/vault': 'VAULT EXECUTIVE DASHBOARD',
  '/vault/dashboard': 'VAULT EXECUTIVE DASHBOARD',
  '/vault/products': 'CATALOG & PRODUCT ARCHIVE',
  '/vault/categories': 'DEPARTMENT & TAXONOMY',
  '/vault/inventory': 'STOCK & VARIANT INVENTORY',
  '/vault/orders': 'SALES & DISPATCH DISPATCHES',
  '/vault/customers': 'PATRON & CLIENT DIRECTORY',
  '/vault/login-activity': 'SECURITY & AUTHENTICATION AUDIT',
  '/vault/coupons': 'PROMOTIONS & PRIVILEGE CODES',
  '/vault/messages': 'CLIENTELE CONCIERGE INQUIRIES',
  '/vault/settings': 'CONSOLE CONFIGURATION',
  '/admin': 'VAULT EXECUTIVE DASHBOARD',
  '/admin/dashboard': 'VAULT EXECUTIVE DASHBOARD',
  '/admin/products': 'CATALOG & PRODUCT ARCHIVE',
  '/admin/categories': 'DEPARTMENT & TAXONOMY',
  '/admin/inventory': 'STOCK & VARIANT INVENTORY',
  '/admin/orders': 'SALES & DISPATCH DISPATCHES',
  '/admin/customers': 'PATRON & CLIENT DIRECTORY',
  '/admin/login-activity': 'SECURITY & AUTHENTICATION AUDIT',
  '/admin/coupons': 'PROMOTIONS & PRIVILEGE CODES',
  '/admin/messages': 'CLIENTELE CONCIERGE INQUIRIES',
  '/admin/settings': 'CONSOLE CONFIGURATION',
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const currentTitle = TITLE_MAP[location.pathname] || 'AUREVA VAULT'

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] antialiased selection:bg-[#B8FF00] selection:text-[#090909]">
      {/* Isolated Admin Sidebar */}
      <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminHeader
          onOpenMobile={() => setMobileOpen(true)}
          title={currentTitle}
        />

        {/* Admin Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </main>

        {/* Minimal Admin Footer */}
        <footer className="px-6 py-4 border-t border-[#1C1C1C] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-[#737373] uppercase tracking-widest bg-[#0D0D0D]">
          <span>AUREVA ATELIER ADMINISTRATION SYSTEM • V2.4 PRO</span>
          <span>STRICTLY CONFIDENTIAL • ZERO ACCESS TO CUSTOMER PASSWORDS</span>
        </footer>
      </div>
    </div>
  )
}
