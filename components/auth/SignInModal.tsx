'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { UnifiedAuthModal } from './UnifiedAuthModal'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'

interface SignInModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const [isScrolled, setIsScrolled] = useState(false)
  const { user } = useAuth()

  // Auto-close when user successfully logs in
  useEffect(() => {
    if (user && open) {
      const timer = setTimeout(() => {
        onOpenChange(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [user, open, onOpenChange])

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement
      setIsScrolled(target.scrollTop > 10)
    }

    const scrollContainer = document.querySelector('[data-scroll-container="auth-modal"]')
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll)
      return () => scrollContainer.removeEventListener('scroll', handleScroll)
    }
  }, [open])

  // Disable scroll on body when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[700px] md:max-w-[760px] lg:max-w-[800px] p-0 bg-white dark:bg-gray-950 border border-gray-200/60 dark:border-gray-800/60 rounded-3xl !max-h-[94vh] !h-auto flex flex-col overflow-hidden shadow-[0_30px_80px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_80px_-12px_rgba(0,0,0,0.5)]"
        style={{
          animation: 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Fixed Header with Apple-style glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`flex-shrink-0 px-10 pt-10 pb-8 border-b transition-all duration-300 ${
            isScrolled 
              ? 'border-gray-200/60 dark:border-gray-800/60 shadow-sm bg-white dark:bg-gray-950' 
              : 'border-gray-200/40 dark:border-gray-800/40 bg-white dark:bg-gray-950'
          } rounded-t-3xl`}
        >
          <DialogHeader>
            <DialogTitle 
              className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent bg-[length:200%_auto]"
              key={authMode}
            >
              <span style={{ animation: 'gradient 3s ease infinite' }}>
                {authMode === 'signin' ? 'Welcome Back' : 'Join Peakime'}
              </span>
            </DialogTitle>
            <DialogDescription 
              className="text-sm md:text-base mt-3 text-gray-600 dark:text-gray-400 leading-relaxed"
              key={`desc-${authMode}`}
            >
              {authMode === 'signin' 
                ? 'Continue your shopping journey' 
                : 'Start your adventure with amazing products'}
            </DialogDescription>
          </DialogHeader>
        </motion.div>

        {/* Scrollable Content */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          data-scroll-container="auth-modal"
          className="flex-1 px-10 py-10 overflow-y-auto overflow-x-hidden min-h-0 bg-white dark:bg-gray-950"
          style={{
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <UnifiedAuthModal 
            onClose={() => onOpenChange(false)}
            onAuthModeChange={setAuthMode}
          />
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
