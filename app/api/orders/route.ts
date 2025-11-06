import { NextRequest, NextResponse } from 'next/server'
import { getOrdersByUser } from '@/lib/firestore-orders'
import { getUserIdFromRequest } from '@/lib/auth-firebase'

export async function GET(request: NextRequest) {
  try {
    const uid = await getUserIdFromRequest(request)
    if (!uid) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const orders = await getOrdersByUser(uid)
    return NextResponse.json({ orders })
  } catch (error: any) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
