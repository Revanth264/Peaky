'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProductCard from '@/components/products/ProductCard'
import axios from 'axios'
import { NAV_CATEGORIES } from '@/lib/categories'
import { generateDummyProducts } from '@/lib/dummy-products'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '')
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    minPrice: '',
    maxPrice: '',
    sort: searchParams.get('sort') || 'createdAt:desc',
    new: searchParams.get('new') === 'true' ? 'true' : '',
    sale: searchParams.get('sale') === 'true' ? 'true' : '',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    fetchProducts()
  }, [filters, pagination.page])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '12',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      })
      
      const response = await axios.get(`/api/products?${params}`).catch(() => null)
      
      if (response?.data?.products && response.data.products.length > 0) {
        setProducts(response.data.products)
        setPagination((prev) => ({
          ...prev,
          total: response.data.products.length,
          pages: Math.ceil(response.data.products.length / 12),
        }))
      } else {
        // Fallback to dummy data
        const dummyProducts = generateDummyProducts()
        let filtered = [...dummyProducts]
        
        if (filters.category) {
          filtered = filtered.filter(p => p.category === filters.category)
        }
        if (filters.subcategory) {
          filtered = filtered.filter(p => p.subcategory === filters.subcategory)
        }
        if (filters.new === 'true') {
          filtered = filtered.filter(p => p.isNew)
        }
        if (filters.sale === 'true') {
          filtered = filtered.filter(p => p.isOnSale)
        }
        if (filters.minPrice) {
          filtered = filtered.filter(p => p.price >= parseFloat(filters.minPrice))
        }
        if (filters.maxPrice) {
          filtered = filtered.filter(p => p.price <= parseFloat(filters.maxPrice))
        }
        
        const finalProducts = filtered.slice(0, 12)
        setProducts(finalProducts)
        
        setPagination((prev) => ({
          ...prev,
          total: filtered.length,
          pages: Math.ceil(filtered.length / 12),
        }))
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      // Fallback to dummy data
      const dummyProducts = generateDummyProducts()
      setProducts(dummyProducts.slice(0, 12))
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setSelectedSubcategory('')
    const newFilters = { ...filters, category, subcategory: '' }
    setFilters(newFilters)
    router.push(`/products?category=${category}`)
  }

  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategory(subcategory)
    const newFilters = { ...filters, subcategory }
    setFilters(newFilters)
    router.push(`/products?category=${selectedCategory}&subcategory=${subcategory}`)
  }

  // Get category for subcategories
  const currentCategory = NAV_CATEGORIES.find(cat => cat.key === selectedCategory)
  const subcategories = currentCategory?.children || []

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-2">All Products</h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Discover our complete collection</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-5 sticky top-16 sm:top-20 border border-gray-200 dark:border-gray-800 max-h-[calc(100vh-5rem)] overflow-y-auto">
              <h2 className="text-base sm:text-lg font-semibold mb-4 sm:mb-5 text-gray-900 dark:text-white">Filters</h2>
              <div className="space-y-4 sm:space-y-6">
                {/* Categories */}
                <div>
                  <label className="block text-xs font-medium mb-3 text-gray-900 dark:text-white uppercase tracking-wider">Categories</label>
                  <div className="space-y-1.5">
                          {NAV_CATEGORIES.filter(cat => cat.children).map((category) => (
                            <button
                              key={category.key}
                              onClick={() => handleCategoryChange(category.key)}
                              className={`w-full text-left px-3 py-2 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                                selectedCategory === category.key
                                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                            >
                              {category.label}
                            </button>
                          ))}
                    
                    {/* Special Categories */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 mt-3 space-y-1.5">
                            <button
                              onClick={() => {
                                setFilters({ ...filters, category: '', new: 'true', sale: '' })
                                router.push('/products?new=true')
                              }}
                              className={`w-full text-left px-3 py-2 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                                filters.new === 'true'
                                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                            >
                              New Arrivals
                            </button>
                            <button
                              onClick={() => {
                                setFilters({ ...filters, category: '', new: '', sale: 'true' })
                                router.push('/products?sale=true')
                              }}
                              className={`w-full text-left px-3 py-2 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                                filters.sale === 'true'
                                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                            >
                              Sale / Offers
                            </button>
                    </div>
                  </div>
                </div>

                {/* Subcategories */}
                {selectedCategory && subcategories.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium mb-3 text-gray-900 dark:text-white uppercase tracking-wider">Subcategories</label>
                    <div className="space-y-1.5">
                            {subcategories.map((subcat) => (
                              <button
                                key={subcat}
                                onClick={() => handleSubcategoryChange(subcat)}
                                className={`w-full text-left px-3 py-2 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                                  selectedSubcategory === subcat
                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                              >
                                {subcat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </button>
                            ))}
                    </div>
                  </div>
                )}

                {/* Sort By */}
                <div>
                  <label className="block text-xs font-medium mb-3 text-gray-900 dark:text-white uppercase tracking-wider">Sort By</label>
                        <select
                          value={filters.sort}
                          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm"
                        >
                    <option value="createdAt:desc">Newest</option>
                    <option value="price:asc">Price: Low to High</option>
                    <option value="price:desc">Price: High to Low</option>
                    <option value="rating:desc">Highest Rated</option>
                  </select>
                </div>
                
                <button
                        onClick={() => {
                          setFilters({
                            search: '',
                            category: '',
                            subcategory: '',
                            minPrice: '',
                            maxPrice: '',
                            sort: 'createdAt:desc',
                            new: '',
                            sale: '',
                          })
                          setSelectedCategory('')
                          setSelectedSubcategory('')
                          router.push('/products')
                        }}
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-gray-900 dark:text-white text-xs sm:text-sm font-medium transition-colors"
                      >
                        Clear Filters
                      </button>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-2xl h-96 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-3 sm:mb-4">No products found</p>
                <p className="text-gray-500 dark:text-gray-500 text-xs sm:text-sm mb-5 sm:mb-6">
                  Try adjusting your filters or browse all products
                </p>
                <button
                  onClick={() => {
                    setFilters({
                      search: '',
                      category: '',
                      subcategory: '',
                      minPrice: '',
                      maxPrice: '',
                      sort: 'createdAt:desc',
                      new: '',
                      sale: '',
                    })
                    setSelectedCategory('')
                    setSelectedSubcategory('')
                    router.push('/products')
                  }}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 sm:mb-6 flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Showing {products.length} {products.length === 1 ? 'product' : 'products'}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {products.map((product) => (
                    <ProductCard key={product.id || product._id} product={product} />
                  ))}
                </div>
                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-6 sm:mt-8 flex justify-center gap-2 flex-wrap">
                    <button
                      onClick={() =>
                        setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })
                      }
                      disabled={pagination.page === 1}
                      className="px-3 sm:px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-full disabled:opacity-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 text-xs sm:text-sm transition-colors"
                    >
                      Previous
                    </button>
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPagination({ ...pagination, page: i + 1 })}
                        className={`px-3 sm:px-4 py-2 border rounded-full text-xs sm:text-sm transition-colors ${
                          pagination.page === i + 1
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          page: Math.min(pagination.pages, pagination.page + 1),
                        })
                      }
                      disabled={pagination.page === pagination.pages}
                      className="px-3 sm:px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-full disabled:opacity-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 text-xs sm:text-sm transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
