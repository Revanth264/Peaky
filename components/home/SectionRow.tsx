'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import ProductCard from '@/components/products/ProductCard'
import { FiArrowRight } from 'react-icons/fi'

interface SectionRowProps {
  title: string
  subtitle?: string
  products: any[]
  href?: string
  ctaText?: string
}

export default function SectionRow({ 
  title, 
  subtitle, 
  products, 
  href, 
  ctaText = 'View all' 
}: SectionRowProps) {
  if (!products || products.length === 0) {
    return null
  }

  // Generate ID from title for anchor links
  const sectionId = title.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-').replace(/[^a-z0-9-]/g, '')

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-gray-950" id={sectionId}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4"
              >
                <div>
                  <motion.h2 
                    className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent tracking-tight"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    {title}
                  </motion.h2>
                  {subtitle && (
                    <motion.p 
                      className="text-gray-600 dark:text-gray-400 text-sm sm:text-base font-normal leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {subtitle}
                    </motion.p>
                  )}
                </div>
                {href && (
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Link
                      href={href}
                      className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
                    >
                      {ctaText}
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <FiArrowRight className="w-4 h-4" />
                      </motion.span>
                    </Link>
                  </motion.div>
                )}
              </motion.div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id || product._id || index}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                      duration: 0.5, 
                      delay: index * 0.05,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    whileHover={{ y: -4 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
      </div>
    </section>
  )
}

