import { getDb } from './firebase-admin'
import type { Query } from 'firebase-admin/firestore'

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
}

export interface Address {
  name: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface DelhiveryInfo {
  waybill?: string
  status?: string
  trackingUrl?: string
}

export interface Order {
  id?: string
  user: string // Firebase UID
  orderNumber: string
  items: OrderItem[]
  shippingAddress: Address
  billingAddress: Address
  subtotal: number
  shipping: number
  tax: number
  total: number
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentId?: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  delhiveryInfo?: DelhiveryInfo
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

// Server-side functions (using Admin SDK)
export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const db = getDb()
    const orderDoc = await db.collection('orders').doc(id).get()
    if (!orderDoc.exists) {
      return null
    }
    return { id: orderDoc.id, ...orderDoc.data() } as Order
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

export async function getOrdersByUser(uid: string, limitCount: number = 50): Promise<Order[]> {
  try {
    const db = getDb()
    const snapshot = await db.collection('orders')
      .where('user', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get()

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order))
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export async function getOrderByOrderNumber(orderNumber: string): Promise<Order | null> {
  try {
    const db = getDb()
    const snapshot = await db.collection('orders')
      .where('orderNumber', '==', orderNumber)
      .limit(1)
      .get()

    if (snapshot.empty) {
      return null
    }

    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    } as Order
  } catch (error) {
    console.error('Error fetching order by order number:', error)
    return null
  }
}

export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const db = getDb()
    const { Timestamp } = await import('firebase-admin/firestore')
    const newOrder = {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    const docRef = await db.collection('orders').add(newOrder)
    return docRef.id
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

export async function updateOrder(id: string, orderData: Partial<Order>): Promise<void> {
  try {
    const db = getDb()
    const { Timestamp } = await import('firebase-admin/firestore')
    await db.collection('orders').doc(id).update({
      ...orderData,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating order:', error)
    throw error
  }
}

export async function getAllOrders(filters: {
  status?: string
  paymentStatus?: string
  limit?: number
}): Promise<Order[]> {
  try {
    const db = getDb()
    let q: Query = db.collection('orders')

    if (filters.status) {
      q = q.where('orderStatus', '==', filters.status)
    }
    if (filters.paymentStatus) {
      q = q.where('paymentStatus', '==', filters.paymentStatus)
    }

    q = q.orderBy('createdAt', 'desc')

    if (filters.limit) {
      q = q.limit(filters.limit)
    }

    const snapshot = await q.get()
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order))
  } catch (error) {
    console.error('Error fetching all orders:', error)
    return []
  }
}

