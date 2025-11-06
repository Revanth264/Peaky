'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { signInWithEmail, registerWithEmail } from '@/lib/firebase-auth'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiUser, FiCheck, FiArrowLeft } from 'react-icons/fi'
import { auth } from '@/lib/firebase'
import { sendEmailVerification, signInWithEmailAndPassword, signOut } from 'firebase/auth'

interface EmailAuthProps {
  onClose?: () => void
  onForgotPassword?: () => void
  onModeChange?: (mode: 'signin' | 'signup') => void
}

type EmailStep = 'credentials' | 'waiting-verification'
type AuthMode = 'signin' | 'signup'

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

export function EmailAuth({ onClose, onForgotPassword, onModeChange }: EmailAuthProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<EmailStep>('credentials')
  const [mode, setMode] = useState<AuthMode>('signup')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode)
    onModeChange?.(newMode)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (mode === 'signup') {
        if (!formData.name.trim()) {
          toast.error('Please enter your name')
          setIsLoading(false)
          return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          toast.error('Invalid email address')
          setIsLoading(false)
          return
        }

        if (formData.password.length < 8) {
          toast.error('Password must be at least 8 characters')
          setIsLoading(false)
          return
        }

        const result = await registerWithEmail({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          displayName: formData.name.trim(),
        })

        if (result && result.status === 'VERIFY_EMAIL_SENT') {
          toast.success('Verification email sent!', {
            description: 'Please check your inbox and verify your email to continue.',
            duration: 5000,
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
            },
          })
          
          setStep('waiting-verification')
          setIsLoading(false)
          return
        }
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
          toast.error('Invalid email address')
          setIsLoading(false)
          return
        }

        if (!formData.password || formData.password.length === 0) {
          toast.error('Please enter your password')
          setIsLoading(false)
          return
        }

        const user = await signInWithEmail(formData.email.trim().toLowerCase(), formData.password)
        
        toast.success('Welcome back!', {
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
        })
        onClose?.()
        router.refresh()
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      const errorCode = error?.code
      let errorMessage = 'Something went wrong. Please try again.'

      if (mode === 'signup') {
        if (errorCode === 'auth/email-already-in-use') {
          errorMessage = 'An account with this email already exists'
          toast.error(errorMessage, {
            action: {
              label: 'Sign In Instead',
              onClick: () => setMode('signin'),
            },
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
            },
          })
        } else if (errorCode === 'auth/invalid-email') {
          errorMessage = 'Invalid email address'
          toast.error(errorMessage)
        } else if (errorCode === 'auth/weak-password') {
          errorMessage = 'Password is too weak. Use at least 8 characters'
          toast.error(errorMessage)
        } else {
          toast.error(errorMessage)
        }
      } else {
        if (error.message === 'EMAIL_NOT_VERIFIED') {
          errorMessage = 'Please verify your email first'
          toast.error(errorMessage, {
            description: 'Check your inbox for the verification link. Click below to resend.',
            duration: 6000,
            action: {
              label: 'Resend Email',
              onClick: async () => {
                try {
                  const tempUser = await signInWithEmailAndPassword(auth, formData.email.trim().toLowerCase(), formData.password)
                  await sendEmailVerification(tempUser.user, {
                    url: typeof window !== 'undefined' ? `${window.location.origin}/verify-email` : undefined,
                    handleCodeInApp: true,
                  })
                  await signOut(auth)
                  toast.success('Verification email resent!')
                } catch (resendError) {
                  console.error('Error resending verification:', resendError)
                  toast.error('Could not resend email. Please try again.')
                }
              },
            },
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
            },
          })
        } else if (errorCode === 'auth/user-not-found') {
          errorMessage = 'No account found with this email'
          toast.error(errorMessage, {
            action: {
              label: 'Sign Up',
              onClick: () => setMode('signup'),
            },
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
            },
          })
        } else if (errorCode === 'auth/wrong-password') {
          errorMessage = 'Incorrect password'
          toast.error(errorMessage, {
            action: {
              label: 'Forgot Password?',
              onClick: () => onForgotPassword?.(),
            },
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
            },
          })
        } else if (errorCode === 'auth/invalid-email') {
          errorMessage = 'Invalid email address'
          toast.error(errorMessage)
        } else {
          toast.error(errorMessage)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait">
        {step === 'credentials' && (
          <motion.form
            key="credentials"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {mode === 'signup' && (
              <motion.div
                variants={fieldVariants}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
              >
                <motion.label
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  htmlFor="name"
                  className="block text-base font-semibold text-gray-900 dark:text-white mb-2"
                >
                  Full Name
                </motion.label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 h-14 text-base border border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/10 dark:focus:ring-purple-400/10 rounded-xl transition-all duration-200 bg-white dark:bg-gray-900"
                    required={mode === 'signup'}
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
            )}

            <motion.div
              variants={fieldVariants}
              className="space-y-3"
            >
              <motion.label
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: mode === 'signup' ? 0.2 : 0.15, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                htmlFor="email"
                className="block text-base font-semibold text-gray-900 dark:text-white mb-2"
              >
                Email Address
              </motion.label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 h-14 text-base border border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/10 dark:focus:ring-purple-400/10 rounded-xl transition-all duration-200 bg-white dark:bg-gray-900"
                  required
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            <motion.div
              variants={fieldVariants}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <motion.label
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: mode === 'signup' ? 0.25 : 0.2, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  htmlFor="password"
                  className="block text-base font-semibold text-gray-900 dark:text-white"
                >
                  Password
                </motion.label>
                {mode === 'signin' && (
                  <motion.button
                    type="button"
                    onClick={onForgotPassword}
                    disabled={isLoading}
                    className="text-xs text-purple-600 dark:text-purple-400 hover:text-pink-500 dark:hover:text-pink-400 font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Forgot?
                  </motion.button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-5 h-14 text-base border border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/10 dark:focus:ring-purple-400/10 rounded-xl transition-all duration-200 bg-white dark:bg-gray-900"
                  required
                  disabled={isLoading}
                />
              </div>
              {mode === 'signup' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="text-xs text-gray-500 dark:text-gray-400"
                >
                  Must be at least 8 characters
                </motion.p>
              )}
            </motion.div>

            <motion.div
              variants={fieldVariants}
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      className="flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {mode === 'signup' ? 'Creating...' : 'Signing in...'}
                    </motion.div>
                  ) : (
                    <>
                      {mode === 'signup' ? (
                        <>
                          <FiCheck className="mr-2 h-5 w-5" />
                          Create Account
                        </>
                      ) : (
                        <>
                          <FiMail className="mr-2 h-5 w-5" />
                          Sign In
                        </>
                      )}
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              variants={fieldVariants}
              className="text-center pt-2"
            >
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                <motion.button
                  type="button"
                  onClick={() => handleModeChange(mode === 'signup' ? 'signin' : 'signup')}
                  className="text-purple-600 dark:text-purple-400 hover:text-pink-500 dark:hover:text-pink-400 font-semibold transition-colors"
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                </motion.button>
              </p>
            </motion.div>
          </motion.form>
        )}

        {step === 'waiting-verification' && (
          <motion.div
            key="waiting-verification"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center space-y-6 py-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto border-3 border-purple-600 border-t-transparent rounded-full"
            />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Check Your Email</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We've sent a verification link to
              </p>
              <p className="text-base font-semibold text-purple-600 dark:text-purple-400">
                {formData.email}
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed"
              >
                Click the link in your email to verify your account, then come back to sign in.
              </motion.p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep('credentials')
                  handleModeChange('signin')
                }}
                className="text-sm"
              >
                <FiArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
