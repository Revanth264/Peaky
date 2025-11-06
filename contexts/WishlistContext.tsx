'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const GUEST_WISHLIST_KEY = 'peakime_guest_wishlist'

interface WishlistContextType {
  wishlist: string[]
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  getWishlistCount: () => number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, getIdToken } = useAuth()
  const [wishlist, setWishlist] = useState<string[]>([])

  // Load wishlist on mount and when user changes
  useEffect(() => {
    const loadWishlist = async () => {
      if (user?.wishlist) {
        // User is logged in - merge guest wishlist with user wishlist
        if (typeof window !== 'undefined') {
          const guestWishlist = localStorage.getItem(GUEST_WISHLIST_KEY)
          if (guestWishlist) {
            try {
              const guestItems = JSON.parse(guestWishlist) as string[]
              // Merge: combine both lists and remove duplicates
              const merged = [...new Set([...user.wishlist, ...guestItems])]
              setWishlist(merged)
              // Sync merged list to Firestore
              if (merged.length > user.wishlist.length) {
                try {
                  const token = await getIdToken()
                  if (token) {
                    await axios.put(
                      '/api/auth/update',
                      { wishlist: merged },
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    )
                  }
                } catch (error) {
                  // Silently fail if sync fails
                  console.warn('Failed to sync merged wishlist:', error)
                }
              }
              // Clear guest wishlist after merging
              localStorage.removeItem(GUEST_WISHLIST_KEY)
            } catch (error) {
              console.error('Error merging guest wishlist:', error)
              // If merge fails, just use user's wishlist
              setWishlist(user.wishlist)
              localStorage.removeItem(GUEST_WISHLIST_KEY)
            }
          } else {
            // No guest wishlist, just use user's wishlist
            setWishlist(user.wishlist)
          }
        } else {
          setWishlist(user.wishlist)
        }
      } else {
        // Guest user - load from localStorage
        if (typeof window !== 'undefined') {
          const guestWishlist = localStorage.getItem(GUEST_WISHLIST_KEY)
          if (guestWishlist) {
            try {
              setWishlist(JSON.parse(guestWishlist))
            } catch (error) {
              console.error('Error parsing guest wishlist:', error)
              localStorage.removeItem(GUEST_WISHLIST_KEY)
              setWishlist([])
            }
          } else {
            setWishlist([])
          }
        } else {
          setWishlist([])
        }
      }
    }
    
    loadWishlist()
  }, [user, getIdToken])

  // Sync guest wishlist to localStorage
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlist))
    }
  }, [wishlist, user])

  const addToWishlist = async (productId: string) => {
    if (wishlist.includes(productId)) {
      return // Already in wishlist
    }

    const newWishlist = [...wishlist, productId]
    setWishlist(newWishlist)

    if (user) {
      // User is logged in - sync to Firestore
      try {
        const token = await getIdToken()
        if (!token) {
          toast.error('Please login again')
          return
        }

        await axios.put(
          '/api/auth/update',
          { wishlist: newWishlist },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        toast.success('Added to wishlist!')
      } catch (error) {
        console.error('Failed to update wishlist:', error)
        toast.error('Failed to update wishlist')
        // Revert on error
        setWishlist(wishlist)
      }
    } else {
      // Guest user - just show toast
      toast.success('Added to wishlist!')
    }
  }

  const removeFromWishlist = async (productId: string) => {
    if (!wishlist.includes(productId)) {
      return // Not in wishlist
    }

    const newWishlist = wishlist.filter((id) => id !== productId)
    setWishlist(newWishlist)

    if (user) {
      // User is logged in - sync to Firestore
      try {
        const token = await getIdToken()
        if (!token) {
          toast.error('Please login again')
          return
        }

        await axios.put(
          '/api/auth/update',
          { wishlist: newWishlist },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        toast.success('Removed from wishlist')
      } catch (error) {
        console.error('Failed to update wishlist:', error)
        toast.error('Failed to remove from wishlist')
        // Revert on error
        setWishlist(wishlist)
      }
    } else {
      // Guest user - just show toast
      toast.success('Removed from wishlist')
    }
  }

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId)
  }

  const getWishlistCount = () => {
    return wishlist.length
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getWishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

