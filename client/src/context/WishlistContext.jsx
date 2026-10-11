import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import wishlistService from '../services/wishlistService'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(false)

  // Sync wishlist from backend on mount and auth change
  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      // For unauthenticated visitors, maintain local fallback
      try {
        const local = localStorage.getItem('aureva_guest_wishlist')
        if (local) setWishlist(JSON.parse(local))
      } catch {
        // Handled
      }
      return
    }

    try {
      setLoading(true)
      const data = await wishlistService.getWishlist()
      if (data && Array.isArray(data.items)) {
        // Normalize wishlist items
        const normalized = data.items.map((i) => i.product || i).filter(Boolean)
        setWishlist(normalized)
      }
    } catch (err) {
      console.warn('[WishlistContext] Backend sync note:', err.message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refreshWishlist()
  }, [refreshWishlist])

  const addToWishlist = async (product) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev
      const next = [...prev, product]
      if (!isAuthenticated) {
        localStorage.setItem('aureva_guest_wishlist', JSON.stringify(next))
      }
      return next
    })

    if (isAuthenticated) {
      try {
        await wishlistService.addItem(product.id)
      } catch (err) {
        console.warn('[WishlistContext] Server add note:', err.message)
      }
    }
  }

  const removeFromWishlist = async (productId) => {
    setWishlist((prev) => {
      const next = prev.filter((item) => item.id !== productId)
      if (!isAuthenticated) {
        localStorage.setItem('aureva_guest_wishlist', JSON.stringify(next))
      }
      return next
    })

    if (isAuthenticated) {
      try {
        await wishlistService.removeItem(productId)
      } catch (err) {
        console.warn('[WishlistContext] Server remove note:', err.message)
      }
    }
  }

  const toggleWishlist = async (product) => {
    const exists = wishlist.some((item) => item.id === product.id)
    if (exists) {
      await removeFromWishlist(product.id)
    } else {
      await addToWishlist(product)
    }
  }

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId)
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        refreshWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        totalWishlist: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

export default WishlistContext
