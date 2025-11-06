'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { format } from 'date-fns'
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

interface Order {
  id: string
  orderNumber: string
  items: OrderItem[]
  total: number
  orderStatus: string
  paymentStatus: string
  createdAt: Date
  shippingAddress?: {
    name: string
    city: string
    state: string
  }
}

export default function OrdersPage() {
  const { user, loading: authLoading, getIdToken } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      // Show sign-in modal instead of redirecting
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('openSignInModal')
        window.dispatchEvent(event)
      }
      router.push('/')
      return
    }
    if (user) {
      fetchOrders()
    }
  }, [user, authLoading, router])

  const fetchOrders = async () => {
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

      const response = await axios.get('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setOrders(response.data.orders)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'processing':
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-purple-100 text-purple-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-24 w-24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Link
              href="/products"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                    </p>
                    {order.shippingAddress && (
                      <p className="text-sm text-gray-600 mt-1">
                        Ship to: {order.shippingAddress.name},{' '}
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">₹{order.total.toFixed(2)}</p>
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-sm text-primary-600 hover:underline mt-2 inline-block"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex gap-4 overflow-x-auto">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 min-w-[200px]">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity} × ₹{item.price}
                          </p>
                          {(item.size || item.color) && (
                            <p className="text-xs text-gray-500">
                              {item.size && `Size: ${item.size}`}
                              {item.size && item.color && ' • '}
                              {item.color && `Color: ${item.color}`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

