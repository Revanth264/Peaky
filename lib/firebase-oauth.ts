import { 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  fetchSignInMethodsForEmail,
  linkWithPopup
} from 'firebase/auth'
import { auth } from './firebase-client'

// Ensure auth is ready before OAuth operations
function ensureAuthReady() {
  if (!auth) {
    throw new Error('Firebase Auth not initialized')
  }
  if (!auth.app) {
    throw new Error('Firebase App not initialized')
  }
  return auth
}

// Initialize OAuth Providers
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('profile')
googleProvider.addScope('email')
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export const facebookProvider = new FacebookAuthProvider()
facebookProvider.addScope('email')
facebookProvider.addScope('public_profile')

// Apple OAuth Provider
export const appleProvider = new OAuthProvider('apple.com')
appleProvider.addScope('email')
appleProvider.addScope('name')

// Microsoft OAuth Provider  
export const microsoftProvider = new OAuthProvider('microsoft.com')
microsoftProvider.addScope('email')
microsoftProvider.addScope('profile')

export async function signInWithGoogle() {
  const authInstance = ensureAuthReady()
  
  try {
    console.log('[OAuth] Starting Google sign-in...')
    console.log('[OAuth] Auth domain:', authInstance.app.options.authDomain)
    
    // Use popup with timeout detection
    const popupPromise = signInWithPopup(authInstance, googleProvider)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('POPUP_TIMEOUT')), 5000)
    )
    
    try {
      const result = await Promise.race([popupPromise, timeoutPromise]) as any
      console.log('[OAuth] Google sign-in successful:', result.user.email)
      return result
    } catch (popupError: any) {
      console.log('[OAuth] Popup failed or timed out:', popupError.code || popupError.message)
      
      // Always fallback to redirect for reliability
      if (
        popupError.code === 'auth/popup-blocked' ||
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.code === 'auth/cancelled-popup-request' ||
        popupError.code === 'auth/internal-error' ||
        popupError.message === 'POPUP_TIMEOUT'
      ) {
        console.log('[OAuth] Using redirect method (more reliable)...')
        await signInWithRedirect(authInstance, googleProvider)
        return null
      }
      
      throw popupError
    }
  } catch (error: any) {
    console.error('[OAuth] Google sign-in error:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    
    // Handle specific error codes
    if (error.code === 'auth/account-exists-with-different-credential') {
      const email = error.customData?.email
      if (email) {
        const methods = await fetchSignInMethodsForEmail(authInstance, email)
        throw new Error(`ACCOUNT_EXISTS_DIFFERENT_PROVIDER:${methods.join(',')}`)
      }
    }
    
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Google sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method → Google.')
    }
    
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized. Please add localhost to Firebase Console → Authentication → Settings → Authorized domains.')
    }
    
    // For any error, try redirect as last resort
    if (error.code === 'auth/internal-error' || !error.code) {
      console.warn('[OAuth] Attempting redirect as fallback...')
      try {
        await signInWithRedirect(authInstance, googleProvider)
        return null
      } catch (redirectError: any) {
        console.error('[OAuth] Redirect also failed:', redirectError)
        throw new Error('Authentication failed. Please try again or check your browser settings.')
      }
    }
    
    throw error
  }
}

