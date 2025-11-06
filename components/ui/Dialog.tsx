'use client'

import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  className?: string
}

export function Dialog({ open, onOpenChange, children, className = '' }: DialogProps) {
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

  useEffect(() => {
    if (!open) return
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onOpenChange(false)
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [open, onOpenChange])

  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onOpenChange(false)
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/40"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ 
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
              scale: { duration: 0.35 },
              y: { duration: 0.4 }
            }}
            className={`relative z-10 ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

interface DialogContentProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export function DialogContent({ children, className = '', style }: DialogContentProps) {
  return <div className={className} style={style}>{children}</div>
}

interface DialogHeaderProps {
  children: ReactNode
  className?: string
}

export function DialogHeader({ children, className = '' }: DialogHeaderProps) {
  return <div className={className}>{children}</div>
}

interface DialogTitleProps {
  children: ReactNode
  className?: string
}

export function DialogTitle({ children, className = '' }: DialogTitleProps) {
  return <h2 className={className}>{children}</h2>
}

interface DialogDescriptionProps {
  children: ReactNode
  className?: string
}

export function DialogDescription({ children, className = '' }: DialogDescriptionProps) {
  return <p className={className}>{children}</p>
}

interface DialogCloseProps {
  onClose: () => void
  className?: string
}

export function DialogClose({ onClose, className = '' }: DialogCloseProps) {
  return (
    <motion.button
      onClick={onClose}
      className={`absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 z-10 ${className}`}
      aria-label="Close"
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <FiX className="h-4 w-4" />
    </motion.button>
  )
}
