import React, { useState } from 'react'
import { Settings, Shield, Check, Lock, Bell, Store, Globe } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const [feedback, setFeedback] = useState('')

  // Safe configuration options
  const [settings, setSettings] = useState({
    storeName: 'AUREVA Haute Couture Atelier',
    storeStatus: 'ACTIVE',
    currencyDisplay: 'INR (₹)',
    freeShippingThreshold: 5000,
    notificationEmail: 'concierge@aureva-studios.demo',
    inventoryAlertThreshold: 5,
    orderPrefix: 'AUR-2026',
    maintenanceMode: false,
  })

  const handleSave = (e) => {
    e.preventDefault()
    setFeedback('Administrative preferences saved locally.')
    setTimeout(() => setFeedback(''), 4000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-[#222222] pb-6">
        <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#B8FF00]">
          ATELIER PLATFORM PARAMETERS
        </span>
        <h2 className="font-['Syne'] text-2xl font-bold uppercase text-[#F5F5F5] mt-1">
          CONSOLE CONFIGURATION
        </h2>
      </div>

      {feedback && (
        <div className="p-3.5 text-xs font-mono border border-[#B8FF00] bg-[#172405] text-[#B8FF00] flex items-center gap-2">
          <Check size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Security Notice */}
      <div className="p-4 bg-[#111111] border border-[#262626] space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-[#B8FF00] font-bold">
          <Shield size={14} />
          <span>HARDENED SECURITY POLICY</span>
        </div>
        <p className="text-xs font-mono text-[#888888] leading-relaxed">
          Critical secrets including database connection strings, JWT signing keys, and payment gateway webhooks are stored server-side and never exposed to the browser interface.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs font-mono">
        {/* Section 1: Store Configuration */}
        <div className="p-6 bg-[#121212] border border-[#222222] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#222222] pb-3 text-[#F5F5F5]">
            <Store size={16} className="text-[#B8FF00]" />
            <h3 className="font-['Syne'] font-bold text-sm uppercase">Storefront Parameters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-[#A6A6A6]">Atelier Brand Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#2B2B2B] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-[#A6A6A6]">Currency Display</label>
              <input
                type="text"
                disabled
                value={settings.currencyDisplay}
                className="w-full px-3 py-2 bg-[#141414] border border-[#222222] text-[#737373] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-[#A6A6A6]">Order Reference Prefix</label>
              <input
                type="text"
                value={settings.orderPrefix}
                onChange={(e) => setSettings({ ...settings, orderPrefix: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#2B2B2B] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-[#A6A6A6]">Complimentary Shipping Threshold (₹)</label>
              <input
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#2B2B2B] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Notifications & Inventory Alerts */}
        <div className="p-6 bg-[#121212] border border-[#222222] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#222222] pb-3 text-[#F5F5F5]">
            <Bell size={16} className="text-[#B8FF00]" />
            <h3 className="font-['Syne'] font-bold text-sm uppercase">Alert & Inventory Protocols</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-[#A6A6A6]">Notification Dispatch Address</label>
              <input
                type="email"
                value={settings.notificationEmail}
                onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#2B2B2B] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-[#A6A6A6]">Low-Stock Notification Threshold</label>
              <input
                type="number"
                value={settings.inventoryAlertThreshold}
                onChange={(e) => setSettings({ ...settings, inventoryAlertThreshold: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 bg-[#171717] border border-[#2B2B2B] text-[#F5F5F5] focus:outline-none focus:border-[#B8FF00]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Active Admin Curator Credentials */}
        <div className="p-6 bg-[#121212] border border-[#222222] space-y-3">
          <div className="flex items-center gap-2 border-b border-[#222222] pb-3 text-[#F5F5F5]">
            <Lock size={16} className="text-[#B8FF00]" />
            <h3 className="font-['Syne'] font-bold text-sm uppercase">Curator Session Status</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#171717] border border-[#222222]">
              <span className="text-[10px] text-[#737373] block uppercase">ACTIVE CURATOR</span>
              <span className="text-xs font-semibold text-[#F5F5F5] block truncate mt-1">
                {user?.name || 'Administrator'}
              </span>
            </div>
            <div className="p-3 bg-[#171717] border border-[#222222]">
              <span className="text-[10px] text-[#737373] block uppercase">AUTHENTICATED EMAIL</span>
              <span className="text-xs font-mono text-[#B8FF00] block truncate mt-1">
                {user?.email || 'admin@aureva.com'}
              </span>
            </div>
            <div className="p-3 bg-[#171717] border border-[#222222]">
              <span className="text-[10px] text-[#737373] block uppercase">AUTHORIZATION ROLE</span>
              <span className="text-xs font-bold text-[#F5F5F5] block mt-1">
                {user?.role || 'ADMIN'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#B8FF00] text-[#090909] font-['Syne'] font-extrabold text-xs uppercase tracking-wider hover:bg-[#D1FF38] transition-all cursor-pointer"
          >
            SAVE CONFIGURATION
          </button>
        </div>
      </form>
    </div>
  )
}
