'use client'

import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyBBSpbf8-e3VwIGCGhyhSeM3zh_QPGVUU4',
  authDomain: 'peakime.firebaseapp.com',
  projectId: 'peakime',
  storageBucket: 'peakime.firebasestorage.app',
  appId: '1:562322631061:web:644949376eaf184c28ae9c',
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
const auth = getAuth(app)

export { app, auth }

// Helper to get ID token
export async function getIdToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const user = auth.currentUser
  if (!user) return null
  try {
    return await user.getIdToken()
  } catch (error) {
    console.error('Error getting ID token:', error)
    return null
  }
}

if (typeof window !== 'undefined') {
  // @ts-ignore
  console.log('[FB] projectId:', app.options.projectId, 'authDomain:', app.options.authDomain)
}


