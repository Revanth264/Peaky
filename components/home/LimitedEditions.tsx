'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import SectionRow from './SectionRow'
import { generateDummyProducts, getLimitedEditionsProducts } from '@/lib/dummy-products'

export default function LimitedEditions() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLimitedEditions()
  }, [])

  const fetchLimitedEditions = async () => {
    try {
      // Try to fetch from API first
      const response = await axios.get('/api/products?limited=true&limit=8').catch(() => null)
      
      if (response?.data?.products && response.data.products.length > 0) {
        setProducts(response.data.products)
      } else {
        // Fallback to dummy data
        const dummyProducts = generateDummyProducts()
        setProducts(getLimitedEditionsProducts(dummyProducts))
      }
    } catch (error) {
      console.error('Error fetching limited editions:', error)
      // Fallback to dummy data
      const dummyProducts = generateDummyProducts()
      setProducts(getLimitedEditionsProducts(dummyProducts))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
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
      title="Limited Editions"
      subtitle="Exclusive collectibles with limited stock"
      products={products}
      href="/products?limited=true"
      ctaText="View all limited editions"
    />
  )
}

