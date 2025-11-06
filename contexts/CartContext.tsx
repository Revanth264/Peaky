'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface CartItem {
  _id: string
  name: string
  price: number
  image: string
  quantity: number
  size?: string
  color?: string
  stock: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (id: string, size?: string, color?: string) => void
  updateQuantity: (id: string, quantity: number, size?: string, color?: string) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCartItems(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (i) => i._id === item._id && i.size === item.size && i.color === item.color
      )
      if (existingItem) {
        return prevItems.map((i) =>
          i._id === item._id && i.size === item.size && i.color === item.color
            ? { ...i, quantity: Math.min(i.quantity + 1, item.stock) }
            : i
        )
      }
      return [...prevItems, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string, size?: string, color?: string) => {
    setCartItems((prevItems) => 
      prevItems.filter((item) => 
        !(item._id === id && item.size === size && item.color === color)
      )
    )
  }

  const updateQuantity = (id: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, size, color)
      return
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item._id === id && item.size === size && item.color === color) {
          return { ...item, quantity: Math.min(quantity, item.stock) }
        }
        return item
      })
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

