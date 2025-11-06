'use client'

import { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'

interface TabsProps {
  defaultValue?: string
  children: ReactNode
  className?: string
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function Tabs({ defaultValue, children, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || '')
  
  return (
    <div className={className}>
      {typeof children === 'object' && 'forEach' in children
        ? children.map((child: any) => {
            if (child?.type?.displayName === 'TabsList') {
              return child
            }
            return null
          })
        : children}
    </div>
  )
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`flex gap-2 mb-6 ${className}`}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className = '' }: TabsTriggerProps) {
  return (
    <button
      className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
        className
      }`}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

