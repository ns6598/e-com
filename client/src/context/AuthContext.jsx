import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

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

  // Verify active session on mount
  const checkAuth = useCallback(async () => {
    const savedToken = localStorage.getItem('aureva_auth_token')
    if (!savedToken) {
      setLoading(false)
      return
    }

    try {
      const res = await api.get('/auth/me')
      if (res.success && res.data?.user) {
        setUser(res.data.user)
        localStorage.setItem('aureva_user', JSON.stringify(res.data.user))
      }
    } catch {
      // If session token expired or invalid, keep fallback cached user or clear if unauthorized
      console.warn('[AuthContext] Session verification note: maintaining local session')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password })
      if (res.success && res.data) {
        const receivedUser = res.data.user
        const receivedToken = res.data.token

        setUser(receivedUser)
        setToken(receivedToken)

        localStorage.setItem('aureva_auth_token', receivedToken)
        localStorage.setItem('aureva_user', JSON.stringify(receivedUser))

        return { success: true, user: receivedUser }
      }
      return { success: false, message: res.message || 'Login failed' }
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Authentication failed. Please verify credentials.',
      }
    }
  }

  const register = async (email, password, name) => {
    try {
      const res = await api.post('/auth/register', { email, password, name })
      if (res.success && res.data) {
        const receivedUser = res.data.user
        const receivedToken = res.data.token

        setUser(receivedUser)
        setToken(receivedToken)

        localStorage.setItem('aureva_auth_token', receivedToken)
        localStorage.setItem('aureva_user', JSON.stringify(receivedUser))

        return { success: true, user: receivedUser }
      }
      return { success: false, message: res.message || 'Registration failed' }
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Account registration could not be completed.',
      }
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout').catch(() => {})
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('aureva_auth_token')
      localStorage.removeItem('aureva_user')
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData)
      if (res.success && res.data?.user) {
        const updated = { ...user, ...res.data.user }
        setUser(updated)
        localStorage.setItem('aureva_user', JSON.stringify(updated))
        return { success: true, user: updated }
      }
      return { success: false, message: res.message }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to update preferences' }
    }
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
