import { NextRequest, NextResponse } from 'next/server'
import { getAuthInstance } from '@/lib/firebase-admin'
import { updateUserProfile, getUserByUid, UserProfile } from '@/lib/firestore-user'

export async function PUT(request: NextRequest) {
  try {
    // Verify Firebase ID token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.split('Bearer ')[1]
    const auth = getAuthInstance()
    if (!auth) {
      return NextResponse.json(
        { error: 'Firebase Admin Auth not initialized' },
        { status: 500 }
      )
    }
    const decodedToken = await auth.verifyIdToken(token)
    const uid = decodedToken.uid

    // Get update data from request body
    const data: Partial<UserProfile> = await request.json()

    // Update user profile in Firestore
    await updateUserProfile(uid, data)

    // Fetch and return updated user
    const user = await getUserByUid(uid)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        uid: user.uid,
        _id: user.uid, // For backward compatibility
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        addresses: user.addresses,
        role: user.role,
        preferences: user.preferences,
        wishlist: user.wishlist,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent,
      },
    })
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    )
  }
}
