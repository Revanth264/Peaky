'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import axios from 'axios'
import Link from 'next/link'
import { format } from 'date-fns'

interface Address {
  id?: string
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault?: boolean
  type?: 'home' | 'work' | 'other'
}

export default function ProfilePage() {
  const { user, loading: authLoading, updateUser, getIdToken } = useAuth()
  const router = useRouter()
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const tabParam = searchParams?.get('tab')
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>(
    (tabParam === 'addresses' || tabParam === 'orders') ? tabParam : 'profile'
  )
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: '',
  })
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState<Address>({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
    type: 'home',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      // Show sign-in modal instead of redirecting
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('openSignInModal')
        window.dispatchEvent(event)
      }
      router.push('/')
    }
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      })
      setAddresses(user.addresses || [])
    }
  }, [user, authLoading, router])

  // Sync tab with URL parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      if (tab === 'addresses' || tab === 'orders') {
        setActiveTab(tab)
      }
    }
  }, [])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateUser(formData)
    } catch (error) {
      console.error('Update failed:', error)
    }
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = await getIdToken()
      if (!token) {
        toast.error('Please login again')
        return
      }

      const newAddresses = editingAddress
        ? addresses.map((addr) => (addr.id === editingAddress.id ? addressForm : addr))
        : [...addresses, { ...addressForm, id: Date.now().toString() }]

      await updateUser({ addresses: newAddresses })
      setAddresses(newAddresses)
      setShowAddressForm(false)
      setEditingAddress(null)
      setAddressForm({
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        isDefault: false,
        type: 'home',
      })
      toast.success(editingAddress ? 'Address updated' : 'Address added')
    } catch (error) {
      toast.error('Failed to save address')
    }
  }

  const handleDeleteAddress = async (id: string) => {
    try {
      const newAddresses = addresses.filter((addr) => addr.id !== id)
      await updateUser({ addresses: newAddresses })
      setAddresses(newAddresses)
      toast.success('Address deleted')
    } catch (error) {
      toast.error('Failed to delete address')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const newAddresses = addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
      await updateUser({ addresses: newAddresses })
      setAddresses(newAddresses)
      toast.success('Default address updated')
    } catch (error) {
      toast.error('Failed to update default address')
    }
  }

  if (authLoading) {
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'profile'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'addresses'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Addresses
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'orders'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Orders
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                >
                  Update Profile
                </button>
              </form>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Saved Addresses</h2>
                <button
                  onClick={() => {
                    setShowAddressForm(true)
                    setEditingAddress(null)
                  }}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Add Address
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="mb-6 p-4 border rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address Line 1</label>
                    <input
                      type="text"
                      value={addressForm.addressLine1}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, addressLine1: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address Line 2</label>
                    <input
                      type="text"
                      value={addressForm.addressLine2}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, addressLine2: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">City</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">State</label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Pincode</label>
                      <input
                        type="text"
                        value={addressForm.pincode}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, pincode: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                    >
                      {editingAddress ? 'Update' : 'Add'} Address
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false)
                        setEditingAddress(null)
                      }}
                      className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="p-4 border rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{address.name}</h3>
                        {address.isDefault && (
                          <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingAddress(address)
                            setAddressForm(address)
                            setShowAddressForm(true)
                          }}
                          className="text-primary-600 hover:underline text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id!)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {address.addressLine1}
                      {address.addressLine2 && `, ${address.addressLine2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id!)}
                        className="mt-2 text-sm text-primary-600 hover:underline"
                      >
                        Set as default
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && <OrdersTab userId={user.uid} getIdToken={getIdToken} />}
        </div>
      </div>
    </div>
  )
}

// Orders Tab Component
function OrdersTab({ userId, getIdToken }: { userId: string; getIdToken: () => Promise<string | null> }) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const fetchOrders = async () => {
    try {
      const token = await getIdToken()
      if (!token) {
        setLoading(false)
        return
      }

      const response = await axios.get('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
          <Link
            href="/products"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Order History</h2>
        <Link href="/orders" className="text-primary-600 hover:underline text-sm">
          View all orders →
        </Link>
      </div>
      <div className="space-y-4">
        {orders.slice(0, 5).map((order) => (
          <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : 'Date unknown'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">₹{order.total?.toFixed(2) || '0.00'}</p>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-xs text-primary-600 hover:underline mt-1 inline-block"
                >
                  View Details →
                </Link>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pt-2 border-t">
              {order.items?.slice(0, 3).map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-2 min-w-[150px]">
                  <img
                    src={item.image || '/placeholder.png'}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs truncate">{item.name}</p>
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
              {order.items?.length > 3 && (
                <div className="flex items-center text-xs text-gray-500">
                  +{order.items.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

