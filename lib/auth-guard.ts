'use client'

import { onAuthStateChanged, reload } from 'firebase/auth'
import { auth } from './firebase'

/**
 * Front-end guard to redirect unverified email users
 * Call this in your protected pages/components
 */
export function setupAuthGuard() {
  if (typeof window === 'undefined') return

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Not signed in - can stay on public pages
      return
    }

    // Reload user to get latest verification status
    await reload(user)

    // Check if email is not verified
    if (user.email && !user.emailVerified) {
      // Redirect to verification page or show verification modal
      const currentPath = window.location.pathname
      
      // Don't redirect if already on verification page
      if (currentPath !== '/verify-email') {
        window.location.href = '/verify-email?pending=true'
      }
    }
  })

  return unsubscribe
}

/**
 * Check if current user is verified
 */
export async function isUserVerified(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  
  const user = auth.currentUser
  if (!user) return false
  
  await reload(user)
  return user.emailVerified || !user.email
}

