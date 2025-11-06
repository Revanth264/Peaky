import { signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth'
import { auth } from './firebase-client'
// Recaptcha is initialized once on mount; don't re-init here

declare global {
  interface Window {
    confirmationResult?: ConfirmationResult
  }
}

const COOLDOWN_MS = 5 * 60 * 1000

let inFlight = false

export function isInCooldown(): boolean {
  if (typeof window === 'undefined') return false
  const until = Number(localStorage.getItem('__otpCooldownUntil') || 0)
  return Date.now() < until
}

export async function sendOTP(e164Phone: string): Promise<ConfirmationResult> {
  if (typeof window === 'undefined') {
    throw new Error('sendOTP must be called in the browser')
  }

  console.log('[sendOTP] Starting OTP send for:', e164Phone)

  if (isInCooldown()) {
    throw new Error('Too many attempts. Please wait a few minutes and try again.')
  }
  if (inFlight) {
    throw new Error('Sending in progress…')
  }
  // Lock immediately to prevent double invocation during async init
  inFlight = true

  console.log('[sendOTP] Using existing reCAPTCHA verifier...')
  const verifier = (window as any).recaptchaVerifier as any
  
  if (!verifier) {
    throw new Error('reCAPTCHA verifier is null/undefined')
  }
  
  // Check widgetId - 0 is valid; only undefined/null means not rendered yet
  const widgetIdValue = (verifier as any).widgetId as number | undefined
  console.log('[sendOTP] widgetId value:', widgetIdValue, 'type:', typeof widgetIdValue)
  if (widgetIdValue == null) {
    throw new Error('reCAPTCHA verifier not rendered yet')
  }
  console.log('[sendOTP] Verifier ready, widgetId:', widgetIdValue)

  try {
    // Call directly; Firebase handles reCAPTCHA token internally for Phone Auth
    console.log('[sendOTP] Calling signInWithPhoneNumber...')
    const result = await signInWithPhoneNumber(auth, e164Phone, verifier)

    if (typeof window !== 'undefined') {
      window.confirmationResult = result
    }

    console.log('[sendOTP] OTP sent successfully')
    return result
  } catch (error: any) {
    console.error('[sendOTP] Error sending OTP:', error)
    console.error('[sendOTP] Error code:', error?.code)
    console.error('[sendOTP] Error message:', error?.message)
    
    // Provide more helpful error messages
    if (error?.code === 'auth/invalid-app-credential') {
      throw new Error('reCAPTCHA token invalid. Please refresh the page and try again. If the issue persists, check your Firebase Console settings and authorized domains.')
    }
    if (error?.code === 'auth/internal-error') {
      throw new Error('Internal auth error. Likely network/CSP/extension blocking. Try Incognito and ensure CSP allows identitytoolkit.googleapis.com and reCAPTCHA domains.')
    }
    if (error?.code === 'auth/too-many-requests') {
      localStorage.setItem('__otpCooldownUntil', String(Date.now() + COOLDOWN_MS))
      throw new Error('Too many attempts. Please wait a few minutes and try again.')
    }
    
    throw error
  } finally {
    inFlight = false
  }
}

