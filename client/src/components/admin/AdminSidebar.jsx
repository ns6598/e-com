import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingBag,
  Users,
  ShieldCheck,
  Tag,
  Mail,
  Settings,
  LogOut,
  Shield,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Categories', path: '/admin/categories', icon: Layers },
  { label: 'Inventory', path: '/admin/inventory', icon: Boxes },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Customers', path: '/admin/customers', icon: Users },
  { label: 'Login Activity', path: '/admin/login-activity', icon: ShieldCheck },
  { label: 'Coupons', path: '/admin/coupons', icon: Tag },
  { label: 'Messages', path: '/admin/messages', icon: Mail },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
]

export default function AdminSidebar({ mobileOpen, onCloseMobile }) {
  const { user, adminLogout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await adminLogout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0F0F0F] border-r border-[#222222] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Branding & Logo */}
        <div>
          <div className="h-18 px-6 border-b border-[#222222] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1A1A1A] border border-[#B8FF00] flex items-center justify-center text-[#B8FF00] font-bold">
                <Shield size={16} />
              </div>
              <div>
                <span className="font-['Syne'] font-extrabold text-base tracking-[0.2em] text-[#F5F5F5] block leading-none">
                  AUREVA
                </span>
                <span className="text-[9px] uppercase font-mono tracking-[0.25em] text-[#B8FF00] mt-1 block">
                  ADMIN PANEL
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 text-xs font-mono tracking-wider uppercase transition-all rounded-xs ${
                      isActive
                        ? 'bg-[#1A1A1A] text-[#B8FF00] border-l-2 border-[#B8FF00] font-bold shadow-xs'
                        : 'text-[#A6A6A6] hover:text-[#F5F5F5] hover:bg-[#141414]'
                    }`
                  }
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Bottom: Admin Profile & Logout */}
        <div className="p-4 border-t border-[#222222] space-y-3 bg-[#0A0A0A]">
          {/* External Store Link */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 text-[10px] uppercase font-mono tracking-wider text-[#737373] hover:text-[#B8FF00] bg-[#121212] border border-[#222222] transition-colors"
          >
            <span>LIVE BOUTIQUE</span>
            <ExternalLink size={12} />
          </a>

          {/* Admin Profile Info */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#1F1F1F] border border-[#333333] flex items-center justify-center font-bold text-xs text-[#B8FF00]">
              {(user?.name || 'A')[0]}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-[#F5F5F5] truncate block">
                {user?.name || 'Admin Curator'}
              </span>
              <span className="text-[10px] font-mono text-[#A6A6A6] truncate block">
                {user?.email || 'admin@aureva.com'}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs uppercase font-mono tracking-wider text-[#FF4D4D] hover:bg-[#1C1111] border border-transparent hover:border-[#8B0000]/60 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>DISCONNECT ADMIN</span>
          </button>
        </div>
      </aside>
    </>
  )
}
