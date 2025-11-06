'use client'

import { ReactNode } from 'react'

interface InputIconProps {
  children: ReactNode
  className?: string
}

export function InputIcon({ children, className = '' }: InputIconProps) {
  return (
    <div className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none ${className}`}>
      {children}
    </div>
  )
}

