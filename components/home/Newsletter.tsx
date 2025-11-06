'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiMail, FiArrowRight } from 'react-icons/fi'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Implement newsletter subscription API call here
    setTimeout(() => {
      toast.success('Subscribed successfully!')
      setEmail('')
      setLoading(false)
    }, 1000)
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-purple-50/30 to-white dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            Stay Updated
          </motion.h2>
          <motion.p 
            className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-10 sm:mb-12 max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Get exclusive deals and new product announcements delivered to your inbox
          </motion.p>
          <motion.form 
            onSubmit={handleSubmit} 
            className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <FiMail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-2 border-gray-200/80 dark:border-gray-700/80 text-gray-900 dark:text-white text-base focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 focus:bg-white dark:focus:bg-gray-900 transition-all duration-300 shadow-sm"
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-semibold text-base shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Subscribing...
                </>
              ) : (
                <>
                  Subscribe
                  <FiArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </section>
  )
}
