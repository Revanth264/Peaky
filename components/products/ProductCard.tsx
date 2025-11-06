'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { FiShoppingCart, FiHeart } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

interface ProductCardProps {
  product: {
    id?: string
    _id?: string
    name: string
    price: number
    comparePrice?: number
    images: string[]
    stock: number
    category?: string
    rating?: number
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const productId = product.id || product._id || ''
  const isWishlisted = isInWishlist(productId)

  const handleAddToCart = () => {
    addToCart({
      _id: productId,
      name: product.name,
      price: product.price,
      image: product.images[0],
      stock: product.stock,
    })
    toast.success('Added to cart!')
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isWishlisted) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId)
    }
  }

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
      }}
      transition={{ 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className="group relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-200/60 dark:border-gray-800/60 hover:border-purple-300/80 dark:hover:border-purple-700/80 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10"
    >
      <Link href={`/products/${productId}`}>
        <motion.div 
          className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="relative w-full h-full"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={product.images[0] || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover"
            />
          </motion.div>
          {discount > 0 && (
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
              className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-3 py-1.5 rounded-2xl text-xs font-bold shadow-xl backdrop-blur-sm"
            >
              {discount}% OFF
            </motion.span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-white dark:bg-gray-900 px-4 py-2 rounded-xl text-sm font-medium text-gray-900 dark:text-white shadow-lg">
                Out of Stock
              </span>
            </div>
          )}
          {/* Wishlist Button */}
          <motion.button
            onClick={handleToggleWishlist}
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 shadow-md ${
              isWishlisted
                ? 'bg-gradient-to-r from-primary-600 to-pink-600 text-white shadow-lg'
                : 'bg-white/95 dark:bg-gray-900/95 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm'
            }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FiHeart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </motion.button>
        </motion.div>
      </Link>

      <div className="p-5 sm:p-6">
        <Link href={`/products/${productId}`}>
          <motion.h3
            whileHover={{ x: 3 }}
            transition={{ duration: 0.2 }}
            className="font-semibold text-base sm:text-lg mb-3 line-clamp-2 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 leading-tight"
          >
            {product.name}
          </motion.h3>
        </Link>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-2">
            <motion.span 
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              ₹{product.price}
            </motion.span>
            {product.comparePrice && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                ₹{product.comparePrice}
              </span>
            )}
          </div>
          {product.rating && (
            <motion.div 
              className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full"
              whileHover={{ scale: 1.1 }}
            >
              <span className="text-yellow-500">★</span>
              <span className="font-semibold">{product.rating.toFixed(1)}</span>
            </motion.div>
          )}
        </div>

        <motion.button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          whileHover={{ 
            scale: product.stock > 0 ? 1.02 : 1,
            y: product.stock > 0 ? -2 : 0
          }}
          whileTap={{ scale: product.stock > 0 ? 0.97 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`w-full py-3 rounded-2xl font-semibold text-base transition-all duration-300 ${
            product.stock > 0
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30'
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
      </div>
    </motion.div>
  )
}
