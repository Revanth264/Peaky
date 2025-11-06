'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import PhoneInput from '@/components/ui/PhoneInput'
import { verifyPhoneOTP } from '@/lib/firebase-auth'
import { initRecaptchaOnce } from '@/lib/recaptcha'
import { sendOTP } from '@/lib/send-otp'
import type { ConfirmationResult } from 'firebase/auth'
import toast from 'react-hot-toast'
import { FiPhone, FiArrowLeft } from 'react-icons/fi'

interface MobileAuthProps {
  onClose?: () => void
}

type MobileStep = 'phone-input' | 'otp-verify'

const formVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
}

const fieldVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export function MobileAuth({ onClose }: MobileAuthProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<MobileStep>('phone-input')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [e164Number, setE164Number] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [disabledUntil, setDisabledUntil] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState(0)

  // Initialize reCAPTCHA once on mount
  useEffect(() => {
    const id = setTimeout(() => {
      initRecaptchaOnce().catch((error) => {
      const message = error?.message || String(error)
      console.warn('reCAPTCHA initialization warning:', message)
      if (message.includes('did not finish loading')) {
        toast.error('reCAPTCHA could not load. Disable extensions or update CSP to allow google.com/recaptcha and gstatic.com/recaptcha.', {
          duration: 6000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
        })
      }
      })
    }, 0)

    return () => clearTimeout(id)
  }, [])

  // Handle rate-limit countdown timer
  useEffect(() => {
    if (!disabledUntil) return

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((disabledUntil - Date.now()) / 1000))
      setRemainingTime(remaining)
      
      if (remaining === 0) {
        setDisabledUntil(null)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [disabledUntil])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check rate limit
    if (disabledUntil && Date.now() < disabledUntil) {
      const minutes = Math.ceil(remainingTime / 60)
      toast.error(`Too many attempts. Please wait ${remainingTime < 60 ? `${remainingTime} seconds` : `${minutes} minute${minutes > 1 ? 's' : ''}`}`, {
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
        },
      })
      return
    }
    
    if (!phoneNumber || phoneNumber.trim().length < 3) {
      toast.error('Please enter a valid mobile number with country code')
      return
    }
    
    const formattedE164 = e164Number?.replace(/\s+/g, '')

    if (!formattedE164 || !/^\+[1-9]\d{6,14}$/.test(formattedE164)) {
      toast.error('Please enter a complete mobile number with country and area code')
      return
    }

    const phoneToUse = formattedE164

    setIsLoading(true)
    
    try {
      console.log('Attempting OTP send with number:', phoneToUse)
      const confirmation = await sendOTP(phoneToUse)
      setConfirmationResult(confirmation)
      setStep('otp-verify')

      toast.success(`OTP sent to ${phoneToUse}`, {
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
        },
      })
    } catch (error: any) {
      console.error('OTP send error:', error)
      const errorCode = error?.code
      const errorMessage = error?.message || ''
      
      // User-friendly error messages (Apple design principles - clear, helpful, actionable)
      if (errorCode === 'auth/invalid-phone-number') {
        toast.error('Please check your phone number and try again', {
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
        })
      } else if (errorCode === 'auth/too-many-requests') {
        // Set 3-minute cooldown
        const cooldownEnd = Date.now() + 180000 // 3 minutes
        setDisabledUntil(cooldownEnd)
        setRemainingTime(180)
        
        toast.error('Too many attempts. Please wait 3 minutes before trying again', {
          duration: 6000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
        })
      } else if (errorCode === 'auth/captcha-check-failed' || errorMessage.includes('captcha') || errorMessage.includes('reCAPTCHA')) {
        toast.error('Verification failed. Please try again', {
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
        })
      } else if (errorCode === 'auth/invalid-app-credential' || errorCode === 'auth/missing-app-credential' || errorMessage.includes('invalid-app-credential') || errorMessage.includes('reCAPTCHA not configured') || errorMessage.includes('reCAPTCHA initialization failed')) {
        toast.error('reCAPTCHA token missing/invalid. Hard refresh and try again.', {
          duration: 7000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
        })
      } else if (errorMessage.includes('did not finish loading')) {
        toast.error('reCAPTCHA was blocked. Try Incognito or allow google.com/recaptcha and gstatic.com/recaptcha.', {
          duration: 6000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
        })
      } else if (errorMessage.includes('timeout') || errorMessage.includes('Timeout') || errorMessage.includes('Request timeout')) {
        toast.error('Request timeout. Please check your internet connection and try again', {
          duration: 5000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
        })
      } else if (errorMessage.includes('already been rendered') || errorMessage.includes('Please wait a moment')) {
        toast.error('Please wait a moment and try again', {
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
        })
      } else {
        toast.error('Unable to send OTP. Please try again', {
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otp || !confirmationResult) {
      toast.error('Please enter the OTP code')
      return
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error('Please enter a 6-digit code')
      return
    }

    setIsLoading(true)
    try {
      await verifyPhoneOTP(confirmationResult, otp)
      
      toast.success('Welcome! You\'ve successfully signed in')
      onClose?.()
      router.refresh()
      router.push('/')
    } catch (error: any) {
      console.error('OTP verify error:', error)
      const errorCode = error?.code
      
      // User-friendly error messages (Apple design principles)
      if (errorCode === 'auth/invalid-verification-code') {
        toast.error('Incorrect code. Please check and try again', {
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
        })
      } else if (errorCode === 'auth/code-expired') {
        toast.error('Code expired. Please request a new one', {
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
        })
      } else {
        toast.error('Verification failed. Please try again', {
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!e164Number) {
      toast.error('Phone number not available', {
        style: {
          background: '#1f2937',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
        },
      })
      return
    }
    
    setOtp('')
    setIsLoading(true)
    
    try {
      const confirmation = await sendOTP(e164Number)
      setConfirmationResult(confirmation)
      
      toast.success('OTP resent! Check your phone', {
        style: {
          background: '#1f2937',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
        },
      })
    } catch (error: any) {
      console.error('OTP resend error:', error)
      
      // User-friendly error message
      toast.error('Unable to resend OTP. Please try again', {
        style: {
          background: '#1f2937',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait">
        {step === 'phone-input' && (
          <motion.form
            key="phone-input"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: -12 }}
            onSubmit={handleSendOTP}
            className="space-y-4"
          >
            <motion.div
              variants={fieldVariants}
              className="space-y-2"
            >
              <motion.label
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                htmlFor="mobile"
                className="block text-base font-semibold text-gray-900 dark:text-white mb-3"
              >
                Mobile Number
              </motion.label>
              <div className="relative">
                <PhoneInput
                  id="mobile"
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  onValidE164={(e164) => setE164Number(e164)}
                  placeholder="Enter your phone number"
                  disabled={isLoading}
                  className="w-full h-14 px-5 text-base rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/10 dark:focus:ring-purple-400/10 transition-all duration-200"
                />
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-gray-500 dark:text-gray-400"
              >
                We'll send you an OTP to verify your number
              </motion.p>
            </motion.div>

            <motion.div
              variants={fieldVariants}
            >
              <motion.div
                whileHover={{ scale: disabledUntil ? 1 : 1.01 }}
                whileTap={{ scale: disabledUntil ? 1 : 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Button
                  type="submit"
                  variant="primary"
                  className={`w-full h-14 px-8 py-4 text-base font-semibold rounded-xl shadow-lg transition-all duration-200 ${
                    disabledUntil
                      ? 'bg-gray-400 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30'
                  }`}
                  disabled={isLoading || !!disabledUntil}
                >
                  {isLoading ? (
                    <motion.div
                      className="flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </motion.div>
                  ) : disabledUntil ? (
                    <span>
                      Wait {remainingTime < 60 ? `${remainingTime}s` : `${Math.ceil(remainingTime / 60)}m`}
                    </span>
                  ) : (
                    <>
                      <FiPhone className="mr-2 h-4 w-4" />
                      Send OTP
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </motion.form>
        )}

        {step === 'otp-verify' && (
          <motion.form
            key="otp-verify"
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleVerifyOTP}
            className="space-y-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Enter OTP
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('phone-input')}
                  disabled={isLoading}
                  className="text-xs"
                >
                  <FiArrowLeft className="h-3 w-3 mr-1" />
                  Change
                </Button>
              </div>
              <motion.div
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 25 }}
              >
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-14 px-5 text-2xl text-center tracking-[0.5em] font-semibold border border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/10 dark:focus:ring-purple-400/10 rounded-xl transition-all duration-200 bg-white dark:bg-gray-900"
                  maxLength={6}
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </motion.div>
              <div className="flex items-center justify-between text-xs">
                <p className="text-gray-500 dark:text-gray-400">
                  Sent to {e164Number || phoneNumber}
                </p>
                <motion.button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-purple-600 dark:text-purple-400 hover:text-pink-500 dark:hover:text-pink-400 font-semibold transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Resend
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-14 px-8 py-4 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-200"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <motion.div
                      className="flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </motion.div>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verify & Continue
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

