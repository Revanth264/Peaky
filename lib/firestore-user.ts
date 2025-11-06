// Server-side only - DO NOT import in client components
import { getDb } from './firebase-admin'

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

// Server-side functions (using Admin SDK) - ONLY use in API routes
export async function getUserByUid(uid: string): Promise<UserProfile | null> {
  try {
    const db = getDb()
    const userDoc = await db.collection('users').doc(uid).get()
    if (!userDoc.exists) {
      return null
    }
    return { uid, ...userDoc.data() } as UserProfile
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function createUserProfile(uid: string, userData: Partial<UserProfile>): Promise<void> {
  try {
    const db = getDb()
    const { Timestamp } = await import('firebase-admin/firestore')
    await db.collection('users').doc(uid).set({
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      role: userData.role || 'user',
      totalOrders: userData.totalOrders || 0,
      totalSpent: userData.totalSpent || 0,
      newsletterSubscribed: userData.newsletterSubscribed || false,
    })
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw error
  }
}

export async function updateUserProfile(uid: string, userData: Partial<UserProfile>): Promise<void> {
  try {
    const db = getDb()
    const { Timestamp } = await import('firebase-admin/firestore')
    await db.collection('users').doc(uid).update({
      ...userData,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  try {
    const db = getDb()
    const usersRef = db.collection('users')
    const snapshot = await usersRef.where('email', '==', email).limit(1).get()
    
    if (snapshot.empty) {
      return null
    }
    
    const doc = snapshot.docs[0]
    return { uid: doc.id, ...doc.data() } as UserProfile
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
}
