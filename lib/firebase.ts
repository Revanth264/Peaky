'use client'

import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

export const firebaseConfig = {
  apiKey: "AIzaSyBBSpbf8-e3VwIGCGhyhSeM3zh_QPGVUU4",
  authDomain: "peakime.firebaseapp.com",
  databaseURL: "https://peakime-default-rtdb.firebaseio.com",
  projectId: "peakime",
  storageBucket: "peakime.firebasestorage.app",
  messagingSenderId: "562322631061",
  appId: "1:562322631061:web:644949376eaf184c28ae9c",
  measurementId: "G-P0XRTQY11E"
}

let appInstance: FirebaseApp | undefined
let authInstance: Auth | undefined
let dbInstance: Firestore | undefined

function ensureApp(): FirebaseApp {
  if (!appInstance) {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  }
  return appInstance
}

function ensureAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(ensureApp())
  }
  return authInstance
}

function ensureDb(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(ensureApp())
  }
  return dbInstance
}

const app: FirebaseApp = ensureApp()
const auth: Auth = ensureAuth()
const db: Firestore = ensureDb()

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_APPCHECK_KEY) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_APPCHECK_KEY),
      isTokenAutoRefreshEnabled: true,
    })
  } catch (error) {
    console.warn('App Check initialization failed:', error)
  }
}

export { app, auth, db }

export function getClientAuth(): Auth {
  return ensureAuth()
}

