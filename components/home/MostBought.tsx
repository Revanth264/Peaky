'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import SectionRow from './SectionRow'

export default function MostBought() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMostBought()
  }, [])

  const fetchMostBought = async () => {
    try {
      // For now, fetch featured products as a placeholder
      // TODO: Replace with actual most bought logic from events
      const response = await axios.get('/api/products?featured=true&limit=8')
      setProducts(response.data?.products || [])
    } catch (error) {
      console.error('Error fetching most bought:', error)
      setProducts([])
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
      title="Most Bought This Week"
      subtitle="What everyone's buying right now"
      products={products}
      href="/products?sort=popular"
      ctaText="Shop trending"
    />
  )
}

