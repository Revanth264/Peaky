'use client'
import { motion, useInView, Variants } from 'framer-motion'
import { useRef, ReactNode } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  y?: number
  once?: boolean
  className?: string
}

export function FadeIn({ children, delay = 0, y = 20, once = true, className = '' }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { 
    margin: '0px 0px -15% 0px',
    once: true,
    amount: 0.15
  })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.6,
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerProps {
  children: ReactNode
  delay?: number
  stagger?: number
  className?: string
}

export function Stagger({ children, delay = 0, stagger = 0.08, className = '' }: StaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ 
        once: true,
        margin: '0px 0px -15% 0px',
        amount: 0.1
      }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export const itemFadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    } 
  },
}