export async function signInWithFacebook() {
  const authInstance = ensureAuthReady()
  
  try {
    console.log('[OAuth] Starting Facebook sign-in...')
    
    const popupPromise = signInWithPopup(authInstance, facebookProvider)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('POPUP_TIMEOUT')), 5000)
    )
    
    try {
      const result = await Promise.race([popupPromise, timeoutPromise]) as any
      console.log('[OAuth] Facebook sign-in successful:', result.user.email)
      return result
    } catch (popupError: any) {
      if (
        popupError.code === 'auth/popup-blocked' ||
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.code === 'auth/cancelled-popup-request' ||
        popupError.code === 'auth/internal-error' ||
        popupError.message === 'POPUP_TIMEOUT'
      ) {
        console.log('[OAuth] Using redirect method...')
        await signInWithRedirect(authInstance, facebookProvider)
        return null
      }
      throw popupError
    }
  } catch (error: any) {
    console.error('[OAuth] Facebook sign-in error:', error.code, error.message)
    
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Facebook sign-in is not enabled. Please enable it in Firebase Console.')
    }
    
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized. Please add it to Firebase Console authorized domains.')
    }
    
    if (error.code === 'auth/internal-error' || !error.code) {
      try {
        await signInWithRedirect(authInstance, facebookProvider)
        return null
      } catch (redirectError: any) {
        throw new Error('Authentication failed. Please try again.')
      }
    }
    
    throw error
  }
}

export async function signInWithApple() {
  const authInstance = ensureAuthReady()
  
  try {
    console.log('[OAuth] Starting Apple sign-in...')
    
    const popupPromise = signInWithPopup(authInstance, appleProvider)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('POPUP_TIMEOUT')), 5000)
    )
    
    try {
      const result = await Promise.race([popupPromise, timeoutPromise]) as any
      console.log('[OAuth] Apple sign-in successful:', result.user.email)
      return result
    } catch (popupError: any) {
      if (
        popupError.code === 'auth/popup-blocked' ||
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.code === 'auth/cancelled-popup-request' ||
        popupError.code === 'auth/internal-error' ||
        popupError.message === 'POPUP_TIMEOUT'
      ) {
        console.log('[OAuth] Using redirect method...')
        await signInWithRedirect(authInstance, appleProvider)
        return null
      }
      throw popupError
    }
  } catch (error: any) {
    console.error('[OAuth] Apple sign-in error:', error.code, error.message)
    
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Apple sign-in is not enabled. Please enable it in Firebase Console.')
    }
    
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized. Please add it to Firebase Console authorized domains.')
    }
    
    if (error.code === 'auth/internal-error' || !error.code) {
      try {
        await signInWithRedirect(authInstance, appleProvider)
        return null
      } catch (redirectError: any) {
        throw new Error('Authentication failed. Please try again.')
      }
    }
    
    throw error
  }
}

export async function signInWithMicrosoft() {
  const authInstance = ensureAuthReady()
  
  try {
    console.log('[OAuth] Starting Microsoft sign-in...')
    
    const popupPromise = signInWithPopup(authInstance, microsoftProvider)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('POPUP_TIMEOUT')), 5000)
    )
    
    try {
      const result = await Promise.race([popupPromise, timeoutPromise]) as any
      console.log('[OAuth] Microsoft sign-in successful:', result.user.email)
      return result
    } catch (popupError: any) {
      if (
        popupError.code === 'auth/popup-blocked' ||
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.code === 'auth/cancelled-popup-request' ||
        popupError.code === 'auth/internal-error' ||
        popupError.message === 'POPUP_TIMEOUT'
      ) {
        console.log('[OAuth] Using redirect method...')
        await signInWithRedirect(authInstance, microsoftProvider)
        return null
      }
      throw popupError
    }
  } catch (error: any) {
    console.error('[OAuth] Microsoft sign-in error:', error.code, error.message)
    
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Microsoft sign-in is not enabled. Please enable it in Firebase Console.')
    }
    
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized. Please add it to Firebase Console authorized domains.')
    }
    
    if (error.code === 'auth/internal-error' || !error.code) {
      try {
        await signInWithRedirect(authInstance, microsoftProvider)
        return null
      } catch (redirectError: any) {
        throw new Error('Authentication failed. Please try again.')
      }
    }
    
    throw error
  }
}

// Check for redirect result (when popup is blocked)
export async function handleRedirectResult() {
  try {
    const authInstance = ensureAuthReady()
    const result = await getRedirectResult(authInstance)
    return result?.user || null
  } catch (error) {
    console.error('[OAuth] Redirect result error:', error)
    return null
  }
}

