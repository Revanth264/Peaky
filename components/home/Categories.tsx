'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const categories = [
  {
    name: 'Figures',
    slug: 'figures',
    image: 'https://images.unsplash.com/photo-1611250503158-85c8acac7e5c?w=500',
    description: 'Premium anime figures and collectibles',
  },
  {
    name: 'Apparel',
    slug: 'apparel',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    description: 'Anime-themed clothing and accessories',
  },
  {
    name: 'Posters',
    slug: 'posters',
    image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500',
    description: 'High-quality anime posters and prints',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1608848948290-c81570454115?w=500',
    description: 'Keychains, pins, and more',
  },
]

export default function Categories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-lg">Explore our curated collection</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/products?category=${category.slug}`}
                className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white text-xl font-bold mb-1">{category.name}</h3>
                    <p className="text-white/90 text-sm">{category.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
