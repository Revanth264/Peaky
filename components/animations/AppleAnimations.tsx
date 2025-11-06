'use client'

import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useRef, ReactNode } from 'react'

// Apple's signature easing curve
const appleEasing = [0.25, 0.46, 0.45, 0.94] as const

/**
 * FadeUp - Smooth fade in with upward motion
 * Perfect for text, headings, and content blocks
 */
interface FadeUpProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function FadeUp({ children, delay = 0, className = '' }: FadeUpProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.3,
    margin: '0px 0px -10% 0px'
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.7,
        delay, 
        ease: appleEasing
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * ScaleIn - Smooth scale animation
 * Perfect for cards, images, and featured content
 */
interface ScaleInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function ScaleIn({ children, delay = 0, className = '' }: ScaleInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.3 
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ 
        duration: 0.6,
        delay, 
        ease: appleEasing
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * SlideIn - Slide in from direction
 * Perfect for sidebars, navigation, and side content
 */
interface SlideInProps {
  children: ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  className?: string
}

export function SlideIn({ 
  children, 
  direction = 'left', 
  delay = 0, 
  className = '' 
}: SlideInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.2 
  })

  const getInitial = () => {
    switch (direction) {
      case 'left': return { opacity: 0, x: -40 }
      case 'right': return { opacity: 0, x: 40 }
      case 'up': return { opacity: 0, y: 40 }
      case 'down': return { opacity: 0, y: -40 }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={getInitial()}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ 
        duration: 0.7,
        delay, 
        ease: appleEasing
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * ParallaxSection - Smooth parallax scroll effect
 * Perfect for hero sections and featured areas
 */
interface ParallaxSectionProps {
  children: ReactNode
  speed?: number
  className?: string
}

export function ParallaxSection({ 
  children, 
  speed = 0.5, 
  className = '' 
}: ParallaxSectionProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed])

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Stagger - Staggered children animation
 * Perfect for lists, grids, and sequential content
 */
interface StaggerProps {
  children: ReactNode
  staggerDelay?: number
  className?: string
}

export function Stagger({ 
  children, 
  staggerDelay = 0.1, 
  className = '' 
}: StaggerProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: true, 
    amount: 0.1 
  })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger item variant for children
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

/**
 * HoverScale - Interactive hover scale
 * Perfect for buttons, cards, and interactive elements
 */
interface HoverScaleProps {
  children: ReactNode
  scale?: number
  className?: string
}

export function HoverScale({ 
  children, 
  scale = 1.05, 
  className = '' 
}: HoverScaleProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        duration: 0.3, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * HoverLift - Interactive hover lift with shadow
 * Perfect for cards and featured content
 */
interface HoverLiftProps {
  children: ReactNode
  lift?: number
  className?: string
}

export function HoverLift({ 
  children, 
  lift = -8, 
  className = '' 
}: HoverLiftProps) {
  return (
    <motion.div
      whileHover={{ y: lift }}
      whileTap={{ y: -4 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

