'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const { cartItems, getTotalPrice, clearCart } = useCart()
  const { user, getIdToken } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      setAddresses(user.addresses)
      const defaultAddr = user.addresses.find((a: any) => a.isDefault) || user.addresses[0]
      if (defaultAddr?.id) {
        setSelectedAddressId(defaultAddr.id)
      }
    }
  }, [user])

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart')
      return
    }
  }, [cartItems, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to proceed with checkout')
      // Show sign-in modal instead of redirecting
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('openSignInModal')
        window.dispatchEvent(event)
      }
      return
    }

    if (!selectedAddressId) {
      toast.error('Please select a shipping address')
      return
    }

    setLoading(true)
    try {
      // Get Firebase ID token
      const token = await getIdToken()
      if (!token) {
        toast.error('Please login again')
        return
      }

      // Create order
      const response = await axios.post(
        '/api/payment/create-order',
        {
          items: cartItems.map(item => ({
            _id: item._id || item.productId,
            productId: item._id || item.productId,
            quantity: item.quantity,
          })),
          shippingAddressId: selectedAddressId,
          billingAddressId: selectedAddressId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const { razorpayOrderId, amount, key, orderId } = response.data

      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => {
        const options = {
          key,
          amount: Math.round(amount * 100), // Convert to paise
          currency: 'INR',
          name: 'Peakime Store',
          description: 'Order Payment',
          order_id: razorpayOrderId,
          handler: async (response: any) => {
            try {
              // Verify payment
              const verifyResponse = await axios.post(
                '/api/payment/verify',
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId,
                },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                  },
                }
              )

              if (verifyResponse.data.success) {
                clearCart()
                toast.success('Order placed successfully!')
                router.push(`/orders/${orderId}`)
              }
            } catch (error: any) {
              toast.error(error.response?.data?.error || 'Payment verification failed')
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone || '',
          },
          theme: {
            color: '#d97706',
          },
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
        razorpay.on('payment.failed', (response: any) => {
          toast.error('Payment failed. Please try again.')
        })
      }
      document.body.appendChild(script)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = getTotalPrice()
  const shipping = subtotal > 500 ? 0 : 50
  const tax = subtotal * 0.18
  const total = subtotal + shipping + tax

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-6 sm:mb-8">Checkout</h1>
        
        {!user && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Please <Link href="/login?redirect=/checkout" className="font-medium underline">login</Link> to proceed with checkout and payment.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Shipping Address Selection */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8 space-y-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Shipping Address</h2>
              
              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr: any) => (
                    <label
                      key={addr.id}
                      className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="mr-3"
                      />
                      <div className="inline-block">
                        <div className="font-medium text-gray-900 dark:text-white">{addr.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {addr.addressLine1}
                          {addr.addressLine2 && `, ${addr.addressLine2}`}
                          <br />
                          {addr.city}, {addr.state} - {addr.pincode}
                          <br />
                          {addr.country}
                          <br />
                          Phone: {addr.phone}
                        </div>
                        {addr.isDefault && (
                          <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-full mt-2 inline-block">
                            Default
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                  <Link
                    href="/profile?tab=addresses"
                    className="block text-center text-purple-600 dark:text-purple-400 hover:underline text-sm mt-4"
                  >
                    + Add New Address
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No saved addresses</p>
                  <Link
                    href="/profile?tab=addresses"
                    className="text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    Add Address
                  </Link>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 hidden">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-200"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    value={address.addressLine1}
                    onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-200"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Address Line 2</label>
                  <input
                    type="text"
                    value={address.addressLine2}
                    onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State *</label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Country *</label>
                  <input
                    type="text"
                    required
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 transition-all duration-200"
                  />
                </div>
              </div>
              <motion.button
                type="submit"
                disabled={loading || !user}
                whileHover={!loading && user ? { scale: 1.02 } : {}}
                whileTap={!loading && user ? { scale: 0.98 } : {}}
                className={`w-full py-3.5 rounded-full font-medium text-sm transition-all duration-300 ${
                  user && !loading
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-sm hover:shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? 'Processing...' : user ? `Pay ₹${total.toFixed(2)}` : 'Login to Proceed'}
              </motion.button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 sticky top-20">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex-1 pr-2">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Tax (GST)</span>
                  <span className="font-medium text-gray-900 dark:text-white">₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between">
                  <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
