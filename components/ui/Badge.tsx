import { HTMLAttributes } from 'react'

export function Badge({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-primary-100 text-primary-800 ${className}`}
      {...props}
    />
  )
}

