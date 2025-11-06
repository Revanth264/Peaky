'use client'

import { RecaptchaVerifier } from 'firebase/auth'
import { auth } from './firebase-client'

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier & { widgetId?: number }
    __recapInitPromise?: Promise<RecaptchaVerifier>
    __recapReady?: boolean
    grecaptcha?: {
      reset: (widgetId?: number) => void
      getResponse?: (widgetId?: number) => string
      execute?: (widgetId?: number) => void
    }
  }
}

type RecaptchaInstance = RecaptchaVerifier & { widgetId?: number }

const debugRecaptcha = process.env.NEXT_PUBLIC_DEBUG_RECAPTCHA === 'true'
const DEFAULT_CONTAINER_ID = 'recaptcha-container-root'
const TOKEN_TIMEOUT_MS = 10000

function ensureBodyContainer(): string {
  let el = document.getElementById(DEFAULT_CONTAINER_ID) as HTMLDivElement | null
  if (!el) {
    el = document.createElement('div')
    el.id = DEFAULT_CONTAINER_ID
    el.style.position = 'fixed'
    el.style.left = '-9999px'
    el.style.bottom = '0'
    el.style.width = '1px'
    el.style.height = '1px'
    el.style.overflow = 'hidden'
    document.body.appendChild(el)
  }
  return el.id
}

export async function ensureRecaptcha(): Promise<RecaptchaInstance> {
  if (typeof window === 'undefined') {
    throw new Error('reCAPTCHA can only be initialized in the browser')
  }

  console.log('[ensureRecaptcha] Starting initialization...')

  // If we already have a working verifier, return it
  if (window.recaptchaVerifier?.widgetId !== undefined) {
    console.log('[ensureRecaptcha] Reusing existing verifier, widgetId:', window.recaptchaVerifier.widgetId)
    return window.recaptchaVerifier
  }

  // If an init is already in-flight, return that promise
  if (window.__recapInitPromise) {
    return window.__recapInitPromise as Promise<RecaptchaInstance>
  }

  // Clear any existing verifier that might be broken
  if (window.recaptchaVerifier) {
    console.log('[ensureRecaptcha] Clearing broken verifier...')
    try {
      window.recaptchaVerifier.clear()
    } catch (e) {
      console.warn('[ensureRecaptcha] Failed to clear existing verifier:', e)
    }
    window.recaptchaVerifier = undefined
  }

  const containerId = ensureBodyContainer()
  const el = document.getElementById(containerId)!
  console.log('[ensureRecaptcha] Using body container:', el)
  if (el.childElementCount > 0) el.innerHTML = ''

  window.__recapInitPromise = (async () => {
    console.log('[ensureRecaptcha] Creating new RecaptchaVerifier...')
    console.log('[ensureRecaptcha] Auth instance:', auth)
    console.log('[ensureRecaptcha] Container ID:', containerId)

    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: debugRecaptcha ? 'normal' : 'invisible',
      badge: debugRecaptcha ? undefined : 'bottomright',
    }) as RecaptchaInstance

    console.log('[ensureRecaptcha] Verifier created, rendering...')
    console.log('[ensureRecaptcha] Verifier before render:', {
      hasRender: typeof verifier.render === 'function',
      container: verifier.container,
      isInvisible: verifier.isInvisible
    })
    
    const widgetId = await verifier.render()
    
    console.log('[ensureRecaptcha] render() returned:', widgetId, 'type:', typeof widgetId)
    console.log('[ensureRecaptcha] Verifier after render:', {
      widgetId: verifier.widgetId,
      recaptcha: verifier.recaptcha,
      destroyed: verifier.destroyed
    })
    
    // Firebase's RecaptchaVerifier stores widgetId internally, check multiple sources
    let finalWidgetId = (widgetId ?? (verifier as any)?.widgetId ?? (verifier as any)?.recaptcha?.widgetId)
    
    // If still no widgetId, try to get it from the container
    if ((finalWidgetId === undefined || finalWidgetId === null) && (verifier as any).container) {
      const containerEl = typeof (verifier as any).container === 'string' 
        ? document.getElementById((verifier as any).container)
        : verifier.container
      
      if (containerEl) {
        const iframe = containerEl.querySelector('iframe')
        if (iframe) {
          const dataSitekey = iframe.getAttribute('data-sitekey')
          console.log('[ensureRecaptcha] Found iframe in container, data-sitekey:', dataSitekey)
        }
      }
    }
    
    // Validate widgetId
    if (finalWidgetId === undefined || finalWidgetId === null) {
      console.error('[ensureRecaptcha] No valid widgetId found. Verifier state:', {
        renderReturn: widgetId,
        verifierWidgetId: verifier.widgetId,
        recaptchaWidgetId: verifier.recaptcha?.widgetId,
        container: (verifier as any).container
      })
      throw new Error(`No valid widgetId found. render() returned: ${widgetId}, verifier.widgetId: ${verifier.widgetId}`)
    }
    
    // Ensure widgetId is a number
    verifier.widgetId = typeof finalWidgetId === 'number' ? finalWidgetId : parseInt(String(finalWidgetId), 10)
    
    if ((verifier as any).widgetId === undefined || (verifier as any).widgetId === null) {
      throw new Error(`Invalid widgetId after conversion: ${finalWidgetId} -> ${verifier.widgetId}`)
    }

    console.log('[ensureRecaptcha] Widget rendered successfully! Widget ID:', verifier.widgetId)

    if (debugRecaptcha) {
      console.log('[ensureRecaptcha] Container after render:', document.getElementById(id))
      console.log('[ensureRecaptcha] Verifier object:', verifier)
    }

    window.recaptchaVerifier = verifier
    window.__recapReady = true
    return verifier
  })()

  try {
    return (await window.__recapInitPromise) as RecaptchaInstance
  } catch (error: any) {
    console.error('[ensureRecaptcha] Failed to create/render verifier:', error)
    console.error('[ensureRecaptcha] Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    
    // Clean up on failure
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear()
      } catch (e) {
        console.warn('[ensureRecaptcha] Failed to clear verifier after error:', e)
      }
      window.recaptchaVerifier = undefined
    }
    
    throw new Error(`reCAPTCHA initialization failed: ${error.message}`)
  } finally {
    window.__recapInitPromise = undefined
  }
}

