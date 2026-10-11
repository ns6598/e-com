import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import cartService from '../services/cartService'
import couponService from '../services/couponService'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

/**
 * Normalizes backend cart item payload into consistent frontend representation
 */
function normalizeCartItem(item) {
  if (!item) return null

  const variant = item.variant || {}
  const product = variant.product || item.product || {}
  const rawImages = product.images || []
  const images = rawImages.map((img) => (typeof img === 'string' ? img : img.imageUrl || ''))

  const fallbackImage = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'

  return {
    id: item.id || `local-${Date.now()}-${Math.random()}`,
    itemId: item.id,
    variantId: item.variantId || variant.id,
    size: variant.size || item.size || 'Standard',
    color: variant.color || item.color || 'Default',
    quantity: Math.max(1, item.quantity || 1),
    product: {
      id: product.id || item.productId,
      name: product.name || 'Atelier Monograph Piece',
      slug: product.slug || '',
      price: Number(product.basePrice || product.price || 0),
      originalPrice: product.comparisonPrice ? Number(product.comparisonPrice) : null,
      images: images.length > 0 ? images : [fallbackImage],
      category: product.category?.name || product.category || 'Atelier',
      department: product.category?.department || product.department || 'Women',
      stock: variant.stockQuantity !== undefined ? variant.stockQuantity : product.stock || 15,
      variants: product.variants || [],
    },
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [recentAddedItem, setRecentAddedItem] = useState(null)
  const [cartBounced, setCartBounced] = useState(false)

  // Fetch authoritative cart from backend Express REST API
  const refreshCart = useCallback(async () => {
    try {
      setLoading(true)
      const serverCart = await cartService.getCart()
      if (serverCart && Array.isArray(serverCart.items)) {
        const normalized = serverCart.items.map(normalizeCartItem).filter(Boolean)
        setCart(normalized)
      }
    } catch (err) {
      console.warn('[CartContext] Backend cart sync note:', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Sync cart whenever patron login session changes
  useEffect(() => {
    refreshCart()
  }, [user?.id, refreshCart])

  const clearRecentAddedItem = () => setRecentAddedItem(null)

  // Add item to bag via API
  const addToCart = async (product, size = null, color = null, quantity = 1) => {
    const selectedSize = size || (product.sizes ? product.sizes[0] : 'Standard')
    const selectedColor = color || (product.colors ? product.colors[0]?.name || product.colors[0] : 'Default')

    // Find matching variant ID
    let targetVariantId = null
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      const match = product.variants.find(
        (v) =>
          (!selectedSize || v.size?.toLowerCase() === selectedSize.toLowerCase()) &&
          (!selectedColor || v.color?.toLowerCase() === selectedColor.toLowerCase())
      )
      targetVariantId = match?.id || product.variants[0]?.id
    }

    // Trigger visual toast & bag bounce micro-interaction
    setRecentAddedItem({
      product,
      size: selectedSize,
      color: selectedColor,
      quantity,
      id: Date.now(),
    })
    setCartBounced(true)
    setTimeout(() => setCartBounced(false), 800)

    try {
      if (targetVariantId) {
        await cartService.addItem(targetVariantId, quantity)
        await refreshCart()
        return { success: true }
      }
    } catch (err) {
      console.warn('[CartContext] Server add fallback:', err.message)
    }

    // Optimistic fallback if variant not yet attached
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.product.id === product.id &&
          i.size?.toLowerCase() === selectedSize.toLowerCase() &&
          i.color?.toLowerCase() === selectedColor.toLowerCase()
      )
      if (existingIdx > -1) {
        const next = [...prev]
        next[existingIdx].quantity += quantity
        return next
      }
      return [
        ...prev,
        normalizeCartItem({
          variantId: targetVariantId,
          size: selectedSize,
          color: selectedColor,
          quantity,
          product,
        }),
      ]
    })

    return { success: true }
  }

  // Update item quantity
  const updateQuantity = async (arg1, arg2, arg3, arg4) => {
    let targetItem = null
    let newQty = 1

    if (arg3 === undefined && arg4 === undefined) {
      // Called with (itemId, quantity)
      const itemId = arg1
      newQty = arg2
      targetItem = cart.find((i) => i.id === itemId || i.itemId === itemId)
    } else {
      // Called with (productId, size, color, quantity)
      const productId = arg1
      const size = arg2
      const color = arg3
      newQty = arg4
      targetItem = cart.find(
        (i) =>
          i.product.id === productId &&
          (!size || i.size === size) &&
          (!color || i.color === color)
      )
    }

    if (!targetItem) return

    if (newQty <= 0) {
      await removeFromCart(targetItem.id)
      return
    }

    try {
      if (targetItem.itemId && !targetItem.itemId.startsWith('local-')) {
        await cartService.updateItem(targetItem.itemId, newQty)
        await refreshCart()
        return
      }
    } catch (err) {
      console.warn('[CartContext] Server update fallback:', err.message)
    }

    // Local optimistic update
    setCart((prev) =>
      prev.map((i) => (i.id === targetItem.id ? { ...i, quantity: newQty } : i))
    )
  }

  // Remove item from bag
  const removeFromCart = async (arg1, arg2, arg3) => {
    let targetItem = null

    if (arg2 === undefined && arg3 === undefined) {
      // Called with (itemId)
      const itemId = arg1
      targetItem = cart.find((i) => i.id === itemId || i.itemId === itemId)
    } else {
      // Called with (productId, size, color)
      const productId = arg1
      const size = arg2
      const color = arg3
      targetItem = cart.find(
        (i) =>
          i.product.id === productId &&
          (!size || i.size === size) &&
          (!color || i.color === color)
      )
    }

    if (!targetItem) return

    try {
      if (targetItem.itemId && !targetItem.itemId.startsWith('local-')) {
        await cartService.removeItem(targetItem.itemId)
        await refreshCart()
        return
      }
    } catch (err) {
      console.warn('[CartContext] Server remove fallback:', err.message)
    }

    // Local optimistic update
    setCart((prev) => prev.filter((i) => i.id !== targetItem.id))
  }

  const clearCart = async () => {
    // Remove all server items
    const serverItems = cart.filter((i) => i.itemId && !i.itemId.startsWith('local-'))
    await Promise.allSettled(serverItems.map((i) => cartService.removeItem(i.itemId)))
    setCart([])
  }

  // Real API coupon validation
  const applyCoupon = async (rawCode) => {
    if (!rawCode || typeof rawCode !== 'string') {
      return { success: false, message: 'Please enter a coupon code.' }
    }

    const cleanCode = rawCode.trim().toUpperCase()

    if (appliedCoupon && appliedCoupon.code === cleanCode) {
      return { success: false, message: `Privilege code "${cleanCode}" is already active.` }
    }

    try {
      const data = await couponService.validateCoupon(cleanCode, subtotal)
      if (data && data.valid) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountPercent: data.coupon.discountPercent || Math.round((data.discountAmount / (subtotal || 1)) * 100),
          discountAmount: data.discountAmount,
          description: data.coupon.description || 'Atelier courtesy discount',
        })
        return {
          success: true,
          message: `Success! Code "${cleanCode}" applied: ${data.coupon.discountPercent || 15}% courtesy privilege.`,
        }
      }
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Invalid privilege code. Valid codes: AUREVA10, WELCOME15, AUREVA15.',
      }
    }

    return {
      success: false,
      message: 'Invalid privilege code.',
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)
  const toggleCart = () => setIsCartOpen((prev) => !prev)

  // Derived financial calculations
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = Math.round(cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0))

  const discount = appliedCoupon && subtotal > 0
    ? appliedCoupon.discountAmount !== undefined
      ? Math.min(subtotal, appliedCoupon.discountAmount)
      : Math.round((subtotal * appliedCoupon.discountPercent) / 100)
    : 0

  const freeShippingThreshold = 2999
  const shipping = subtotal === 0 ? 0 : subtotal >= freeShippingThreshold ? 0 : 199
  const grandTotal = Math.max(0, subtotal - discount + shipping)
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        refreshCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        toggleCart,
        totalItems,
        subtotal,
        shipping,
        freeShippingThreshold,
        remainingForFreeShipping,
        discount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        grandTotal,
        recentAddedItem,
        clearRecentAddedItem,
        cartBounced,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext
