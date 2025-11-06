import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getAuth, Auth } from 'firebase-admin/auth'

let app: App | undefined
let db: Firestore | undefined
let auth: Auth | undefined
let initialized = false

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin(): boolean {
  // If already initialized and both db and auth exist, return true
  if (initialized && db && auth) {
    return true
  }

  // If Firebase app already exists, reuse it
  if (getApps().length > 0) {
    app = getApps()[0]
    if (!db) {
      db = getFirestore(app)
    }
    if (!auth) {
      auth = getAuth(app)
    }
    initialized = true
    return true
  }

  // Try to initialize new Firebase app
  try {
    // Check for required environment variables
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      // Only log warning once per process, not on every request
      if (!process.env.__FIREBASE_ADMIN_WARNED) {
        console.warn('Firebase Admin credentials not found. Using client-side Firestore as fallback. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local for server-side operations.')
        process.env.__FIREBASE_ADMIN_WARNED = 'true'
      }
      initialized = false
      return false
    }

    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    })
    db = getFirestore(app)
    auth = getAuth(app)
    initialized = true
    console.log('✅ Firebase Admin initialized successfully')
    return true
  } catch (error: any) {
    console.error('❌ Firebase Admin initialization error:', error.message || error)
    initialized = false
    return false
  }
}

// Initialize on import
initializeFirebaseAdmin()

// Export getter functions to ensure initialization
export function getDb(): Firestore | null {
  if (!db) {
    const success = initializeFirebaseAdmin()
    if (!success || !db) {
      // Don't throw error, return null for graceful degradation
      return null
    }
  }
  return db
}

export function getAuthInstance(): Auth | null {
  if (!auth) {
    const success = initializeFirebaseAdmin()
    if (!success || !auth) {
      // Don't throw error, return null for graceful degradation
      return null
    }
  }
  return auth
}

export { app, db, auth }

