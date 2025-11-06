'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/products/ProductCard'
import axios from 'axios'

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get('/api/products?featured=true&limit=8')
      // Handle both success and empty response
      if (response.data && response.data.products) {
        setProducts(response.data.products)
      } else {
        setProducts([])
      }
    } catch (error: any) {
      console.error('Error fetching featured products:', error)
      // Set empty array on error to prevent crashes
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 text-lg">Handpicked for you</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-96 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No featured products available at the moment.</p>
            <p className="text-gray-400 text-sm mt-2">Please check your Firebase configuration.</p>
          </div>
        )}
      </div>
    </section>
  )
}
