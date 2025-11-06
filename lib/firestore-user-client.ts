import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export interface Address {
  id?: string
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault?: boolean
  type?: 'home' | 'work' | 'other'
}

export interface UserProfile {
  uid: string
  email: string
  name: string
  phone?: string
  avatar?: string
  role?: 'user' | 'admin'
  addresses?: Address[]
  createdAt?: Date
  updatedAt?: Date
  // E-commerce specific fields
  cartItems?: any[]
  wishlist?: string[] // Product IDs
  orderHistory?: string[] // Order IDs
  preferences?: {
    currency?: string
    language?: string
    notifications?: {
      email?: boolean
      sms?: boolean
      push?: boolean
    }
  }
  // Analytics and tracking
  lastLogin?: Date
  totalOrders?: number
  totalSpent?: number
  // Social/Referral
  referralCode?: string
  referredBy?: string
  // Newsletter subscription
  newsletterSubscribed?: boolean
}

// Client-side functions only (using client SDK)
export async function getUserProfileClient(uid: string): Promise<UserProfile | null> {
  if (typeof window === 'undefined') {
    return null
  }
  
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (!userDoc.exists()) {
      return null
    }
    return { uid, ...userDoc.data() } as UserProfile
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function updateUserProfileClient(uid: string, userData: Partial<UserProfile>): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Client-side function called on server')
  }
  
  try {
    const userRef = doc(db, 'users', uid)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      // Document exists, update it
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date(),
      })
    } else {
      // Document doesn't exist, create it with merge
      await setDoc(userRef, {
        ...userData,
        uid,
        updatedAt: new Date(),
        createdAt: new Date(),
      }, { merge: true })
    }
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

