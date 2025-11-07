import { ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

export function Card({ className = '', children, ...props }: HTMLMotionProps<'div'> & { children?: ReactNode }) {
  return (
    <motion.div
      className={`rounded-3xl border border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm hover:shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`}
      whileHover={{ 
        y: -4,
        scale: 1.01,
        transition: { duration: 0.3 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
