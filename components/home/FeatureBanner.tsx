'use client'

import { motion } from 'framer-motion'
import { FiTruck, FiShield, FiHeadphones, FiAward, FiStar, FiPackage } from 'react-icons/fi'

const features = [
  {
    icon: FiTruck,
    title: 'Free Shipping',
    description: 'On orders over ₹999',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: FiShield,
    title: 'Secure Payment',
    description: '100% secure transactions',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: FiHeadphones,
    title: '24/7 Support',
    description: 'Always here to help',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: FiAward,
    title: 'Premium Quality',
    description: 'Authentic products only',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: FiStar,
    title: 'Exclusive Items',
    description: 'Limited edition collectibles',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    icon: FiPackage,
    title: 'Easy Returns',
    description: 'Hassle-free returns',
    color: 'from-indigo-500 to-indigo-600',
  },
]

export default function FeatureBanner() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary-600 to-pink-600 bg-clip-text text-transparent">
              Why Choose Peakime Store?
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Experience the best in anime merchandise with our premium features
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