export function initRecaptchaOnce() {
  return ensureRecaptcha()
}

export async function waitForRecaptchaToken(
  timeoutMs: number = TOKEN_TIMEOUT_MS,
  verifierArg?: RecaptchaInstance
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('reCAPTCHA token can only be requested in the browser')
  }

  const verifier = verifierArg ?? (await ensureRecaptcha())
  const widgetId = verifier.widgetId

  if (!widgetId) {
    throw new Error('reCAPTCHA widget not ready. Please try again.')
  }

  if (debugRecaptcha) {
    console.log('Waiting for reCAPTCHA token (widgetId:', widgetId, ')')
  }

  // For invisible reCAPTCHA, try to trigger it manually
  try {
    if (window.grecaptcha?.execute) {
      window.grecaptcha.execute(widgetId)
    }
  } catch (error) {
    if (debugRecaptcha) {
      console.warn('Failed to execute reCAPTCHA (invisible mode):', error)
    }
  }

  // Poll for token existence
  const start = Date.now()
  return new Promise<void>((resolve, reject) => {
    const poll = () => {
      const token = window.grecaptcha?.getResponse?.(widgetId) || ''
      
      if (token) {
        if (debugRecaptcha) {
          console.log('reCAPTCHA token obtained (first 8 chars):', token.slice(0, 8))
        }
        resolve()
        return
      }

      if (Date.now() - start >= timeoutMs) {
        reject(new Error('reCAPTCHA token not generated in time. Please check your network and try again.'))
        return
      }

      setTimeout(poll, 100)
    }

    poll()
  })
}


export function resetRecaptcha() {
  if (typeof window === 'undefined') return
  const verifier = window.recaptchaVerifier
  const widgetId = verifier?.widgetId
  
  if (widgetId != null && window.grecaptcha) {
    try {
      // Reset the widget to get a fresh token
      window.grecaptcha.reset(widgetId)
      if (debugRecaptcha) {
        console.log('reCAPTCHA widget reset (widgetId:', widgetId, ')')
      }
    } catch (error) {
      console.warn('Failed to reset reCAPTCHA widget:', error)
      // If reset fails, we might need to recreate the verifier
      if (verifier) {
        try {
          verifier.clear()
        } catch (clearError) {
          console.warn('Failed to clear verifier:', clearError)
        }
        window.recaptchaVerifier = undefined
      }
    }
  }
}

export function clearRecaptcha(id: string = DEFAULT_CONTAINER_ID) {
  if (typeof window === 'undefined') return

  try {
    window.recaptchaVerifier?.clear?.()
  } catch {
    // ignore
  }

  window.recaptchaVerifier = undefined

  const el = document.getElementById(id)
  if (el) {
    el.innerHTML = ''
  }
}

