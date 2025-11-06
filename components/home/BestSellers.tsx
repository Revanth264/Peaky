'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import SectionRow from './SectionRow'
import { generateDummyProducts, getBestSellersProducts } from '@/lib/dummy-products'

export default function BestSellers() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBestSellers()
  }, [])

  const fetchBestSellers = async () => {
    try {
      // Try to fetch from API first
      const response = await axios.get('/api/products?sort=popular&limit=8').catch(() => null)
      
      if (response?.data?.products && response.data.products.length > 0) {
        setProducts(response.data.products)
      } else {
        // Fallback to dummy data
        const dummyProducts = generateDummyProducts()
        setProducts(getBestSellersProducts(dummyProducts))
      }
    } catch (error) {
      console.error('Error fetching best sellers:', error)
      // Fallback to dummy data
      const dummyProducts = generateDummyProducts()
      setProducts(getBestSellersProducts(dummyProducts))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-64 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-lg h-96 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <SectionRow
      title="Best Sellers"
      subtitle="Top-rated products loved by our community"
      products={products}
      href="/products?sort=popular"
      ctaText="Shop best sellers"
    />
  )
}

