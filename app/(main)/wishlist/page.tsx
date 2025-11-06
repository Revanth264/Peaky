'use client'

import { useEffect, useState } from 'react'
import { useWishlist } from '@/contexts/WishlistContext'
import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import axios from 'axios'
import { generateDummyProducts } from '@/lib/dummy-products'
import { FiHeart, FiShoppingCart, FiX } from 'react-icons/fi'

interface WishlistProduct {
  id: string
  name: string
  price: number
  comparePrice?: number
  image: string
  stock: number
}

export default function WishlistPage() {
  const { wishlist: wishlistIds, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setWishlist([])
      setLoading(false)
      return
    }
    fetchWishlist()
  }, [wishlistIds])

  const fetchWishlist = async () => {
    try {
      // Fetch product details for wishlist items
      const productPromises = wishlistIds.map((productId) =>
        axios.get(`/api/products/${productId}`).catch(() => null).then((res) => res?.data?.product)
      )
      const products = await Promise.all(productPromises)
      const fetched = products.filter(Boolean) as WishlistProduct[]

      // Fallback to dummy products for any missing IDs (when Firestore/Admin is not available locally)
      if (fetched.length < wishlistIds.length) {
        const dummy = generateDummyProducts()
        const missingIds = wishlistIds.filter(id => !fetched.find(p => p.id === id))
        const dummyMatches = dummy
          .filter(p => missingIds.includes((p.id || (p as any)._id) as string))
          .map(p => ({
            id: (p.id || (p as any)._id) as string,
            name: p.name,
            price: p.price,
            comparePrice: (p as any).comparePrice,
            image: Array.isArray(p.images) && p.images.length ? p.images[0] : p.image,
            stock: p.stock ?? 10,
          }))
        setWishlist([...
          fetched,
          ...dummyMatches,
        ])
      } else {
        setWishlist(fetched)
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error)
      toast.error('Failed to load wishlist')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromWishlist = async (productId: string) => {
    await removeFromWishlist(productId)
    setWishlist(wishlist.filter((p) => p.id !== productId))
  }

  const handleAddToCart = (product: WishlistProduct) => {
    addToCart({
      _id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
    })
    toast.success('Added to cart!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 dark:border-gray-800 border-t-primary-600"></div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 sm:mb-10"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 bg-gradient-to-r from-primary-600 to-pink-600 dark:from-primary-400 dark:to-pink-400 bg-clip-text text-transparent">
            My Wishlist
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            {wishlist.length === 0 ? 'Your saved items will appear here' : `${wishlist.length} ${wishlist.length === 1 ? 'item' : 'items'} saved`}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {wishlist.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 sm:p-16 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-gray-400 dark:text-gray-600 mb-6"
              >
                <FiHeart className="mx-auto h-20 w-20 sm:h-24 sm:w-24" strokeWidth={1} />
              </motion.div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm sm:text-base">
                Start adding products you love to your wishlist
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-pink-600 dark:from-primary-500 dark:to-pink-500 text-white rounded-full font-medium text-sm sm:text-base hover:from-primary-700 hover:to-pink-700 dark:hover:from-primary-600 dark:hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Browse Products
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="wishlist"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            >
              {wishlist.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.05,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  whileHover={{ y: -4 }}
                  className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  <Link href={`/products/${product.id}`}>
                    <div className="relative h-64 bg-gray-50 dark:bg-gray-800 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    </div>
                  </Link>
                  <div className="p-4 sm:p-5">
                    <Link href={`/products/${product.id}`}>
                      <motion.h3
                        whileHover={{ x: 2 }}
                        className="font-medium text-sm sm:text-base mb-2 line-clamp-2 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300"
                      >
                        {product.name}
                      </motion.h3>
                    </Link>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary-600 to-pink-600 dark:from-primary-400 dark:to-pink-400 bg-clip-text text-transparent">
                          ₹{product.price}
                        </span>
                        {product.comparePrice && (
                          <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-through ml-2">
                            ₹{product.comparePrice}
                          </span>
                        )}
                      </div>
                      <motion.button
                        onClick={() => handleRemoveFromWishlist(product.id)}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-300"
                        aria-label="Remove from wishlist"
                      >
                        <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                      </motion.button>
                    </div>
                    <motion.button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      whileHover={{ scale: product.stock > 0 ? 1.02 : 1 }}
                      whileTap={{ scale: product.stock > 0 ? 0.98 : 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className={`w-full py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                        product.stock > 0
                          ? 'bg-gradient-to-r from-primary-600 to-pink-600 dark:from-primary-500 dark:to-pink-500 text-white hover:from-primary-700 hover:to-pink-700 dark:hover:from-primary-600 dark:hover:to-pink-600 shadow-md hover:shadow-lg'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <FiShoppingCart className="w-4 h-4" />
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

