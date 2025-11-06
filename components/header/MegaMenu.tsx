'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { NAV_CATEGORIES } from '@/lib/categories'
import { FiChevronRight } from 'react-icons/fi'

interface MegaMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/5 z-[99]"
            onClick={onClose}
          />

          {/* Mega Menu */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-16 sm:top-20 left-0 right-0 z-[100] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg"
            onMouseLeave={onClose}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {NAV_CATEGORIES.map((category, idx) => (
                  <motion.div
                    key={category.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className="relative"
                    onMouseEnter={() => setHoveredCategory(category.key)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <Link
                      href={category.children ? `/products?category=${category.key}` : category.key === 'new' ? '/#new-arrivals' : category.key === 'best' ? '/#best-sellers' : category.key === 'sale' ? '/#sale-offers' : '/products'}
                      className="group block mb-3 sm:mb-4"
                      onClick={(e) => {
                        onClose()
                        // Handle smooth scroll for anchor links
                        if (category.key === 'new' || category.key === 'best' || category.key === 'sale') {
                          e.preventDefault()
                          const href = category.key === 'new' ? '/#new-arrivals' : category.key === 'best' ? '/#best-sellers' : '/#sale-offers'
                          if (window.location.pathname === '/') {
                            const element = document.querySelector(href)
                            element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          } else {
                            window.location.href = href
                          }
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                          {category.label}
                        </h3>
                        {category.children && (
                          <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-all duration-300 group-hover:translate-x-1" />
                        )}
                      </div>
                    </Link>

                    {category.children && (
                      <motion.ul
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: hoveredCategory === category.key ? 1 : 0.8,
                        }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2 sm:space-y-3"
                      >
                        {category.children.map((child, childIdx) => (
                          <motion.li
                            key={child}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ 
                              opacity: hoveredCategory === category.key ? 1 : 0.7,
                              x: hoveredCategory === category.key ? 0 : -5
                            }}
                            transition={{ delay: childIdx * 0.03, duration: 0.2 }}
                          >
                            <Link
                              href={`/products?category=${category.key}&subcategory=${child}`}
                              className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-300 flex items-center gap-2 sm:gap-3 group/sub"
                              onClick={onClose}
                            >
                              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-300 dark:bg-gray-600 group-hover/sub:bg-gray-900 dark:group-hover/sub:bg-white transition-all duration-300"></span>
                              <span className="capitalize font-medium group-hover/sub:translate-x-1 transition-transform duration-300">{child.replace('-', ' ')}</span>
                            </Link>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
