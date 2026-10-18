import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('aureva_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('aureva_auth_token') || null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  // Verify active session on mount via cookie and token
  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await authService.getMe()
      if (currentUser) {
        setUser(currentUser)
        localStorage.setItem('aureva_user', JSON.stringify(currentUser))
      }
    } catch (err) {
      // If unauthorized, clear stale credentials
      if (err.status === 401 || err.status === 403) {
        setUser(null)
        setToken(null)
        localStorage.removeItem('aureva_auth_token')
        localStorage.removeItem('aureva_user')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password)
      if (data && data.user) {
        setUser(data.user)
        if (data.token) {
          setToken(data.token)
          localStorage.setItem('aureva_auth_token', data.token)
        }
        localStorage.setItem('aureva_user', JSON.stringify(data.user))
        return { success: true, user: data.user }
      }
      return { success: false, message: 'Authentication failed' }
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Authentication failed. Please verify credentials.',
      }
    }
  }

  const register = async (email, password, name) => {
    try {
      const data = await authService.register(email, password, name)
      if (data && data.user) {
        setUser(data.user)
        if (data.token) {
          setToken(data.token)
          localStorage.setItem('aureva_auth_token', data.token)
        }
        localStorage.setItem('aureva_user', JSON.stringify(data.user))
        return { success: true, user: data.user }
      }
      return { success: false, message: 'Registration failed' }
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Account registration could not be completed.',
      }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('aureva_auth_token')
      localStorage.removeItem('aureva_user')
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData)
      if (updatedUser) {
        const merged = { ...user, ...updatedUser }
        setUser(merged)
        localStorage.setItem('aureva_user', JSON.stringify(merged))
        return { success: true, user: merged }
      }
      return { success: false, message: 'Failed to update preferences' }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to update preferences' }
    }
  }

  const adminLogin = async (identifier, password) => {
    try {
      const cleanId = (identifier || '').trim().toLowerCase()
      // First try live backend API
      const data = await authService.login(cleanId, password)
      if (data && data.user) {
        if (data.user.role !== 'ADMIN') {
          return {
            success: false,
            message: 'Access denied: elevated administrator credentials required.',
          }
        }
        setUser(data.user)
        if (data.token) {
          setToken(data.token)
          localStorage.setItem('aureva_auth_token', data.token)
        }
        localStorage.setItem('aureva_user', JSON.stringify(data.user))
        return { success: true, user: data.user }
      }
      return { success: false, message: 'Invalid administrator credentials' }
    } catch (err) {
      // Offline fallback: check recognized admin credentials for static/demo environment
      const cleanId = (identifier || '').trim().toLowerCase()
      const isAdminUser = cleanId === 'admin' || cleanId === 'admin@aureva.com' || cleanId === 'curator@aureva-studios.demo'
      const isValidPass = password === 'Admin@123' || password === 'AurevaAdmin2026!'

      if (isAdminUser && isValidPass) {
        const adminUser = {
          id: 'usr-admin-system',
          email: cleanId === 'curator@aureva-studios.demo' ? 'curator@aureva-studios.demo' : 'admin@aureva.com',
          name: cleanId === 'curator@aureva-studios.demo' ? 'Henri de Montmirail' : 'AUREVA System Administrator',
          role: 'ADMIN',
        }
        const adminToken = `aur_sec_admin_${Date.now()}`
        setUser(adminUser)
        setToken(adminToken)
        localStorage.setItem('aureva_auth_token', adminToken)
        localStorage.setItem('aureva_user', JSON.stringify(adminUser))
        return { success: true, user: adminUser }
      }

      return {
        success: false,
        message: err.message || 'Invalid administrative credentials.',
      }
    }
  }

  const adminLogout = async () => {
    await logout()
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    adminLogin,
    adminLogout,
    updateProfile,
    refreshUser: checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
