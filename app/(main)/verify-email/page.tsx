'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { applyActionCode, checkActionCode, onAuthStateChanged, reload } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import toast from 'react-hot-toast'
import { FiCheck, FiMail, FiLoader, FiArrowRight } from 'react-icons/fi'
import { Button } from '@/components/ui/Button'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'checking' | 'verifying' | 'success' | 'error'>('checking')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const oobCode = searchParams.get('oobCode')
    const mode = searchParams.get('mode')

    if (!oobCode || mode !== 'verifyEmail') {
      setStatus('error')
      setErrorMessage('Invalid verification link')
      return
    }

    const verifyEmail = async () => {
      try {
        setStatus('verifying')
        
        // Verify the action code is valid
        await checkActionCode(auth, oobCode).catch(() => {
          throw new Error('INVALID_LINK')
        })

        // Apply the verification
        await applyActionCode(auth, oobCode)

        // Wait for auth state to update
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            await reload(user)
            if (user.emailVerified) {
              setStatus('success')
              
              // Create profile after verification
              try {
                const token = await user.getIdToken()
                await fetch('/api/auth/create-profile', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || '',
                  }),
                })
              } catch (profileError) {
                console.error('Profile creation error:', profileError)
              }

              toast.success('Email verified successfully!')
              
              // Redirect after 2 seconds
              setTimeout(() => {
                router.push('/')
              }, 2000)
            }
          } else {
            // User not signed in, redirect to login
            setTimeout(() => {
              router.push('/')
            }, 2000)
          }
          unsubscribe()
        })
      } catch (error: any) {
        console.error('Verification error:', error)
        setStatus('error')
        if (error.message === 'INVALID_LINK') {
          setErrorMessage('This verification link is invalid or has expired.')
        } else {
          setErrorMessage(error.message || 'Failed to verify email. Please try again.')
        }
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/60 dark:border-gray-800/60 p-8"
      >
        {status === 'checking' && (
          <div className="text-center space-y-6 py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto border-3 border-primary-600 border-t-transparent rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verifying Your Email
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we verify your email address...
              </p>
            </div>
          </div>
        )}

        {status === 'verifying' && (
          <div className="text-center space-y-6 py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto border-3 border-primary-600 border-t-transparent rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verifying...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Completing verification...
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-6 py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
            >
              <FiCheck className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your email has been successfully verified. Redirecting you...
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-primary-600 to-pink-600 dark:from-primary-500 dark:to-pink-500 text-white"
              >
                Continue to Home
                <FiArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-6 py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 mx-auto bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center"
            >
              <FiMail className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {errorMessage}
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                Go to Home
              </Button>
              <Button
                onClick={() => window.dispatchEvent(new CustomEvent('openSignInModal'))}
                className="w-full bg-gradient-to-r from-primary-600 to-pink-600 dark:from-primary-500 dark:to-pink-500 text-white"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

