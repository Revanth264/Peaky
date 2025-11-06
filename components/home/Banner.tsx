'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Banner() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Free Shipping on Orders Over ₹500!
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Plus, get 10% off your first order when you sign up
          </p>
          <Link
            href="/products"
            className="inline-block px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-1"
          >
            Shop Now
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
