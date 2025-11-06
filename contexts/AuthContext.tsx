'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getUserProfileClient, updateUserProfileClient, UserProfile } from '@/lib/firestore-user-client'
import toast from 'react-hot-toast'

interface User extends UserProfile {
  _id?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => Promise<void>
  getIdToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const profileCreationRan = useRef(false)

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUserState) => {
      console.log('[AuthContext] Auth state changed:', firebaseUserState?.uid, firebaseUserState?.email)
      setFirebaseUser(firebaseUserState)

      if (!firebaseUserState) {
        setUser(null)
        profileCreationRan.current = false
        setLoading(false)
        return
      }

      // Immediately set a temporary user object so UI updates
      setUser({
        uid: firebaseUserState.uid,
        email: firebaseUserState.email || '',
        name: firebaseUserState.displayName || firebaseUserState.email?.split('@')[0] || 'User',
        phone: firebaseUserState.phoneNumber || undefined,
        avatar: firebaseUserState.photoURL || undefined,
        role: 'user',
      } as User)

      try {
        const existingProfile = await getUserProfileClient(firebaseUserState.uid)

        if (existingProfile) {
          setUser(existingProfile as User)
        } else if (!profileCreationRan.current && (firebaseUserState.phoneNumber || firebaseUserState.email || firebaseUserState.emailVerified)) {
          profileCreationRan.current = true

          const newProfile: Partial<UserProfile> = {
            uid: firebaseUserState.uid,
            email: firebaseUserState.email || '',
            name: firebaseUserState.displayName || firebaseUserState.email?.split('@')[0] || 'User',
            phone: firebaseUserState.phoneNumber || undefined,
            avatar: firebaseUserState.photoURL || undefined,
            role: 'user',
            createdAt: new Date(),
            updatedAt: new Date(),
            totalOrders: 0,
            totalSpent: 0,
            newsletterSubscribed: false,
            addresses: [],
            wishlist: [],
            orderHistory: [],
          }

          try {
            const idToken = await firebaseUserState.getIdToken(true)
            const response = await fetch('/api/auth/create-profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify(newProfile),
            })

            if (response.ok) {
              const data = await response.json()
              if (data?.user) {
                setUser(data.user as User)
              } else {
                // If no user in response, fetch it
                const fetchedProfile = await getUserProfileClient(firebaseUserState.uid)
                if (fetchedProfile) {
                  setUser(fetchedProfile as User)
                }
              }
            } else {
              profileCreationRan.current = false
              console.error('Error creating user profile:', await response.text())
              // Try to fetch existing profile anyway
              const fetchedProfile = await getUserProfileClient(firebaseUserState.uid)
              if (fetchedProfile) {
                setUser(fetchedProfile as User)
              }
            }
          } catch (error) {
            profileCreationRan.current = false
            console.error('Error creating user profile:', error)
          }
        }

        // Update last login if profile exists (either fetched or just created)
        const shouldUpdateLastLogin = existingProfile || profileCreationRan.current
        if (shouldUpdateLastLogin) {
          try {
            await updateUserProfileClient(firebaseUserState.uid, {
              lastLogin: new Date(),
            })
            // Refresh user profile after updating last login
            const refreshedProfile = await getUserProfileClient(firebaseUserState.uid)
            if (refreshedProfile) {
              setUser(refreshedProfile as User)
            }
          } catch (updateError) {
            console.warn('Could not update last login:', updateError)
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        toast.error('Failed to load user profile')
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      toast.success('Login successful!')
    } catch (error: any) {
      const errorMessage = error.code === 'auth/user-not-found' 
        ? 'No account found with this email'
        : error.code === 'auth/wrong-password'
        ? 'Incorrect password'
        : error.code === 'auth/invalid-email'
        ? 'Invalid email address'
        : 'Login failed. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  }

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Update Firebase profile
      await updateFirebaseProfile(firebaseUser, {
        displayName: name,
      })

      toast.success('Registration successful! Please verify your email to activate your account.')
    } catch (error: any) {
      const errorMessage = error.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists'
        : error.code === 'auth/weak-password'
        ? 'Password should be at least 6 characters'
        : error.code === 'auth/invalid-email'
        ? 'Invalid email address'
        : 'Registration failed. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      toast.success('Logged out successfully')
    } catch (error: any) {
      toast.error('Logout failed')
      throw error
    }
  }

  const updateUser = async (data: Partial<User>) => {
    try {
      if (!firebaseUser) {
        throw new Error('User not authenticated')
      }

      // Update Firebase profile if name or photo URL changed
      if (data.name || data.avatar) {
        await updateFirebaseProfile(firebaseUser, {
          displayName: data.name,
          photoURL: data.avatar,
        })
      }

      // Update Firestore profile
      await updateUserProfileClient(firebaseUser.uid, data)
      
      // Fetch updated profile
      const updatedProfile = await getUserProfileClient(firebaseUser.uid)
      if (updatedProfile) {
        setUser(updatedProfile as User)
      }

      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Update failed')
      throw error
    }
  }

  // Helper function to get Firebase ID token for API requests
  const getIdToken = async (): Promise<string | null> => {
    if (!firebaseUser) {
      return null
    }
    try {
      return await firebaseUser.getIdToken()
    } catch (error) {
      console.error('Error getting ID token:', error)
      return null
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

