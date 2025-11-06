import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { motion } from 'framer-motion'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', onFocus, onBlur, ...props }, ref) {
    const [isFocused, setIsFocused] = useState(false)
    
    // Check if padding/rounding is explicitly set in className
    const hasLeftPadding = className.includes('pl-')
    const hasRightPadding = className.includes('pr-')
    const hasRounding = className.includes('rounded-')
    
    return (
      <div className="relative">
        <input
          ref={ref}
          className={`flex-1 py-3.5 ${!hasRounding ? 'rounded-2xl' : ''} bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-2 border-gray-200/80 dark:border-gray-700/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-gray-900 transition-all duration-300 text-base ${!hasLeftPadding ? 'pl-4' : ''} ${!hasRightPadding ? 'pr-4' : ''} ${className}`}
          onFocus={(e) => {
            setIsFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            onBlur?.(e)
          }}
          {...props}
        />
        {isFocused && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-purple-500/50 dark:border-purple-400/50 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
