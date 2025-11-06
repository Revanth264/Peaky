'use client'

import { ReactNode, createContext, useContext, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
  defaultValue: string
  children: ReactNode
  className?: string
}

export function Tabs({ defaultValue, children, className = '' }: TabsProps) {
  const [value, setValue] = useState(defaultValue)

  return (
    <TabsContext.Provider value={{ value, onValueChange: setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`inline-flex h-14 w-full items-center justify-center rounded-2xl bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 shadow-sm overflow-hidden ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {children}
    </motion.div>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsTrigger({ value, children, className = '' }: TabsTriggerProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  const { value: selectedValue, onValueChange } = context
  const isActive = selectedValue === value

  return (
    <motion.button
      type="button"
      onClick={() => onValueChange(value)}
      className={`relative flex-1 h-full px-5 py-2.5 text-base font-semibold rounded-xl transition-all duration-300 ${
        isActive
          ? 'text-gray-900 dark:text-white'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
      } ${className}`}
      whileHover={{ scale: isActive ? 1 : 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{ 
        margin: 0,
        minWidth: 0,
        flexShrink: 1,
        boxSizing: 'border-box'
      }}
    >
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-white dark:bg-gray-700 rounded-xl shadow-sm"
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 35,
            mass: 0.5
          }}
          style={{
            margin: 0,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            boxSizing: 'border-box'
          }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center whitespace-nowrap">{children}</span>
    </motion.button>
  )
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')

  const { value: selectedValue } = context
  const isActive = selectedValue === value

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ 
            duration: 0.35,
            ease: [0.25, 0.46, 0.45, 0.94],
            scale: { duration: 0.3 }
          }}
          className={`${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
