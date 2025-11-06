'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiArrowRight, FiTag, FiZap, FiGift } from 'react-icons/fi'

const banners = [
  {
    id: 'new-launch',
    title: 'New Launch',
    subtitle: 'Latest Collection',
    description: 'Fresh arrivals just for you',
    cta: 'Shop Now',
    href: '/products?new=true',
    gradient: 'from-purple-600 to-pink-500',
    icon: FiZap,
    badge: 'NEW',
    badgeColor: 'bg-green-500',
  },
  {
    id: 'sale-20',
    title: '20% OFF',
    subtitle: 'Limited Time',
    description: 'On selected items',
    cta: 'Shop Sale',
    href: '/products?sale=true',
    gradient: 'from-pink-600 to-rose-600',
    icon: FiTag,
    badge: 'SALE',
    badgeColor: 'bg-red-500',
  },
  {
    id: 'limited-edition',
    title: 'Limited Edition',
    subtitle: 'Exclusive Drops',
    description: 'Only a few left',
    cta: 'Explore',
    href: '/products?limited=true',
    gradient: 'from-purple-600 to-indigo-600',
    icon: FiGift,
    badge: 'LIMITED',
    badgeColor: 'bg-orange-500',
  },
]

export default function PromotionalBanners() {
  return (
    <section className="py-4 sm:py-5 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {banners.map((banner, index) => {
            const Icon = banner.icon
            return (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Link
                    href={banner.href}
                    className="group relative block overflow-hidden rounded-3xl p-8 sm:p-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/60 dark:border-gray-800/60 hover:border-purple-300/80 dark:hover:border-purple-700/80 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-purple-500/10"
                  >
                    {/* Badge */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
                      className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10"
                    >
                      <span className={`${banner.badgeColor} text-white px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium shadow-md`}>
                        {banner.badge}
                      </span>
                    </motion.div>

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="mb-4">
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-2 mb-3"
                        >
                          <motion.div
                            whileHover={{ rotate: 360, scale: 1.2 }}
                            transition={{ duration: 0.6 }}
                          >
                            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 dark:text-purple-400" />
                          </motion.div>
                          <p className="text-sm sm:text-base font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                            {banner.subtitle}
                          </p>
                        </motion.div>
                        <motion.h3
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2"
                        >
                          {banner.title}
                        </motion.h3>
                        <motion.p
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 + 0.15 }}
                          className="text-xs sm:text-sm text-gray-600 dark:text-gray-400"
                        >
                          {banner.description}
                        </motion.p>
                      </div>

                      <motion.div
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors duration-300"
                      >
                        <span className="text-sm">{banner.cta}</span>
                        <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

