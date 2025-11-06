'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'
import { format } from 'date-fns'
import { FiPackage, FiTruck, FiCheckCircle, FiMapPin, FiPhone, FiMail } from 'react-icons/fi'
import Link from 'next/link'

interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
}

interface Address {
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  country: string
}

interface Order {
  id: string
  orderNumber: string
  items: OrderItem[]
  shippingAddress: Address
  billingAddress?: Address
  subtotal: number
  shipping: number
  tax: number
  total: number
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: string
  delhiveryInfo?: {
    waybill?: string
    status?: string
    trackingUrl?: string
  }
  createdAt: Date
  updatedAt?: Date
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: FiPackage },
  { key: 'confirmed', label: 'Confirmed', icon: FiCheckCircle },
  { key: 'processing', label: 'Processing', icon: FiPackage },
  { key: 'shipped', label: 'Shipped', icon: FiTruck },
  { key: 'delivered', label: 'Delivered', icon: FiCheckCircle },
]

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const { user, getIdToken } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      // Show sign-in modal instead of redirecting
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('openSignInModal')
        window.dispatchEvent(event)
      }
      router.push('/')
      return
    }
    fetchOrder()
  }, [user, orderId, router])

  const fetchOrder = async () => {
    try {
      const token = await getIdToken()
      if (!token) {
        // Show sign-in modal instead of redirecting
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('openSignInModal')
          window.dispatchEvent(event)
        }
        router.push('/')
        return
      }

      const response = await axios.get(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setOrder(response.data.order)
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex((step) => step.key === status)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'processing':
      case 'shipped':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'delivered':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'cancelled':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 dark:border-gray-800 border-t-primary-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 pt-20">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Order not found</h2>
          <Link
            href="/orders"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  const currentStatusIndex = getStatusIndex(order.orderStatus)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20 pb-12 sm:pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            ← Back to Orders
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-2">
                Order #{order.orderNumber}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(
                  order.orderStatus
                )}`}
              >
                {order.orderStatus}
              </span>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(
                  order.paymentStatus
                )}`}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Order Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Order Status</h2>
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = index <= currentStatusIndex
              const isCurrent = index === currentStatusIndex && order.orderStatus !== 'cancelled'

              return (
                <div key={step.key} className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                      isCompleted
                        ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white text-white dark:text-gray-900'
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 pt-2">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Your order is currently being {step.label.toLowerCase()}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tracking Info */}
          {order.delhiveryInfo?.waybill && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Tracking Details</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Waybill:</span> {order.delhiveryInfo.waybill}
                </p>
                {order.delhiveryInfo.status && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Status:</span> {order.delhiveryInfo.status}
                  </p>
                )}
                {order.delhiveryInfo.trackingUrl && (
                  <a
                    href={order.delhiveryInfo.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                  >
                    Track Package →
                  </a>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-800 last:border-0 last:pb-0"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-1">
                    {item.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <span>Qty: {item.quantity}</span>
                    <span>•</span>
                    <span>₹{item.price}</span>
                    {(item.size || item.color) && (
                      <>
                        <span>•</span>
                        {item.size && <span>Size: {item.size}</span>}
                        {item.size && item.color && <span>•</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Shipping Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiMapPin className="w-5 h-5" />
            Shipping Address
          </h2>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium text-gray-900 dark:text-white">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
            </p>
            <p>{order.shippingAddress.country}</p>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
              <FiPhone className="w-4 h-4" />
              <span>{order.shippingAddress.phone}</span>
            </div>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Tax (GST)</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between">
              <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-base font-semibold text-gray-900 dark:text-white">
                ₹{order.total.toFixed(2)}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Payment Method: {order.paymentMethod}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

