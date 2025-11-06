import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-firebase'
import { getIdToken } from '@/lib/firebase-client'

export async function POST(request: NextRequest) {
  try {
    const uid = await getUserIdFromRequest(request)
    if (!uid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { items, shippingAddressId, billingAddressId, couponCode } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      )
    }

    if (!shippingAddressId) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      )
    }

    // Get Firebase ID token
    const token = await getIdToken()
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Call Firebase Function
    const functionsUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || 'https://api-azi6a7lafq-el.a.run.app'
    const response = await fetch(`${functionsUrl}/api/create-payment-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: items.map((item: any) => ({
          productId: item._id || item.productId,
          quantity: item.quantity,
        })),
        shippingAddressId,
        billingAddressId,
        couponCode,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error?.message || 'Failed to create order' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      razorpayOrderId: data.razorpayOrderId,
      amount: data.amount / 100, // Convert from paisa to rupees
      currency: 'INR',
      key: data.razorpayKeyId,
    })
  } catch (error: any) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}
