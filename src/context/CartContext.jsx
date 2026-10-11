import React, { createContext, useContext, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const CartContext = createContext(null)

// Valid explicit demo coupon codes
const VALID_COUPONS = {
  AUREVA10: {
    code: 'AUREVA10',
    discountPercent: 10,
    description: '10% privilege on all eligible ready-to-wear',
    minSubtotal: 0,
  },
  WELCOME15: {
    code: 'WELCOME15',
    discountPercent: 15,
    description: '15% welcome courtesy on all atelier merchandise',
    minSubtotal: 0,
  },
  AUREVA15: {
    code: 'AUREVA15',
    discountPercent: 15,
    description: '15% inaugural launch privilege',
    minSubtotal: 0,
  },
}

export function CartProvider({ children }) {
  const [rawCart, setCart] = useLocalStorage('aureva_cart_v1', [])
  const [appliedCoupon, setAppliedCoupon] = useLocalStorage('aureva_coupon_v1', null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [recentAddedItem, setRecentAddedItem] = useState(null)
  const [cartBounced, setCartBounced] = useState(false)

  // Ensure cart is strictly an array of valid items
  const cart = Array.isArray(rawCart)
    ? rawCart.filter((item) => item && item.product && typeof item.product.price === 'number')
    : []

  // Generate unique cart item key based on product id, size and selected color
  const getItemKey = (productId, size, color) => `${productId}-${size || 'default'}-${color || 'default'}`

  const clearRecentAddedItem = () => setRecentAddedItem(null)

  const addToCart = (product, size = null, color = null, quantity = 1) => {
    const selectedSize = size || (product.sizes ? product.sizes[0] : 'Standard')
    const selectedColor = color || (product.colors ? product.colors[0].name : 'Default')

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

    setCart((prevCart) => {
      const itemKey = getItemKey(product.id, selectedSize, selectedColor)
      const existingIndex = prevCart.findIndex(
        (item) => getItemKey(item.product.id, item.size, item.color) === itemKey
      )

      const maxStock = product.stock || 15

      if (existingIndex > -1) {
        const updated = [...prevCart]
        const currentQty = updated[existingIndex].quantity
        const newQty = Math.min(maxStock, currentQty + quantity)
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        }
        return updated
      } else {
        return [
          ...prevCart,
          {
            product,
            size: selectedSize,
            color: selectedColor,
            quantity: Math.min(maxStock, Math.max(1, quantity)),
            addedAt: Date.now(),
          },
        ]
      }
    })
  }

  const removeFromCart = (productId, size, color) => {
    setCart((prevCart) => {
      const targetKey = getItemKey(productId, size, color)
      return prevCart.filter(
        (item) => getItemKey(item.product.id, item.size, item.color) !== targetKey
      )
    })
  }

  const updateQuantity = (productId, size, color, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color)
      return
    }

    setCart((prevCart) => {
      const targetKey = getItemKey(productId, size, color)
      return prevCart.map((item) => {
        if (getItemKey(item.product.id, item.size, item.color) === targetKey) {
          const maxStock = item.product.stock || 15
          return { ...item, quantity: Math.min(maxStock, Math.max(1, quantity)) }
        }
        return item
      })
    })
  }

  const clearCart = () => {
    setCart([])
  }

  // Coupon application logic
  const applyCoupon = (rawCode) => {
    if (!rawCode || typeof rawCode !== 'string') {
      return { success: false, message: 'Please enter a coupon code.' }
    }

    const cleanCode = rawCode.trim().toUpperCase()

    if (appliedCoupon && appliedCoupon.code === cleanCode) {
      return { success: false, message: `Coupon "${cleanCode}" is already active on this bag.` }
    }

    const match = VALID_COUPONS[cleanCode]
    if (match) {
      setAppliedCoupon(match)
      return {
        success: true,
        message: `Success! Code "${cleanCode}" applied: ${match.discountPercent}% courtesy discount.`,
      }
    }

    return {
      success: false,
      message: 'Invalid privilege code. Valid demo codes: AUREVA10 (10% off) or WELCOME15 (15% off).',
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)
  const toggleCart = () => setIsCartOpen((prev) => !prev)

  // Derived integer-safe rupee calculations
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = Math.round(cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0))

  const discount = appliedCoupon && subtotal > 0
    ? Math.round((subtotal * appliedCoupon.discountPercent) / 100)
    : 0

  const freeShippingThreshold = 2999
  const shipping = subtotal === 0 ? 0 : subtotal >= freeShippingThreshold ? 0 : 199
  const grandTotal = Math.max(0, subtotal - discount + shipping)
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)

  // Demo Order Creation
  const createDemoOrder = (customerDetails) => {
    const orderNumber = `AUR-2026-${Math.floor(100000 + Math.random() * 900000)}`
    const order = {
      orderNumber,
      createdAt: new Date().toISOString(),
      customer: customerDetails,
      items: [...cart],
      summary: {
        totalItems,
        subtotal,
        discount,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        shipping,
        grandTotal,
        currency: 'INR',
      },
    }

    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('aureva_last_order_v1', JSON.stringify(order))
      }
    } catch (err) {
      console.warn('Failed saving order to localStorage:', err)
    }

    // Clear cart and coupon after order creation
    clearCart()
    removeCoupon()

    return order
  }

  return (
    <CartContext.Provider
      value={{
        cart,
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
        createDemoOrder,
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
