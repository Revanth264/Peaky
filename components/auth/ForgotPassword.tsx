'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { resetPassword } from '@/lib/firebase-auth'
import toast from 'react-hot-toast'
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi'
import { InputIcon } from '@/components/ui/InputIcon'

interface ForgotPasswordProps {
  onBack: () => void
}

type ResetStep = 'email-input' | 'email-sent'

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<ResetStep>('email-input')
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      await resetPassword(email)

      toast.success('Password reset email sent!', {
        description: 'Check your inbox for the reset link',
        duration: 4000,
      })
      setStep('email-sent')
    } catch (error: any) {
      console.error('Password reset error:', error)

      const errorCode = error?.code
      let errorMessage = 'Failed to send reset email'
      if (errorCode === 'auth/user-not-found') {
        errorMessage = 'No account found with this email'
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      }
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {step === 'email-input' && (
          <motion.div
            key="email-input"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4 mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Reset Password</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="reset-email" className="block text-sm font-semibold text-gray-900 dark:text-white">
                  Email Address
                </label>
                <div className="relative">
                  <InputIcon>
                    <FiMail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </InputIcon>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-16 pr-4 h-14 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-400 rounded-xl"
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 hover:from-primary-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Link...
                  </>
                ) : (
                  <>
                    <FiMail className="mr-2 h-5 w-5" />
                    Send Reset Link
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                disabled={isLoading}
                className="w-full"
              >
                <FiArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Button>
            </form>
          </motion.div>
        )}

        {step === 'email-sent' && (
          <motion.div
            key="email-sent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-6"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-100 to-pink-100 dark:from-primary-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center"
              >
                <FiCheck className="w-10 h-10 text-primary-600 dark:text-primary-400" />
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Check Your Email</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We've sent a password reset link to
                </p>
                <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                  {email}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-left bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Next steps:
              </p>
              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
                <li>Check your email inbox</li>
                <li>Click the password reset link</li>
                <li>Create a new password</li>
                <li>Sign in with your new password</li>
              </ol>
            </div>

            <Button
              onClick={onBack}
              variant="primary"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 hover:from-primary-700 hover:via-purple-700 hover:to-pink-700"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Button>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Didn't receive the email? Check your spam folder or try again
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

