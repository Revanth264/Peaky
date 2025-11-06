'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import SectionRow from './SectionRow'

export default function Drops() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDrops()
  }, [])

  const fetchDrops = async () => {
    try {
      // Fetch limited edition or drop products
      // TODO: Filter by isDrop flag and dropAt date
      const response = await axios.get('/api/products?limited=true&limit=8')
      setProducts(response.data?.products || [])
    } catch (error) {
      console.error('Error fetching drops:', error)
      setProducts([])
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
      title="Drops & Announcements"
      subtitle="Limited edition releases and exclusive drops"
      products={products}
      href="/products?limited=true"
      ctaText="View all drops"
    />
  )
}

