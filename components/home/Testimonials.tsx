'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'Anime Fan',
    rating: 5,
    comment: 'Amazing quality products! Fast shipping and excellent customer service.',
    avatar: 'https://ui-avatars.com/api/?name=Anime+Fan&background=random',
  },
  {
    name: 'Collector',
    rating: 5,
    comment: 'The figures are absolutely stunning. Best place to buy anime merchandise!',
    avatar: 'https://ui-avatars.com/api/?name=Collector&background=random',
  },
  {
    name: 'Otaku',
    rating: 5,
    comment: 'Great prices and authentic products. Highly recommended!',
    avatar: 'https://ui-avatars.com/api/?name=Otaku&background=random',
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 text-lg">Real reviews from real customers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <span className="font-semibold text-gray-900">{testimonial.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
