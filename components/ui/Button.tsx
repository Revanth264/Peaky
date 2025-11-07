import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

export type ButtonProps = HTMLMotionProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) {
    const base =
      'relative inline-flex items-center justify-center whitespace-nowrap rounded-2xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none overflow-hidden'
    
    const sizeClasses = {
      sm: 'h-9 px-5 text-sm leading-tight',
      md: 'h-12 px-7 text-base leading-tight',
      lg: 'h-14 px-8 text-lg leading-tight',
    }
    
    const variants = {
      primary: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 focus-visible:ring-purple-500/50 active:scale-[0.97] hover:scale-[1.02]',
      secondary: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm hover:shadow-md focus-visible:ring-gray-400 dark:focus-visible:ring-gray-600 active:scale-[0.97] hover:scale-[1.01]',
      outline: 'border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-900 dark:text-white shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-600 active:scale-[0.97] hover:scale-[1.01]',
      ghost: 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 focus-visible:ring-gray-400 dark:focus-visible:ring-gray-600 active:scale-[0.97]',
      danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 focus-visible:ring-red-500/50 active:scale-[0.97] hover:scale-[1.02]',
    }
    
    return (
      <motion.button
        ref={ref}
        className={`${base} ${sizeClasses[size]} ${variants[variant]} ${className}`}
        whileHover={{ y: -1 }}
        whileTap={{ y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25,
          duration: 0.2
        }}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children as any}
        </span>
        {variant === 'primary' || variant === 'danger' ? (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        ) : null}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
