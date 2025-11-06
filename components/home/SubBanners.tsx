'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

const banners = [
  {
    title: 'New Arrivals',
    subtitle: 'Latest drops',
    href: '/#new-arrivals',
    gradient: 'from-purple-600 to-pink-500',
  },
  {
    title: 'Best Sellers',
    subtitle: 'Top picks',
    href: '/#best-sellers',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    title: 'Sale & Offers',
    subtitle: 'Special deals',
    href: '/#sale-offers',
    gradient: 'from-pink-600 to-red-600',
  },
]

export default function SubBanners() {
  return (
    <section className="py-5 sm:py-6 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {banners.map((banner, index) => (
            <motion.div
              key={banner.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  href={banner.href}
                  className={`group relative block overflow-hidden rounded-2xl p-6 sm:p-7 bg-gradient-to-br ${banner.gradient} transition-all duration-500 shadow-lg hover:shadow-xl`}
                >
                  <div className="relative z-10 text-white">
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, x: 4 }}
                      className="text-lg sm:text-xl md:text-2xl font-bold mb-1.5"
                    >
                      {banner.title}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.1 }}
                      className="text-white/90 text-xs sm:text-sm mb-3 sm:mb-4 font-normal"
                    >
                      {banner.subtitle}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="flex items-center gap-2 text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <span>View</span>
                      <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

