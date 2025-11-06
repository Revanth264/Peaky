export function logRecaptchaAndITKRequests(): void {
  if (typeof window === 'undefined') return
  const scripts = Array.from(document.querySelectorAll('script[src*="recaptcha"]'))
    .map((s) => (s as HTMLScriptElement).src)
  // eslint-disable-next-line no-console
  console.log('[Probe] recaptcha scripts:', scripts)
  // After clicking Send OTP, verify in DevTools → Network:
  // POST https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode
}


