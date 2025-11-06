'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import toast from 'react-hot-toast'
import axios from 'axios'
import { FiHeart, FiShoppingCart, FiMinus, FiPlus, FiArrowLeft, FiStar } from 'react-icons/fi'
import { generateDummyProducts } from '@/lib/dummy-products'

interface Product {
  id?: string
  _id?: string
  name: string
  description?: string
  price: number
  comparePrice?: number
  images: string[]
  stock: number
  sizes?: string[]
  colors?: string[]
  rating?: number
  reviewsCount?: number
  category?: string
  brand?: string
  isNew?: boolean
  isOnSale?: boolean
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    fetchProduct()
  }, [productId])


  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${productId}`).catch(() => null)
      
      if (response?.data?.product) {
        setProduct(response.data.product)
        if (response.data.product.sizes?.length) {
          setSelectedSize(response.data.product.sizes[0])
        }
        if (response.data.product.colors?.length) {
          setSelectedColor(response.data.product.colors[0])
        }
      } else {
        // Fallback to dummy data
        const dummyProducts = generateDummyProducts()
        const foundProduct = dummyProducts.find(p => (p.id || p._id) === productId)
        if (foundProduct) {
          setProduct(foundProduct)
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      // Fallback to dummy data
      const dummyProducts = generateDummyProducts()
      const foundProduct = dummyProducts.find(p => (p.id || p._id) === productId)
      if (foundProduct) {
        setProduct(foundProduct)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    addToCart({
      _id: product.id || product._id || '',
      name: product.name,
      price: product.price,
      image: product.images[0],
      stock: product.stock,
      size: selectedSize,
      color: selectedColor,
    })

    toast.success('Added to cart!')
  }

  const handleToggleWishlist = async () => {
    if (!product) return
    const productIdStr = product.id || product._id || ''
    
    if (isInWishlist(productIdStr)) {
      await removeFromWishlist(productIdStr)
    } else {
      await addToWishlist(productIdStr)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 dark:border-gray-800 border-t-primary-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Product not found</h2>
          <button
            onClick={() => router.push('/products')}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Back to products
          </button>
        </div>
      </div>
    )
  }

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 sm:mb-8 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
              <Image
                src={product.images[selectedImage] || product.images[0] || '/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                  {discount}% OFF
                </span>
              )}
              {(product.isNew || product.isOnSale) && (
                <span className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                  {product.isNew ? 'NEW' : 'SALE'}
                </span>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(0, 4).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === idx
                        ? 'border-gray-900 dark:border-white'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Brand & Title */}
            <div>
              {product.brand && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {product.brand}
                </p>
              )}
              <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
                  ₹{product.price}
                </span>
                {product.comparePrice && (
                  <>
                    <span className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 line-through">
                      ₹{product.comparePrice}
                    </span>
                  </>
                )}
              </div>

              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.rating.toFixed(1)} ({product.reviewsCount || 0} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedSize === size
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <motion.button
                      key={color}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 capitalize ${
                        selectedColor === color
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {color}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-800 rounded-full">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <FiMinus className="w-4 h-4" />
                  </motion.button>
                  <span className="w-12 text-center text-base font-medium text-gray-900 dark:text-white">
                    {quantity}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                  </motion.button>
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                whileHover={{ scale: product.stock > 0 ? 1.02 : 1 }}
                whileTap={{ scale: product.stock > 0 ? 0.98 : 1 }}
                className={`w-full py-3.5 rounded-full font-medium text-sm transition-all duration-300 ${
                  product.stock > 0
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-sm hover:shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {product.stock > 0 ? (
                  <span className="flex items-center justify-center gap-2">
                    <FiShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </span>
                ) : (
                  'Out of Stock'
                )}
              </motion.button>

              <motion.button
                onClick={handleToggleWishlist}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`w-full py-3.5 rounded-full font-medium text-sm border transition-all duration-300 ${
                  isInWishlist(product.id || product._id || '')
                    ? 'border-primary-600 bg-gradient-to-r from-primary-50 to-pink-50 dark:from-primary-900/20 dark:to-pink-900/20 text-primary-600 dark:text-primary-400'
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <FiHeart className={`w-4 h-4 ${isInWishlist(product.id || product._id || '') ? 'fill-current' : ''}`} />
                  {isInWishlist(product.id || product._id || '') ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </span>
              </motion.button>
            </div>

            {/* Product Details */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Product Details</h3>
              <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-2">
                {product.category && (
                  <li className="flex justify-between">
                    <span>Category:</span>
                    <span className="font-medium capitalize">{product.category}</span>
                  </li>
                )}
                {product.brand && (
                  <li className="flex justify-between">
                    <span>Brand:</span>
                    <span className="font-medium">{product.brand}</span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span>Stock:</span>
                  <span className="font-medium">{product.stock} units</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
