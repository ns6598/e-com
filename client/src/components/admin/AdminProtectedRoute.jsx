import React from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export default function AdminProtectedRoute({ children }) {
  const { user, isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col items-center justify-center p-6 font-mono text-xs">
        <div className="w-8 h-8 border-2 border-[#B8FF00] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="tracking-[0.2em] uppercase text-[#A6A6A6]">
          VERIFYING ATELIER CREDENTIALS...
        </span>
      </div>
    )
  }

  // 1. Not logged in -> redirect to dedicated admin login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // 2. Logged in, but customer role (not ADMIN)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111111] border border-[#8B0000]/60 p-8 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 bg-[#1C1111] border border-[#8B0000] mx-auto flex items-center justify-center text-[#FF4D4D]">
            <ShieldAlert size={28} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#FF4D4D] block mb-1">
              403 FORBIDDEN • RESTRICTED SECTOR
            </span>
            <h1 className="font-['Syne'] text-2xl font-bold uppercase tracking-wider text-[#F5F5F5]">
              ACCESS DENIED
            </h1>
            <p className="text-xs text-[#A6A6A6] font-mono mt-3 leading-relaxed">
              Account <span className="text-[#F5F5F5] font-semibold">{user?.email}</span> has patron privileges only. Elevated curator authorization is required to access the AUREVA administration console.
            </p>
          </div>
          <div className="pt-4 border-t border-[#222222] flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 py-3 text-xs uppercase font-mono tracking-wider border border-[#292929] bg-[#171717] hover:border-[#F5F5F5] transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} />
              <span>RETURN TO STORE</span>
            </Link>
            <Link
              to="/admin/login"
              className="flex-1 py-3 text-xs uppercase font-mono tracking-wider bg-[#B8FF00] text-[#090909] font-bold hover:bg-[#D1FF38] transition-colors flex items-center justify-center"
            >
              ADMIN SIGN IN
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return children
}
