import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } =
      await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment verification failed: Missing parameters' },
        { status: 400 }
      )
    }

    // Verify signature (client-side verification)
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(text)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Payment verification failed: Invalid signature' },
        { status: 400 }
      )
    }

    // Call Firebase Function to finalize order
    const token = await getIdToken()
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    const functionsUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL || 'https://api-azi6a7lafq-el.a.run.app'
    const response = await fetch(`${functionsUrl}/api/payment-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: razorpay_payment_id,
              order_id: razorpay_order_id,
              notes: {
                orderId,
              },
            },
          },
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error?.message || 'Failed to verify payment' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      order: {
        orderId,
        status: 'paid',
        paymentStatus: 'paid',
      },
    })
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    )
  }
}
