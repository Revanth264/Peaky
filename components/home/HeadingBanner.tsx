'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'

interface HeadingBannerProps {
  title: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
  gradient?: string
}

export default function HeadingBanner({
  title,
  subtitle,
  ctaText = 'View All',
  ctaLink = '/products',
  gradient = 'from-primary-600 to-pink-600',
}: HeadingBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-pink-50 to-purple-50 dark:from-primary-950/20 dark:via-pink-950/20 dark:to-purple-950/20 p-8 md:p-12 mb-12 border border-primary-100 dark:border-primary-900/50"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>

          {ctaLink && (
            <Link
              href={ctaLink}
              className={`group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${gradient} text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}
            >
              {ctaText}
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-400/20 to-pink-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
    </motion.div>
  )
}

