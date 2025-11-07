'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { MobileAuth } from './MobileAuth'
import { EmailAuth } from './EmailAuth'
import { ForgotPassword } from './ForgotPassword'
import { OAuthButtons } from './OAuthButtons'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface UnifiedAuthModalProps {
  onClose?: () => void
  onAuthModeChange?: (mode: 'signin' | 'signup') => void
}

type ModalView = 'auth' | 'forgot-password'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
    },
  },
}

export function UnifiedAuthModal({ onClose, onAuthModeChange }: UnifiedAuthModalProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [view, setView] = useState<ModalView>('auth')
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user && !isLoading && (user as any).emailVerified) {
      const displayName = user.name || user.email?.split('@')[0] || 'User'
      toast.success(`Welcome, ${displayName}!`, {
        duration: 3000,
        style: {
          background: '#1f2937',
          color: '#fff',
          borderRadius: '12px',
          padding: '16px',
        },
      })
      const timer = setTimeout(() => {
        onClose?.()
        router.refresh()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [user, isLoading, onClose, router])

  const handleAuthModeChange = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    onAuthModeChange?.(mode)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 min-h-[400px]"
    >
      <AnimatePresence mode="wait">
        {view === 'auth' ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-8"
          >
            {/* OAuth Providers */}
            <motion.div
              variants={itemVariants}
              className="space-y-4"
            >
              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="text-sm text-center text-gray-600 dark:text-gray-300 font-semibold uppercase tracking-wider mb-3"
              >
                Quick Sign In
              </motion.p>
              
              <OAuthButtons mode={authMode} onSuccess={() => onClose?.()} />
            </motion.div>

            {/* Divider with smooth animation */}
            <motion.div
              variants={itemVariants}
              className="relative my-8"
            >
              <div className="absolute inset-0 flex items-center">
                <motion.span
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                  className="w-full border-t border-gray-200 dark:border-gray-700"
                />
              </div>
              <div className="relative flex justify-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="bg-white/95 dark:bg-black/95 px-4 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider backdrop-blur-sm"
                >
                  Or continue with
                </motion.span>
              </div>
            </motion.div>

            {/* Apple-style Segmented Control */}
            <motion.div
              variants={itemVariants}
            >
              <Tabs defaultValue="mobile" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="mobile">Mobile</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>

                <TabsContent value="mobile" className="mt-8">
                    <MobileAuth onClose={onClose} />
                </TabsContent>

                <TabsContent value="email" className="mt-8">
                    <EmailAuth
                      onClose={onClose}
                      onForgotPassword={() => setView('forgot-password')}
                      onModeChange={handleAuthModeChange}
                    />
                </TabsContent>
              </Tabs>
                </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="forgot-password"
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <ForgotPassword onBack={() => setView('auth')} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
