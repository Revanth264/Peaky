'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'
import SectionRow from './SectionRow'

export default function CuratedForYou() {
  const { user } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCuratedProducts()
  }, [user])

  const fetchCuratedProducts = async () => {
    try {
      // Simple rule-based curation: mix of popular categories
      // TODO: Implement personalized curation based on user preferences
      const response = await axios.get('/api/products?featured=true&limit=8').catch(() => null)
      
      if (response?.data?.products && response.data.products.length > 0) {
        setProducts(response.data.products)
      } else {
        // Fallback to dummy data
        const { generateDummyProducts } = await import('@/lib/dummy-products')
        const dummyProducts = generateDummyProducts()
        setProducts(dummyProducts.filter(p => p.featured).slice(0, 8))
      }
    } catch (error) {
      console.error('Error fetching curated products:', error)
      // Fallback to dummy data
      try {
        const { generateDummyProducts } = await import('@/lib/dummy-products')
        const dummyProducts = generateDummyProducts()
        setProducts(dummyProducts.filter(p => p.featured).slice(0, 8))
      } catch (fallbackError) {
        console.error('Error loading dummy products:', fallbackError)
        setProducts([])
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
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
      title={user ? "Curated For You" : "Curated Collections"}
      subtitle={user ? "Personalized picks based on your interests" : "Handpicked selections just for you"}
      products={products}
      href="/products"
      ctaText="Explore more"
    />
  )
}

