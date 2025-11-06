import { NextRequest, NextResponse } from 'next/server'
import { getAuthInstance } from '@/lib/firebase-admin'
import { createUserProfile, getUserByUid, UserProfile } from '@/lib/firestore-user'

// Force Node.js runtime for Firebase Admin SDK
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Verify Firebase ID token
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.split('Bearer ')[1]
    
    // Verify token with Firebase Admin Auth
    const auth = getAuthInstance()
    if (!auth) {
      return NextResponse.json(
        { error: 'Firebase Admin Auth not initialized. Please check your environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).' },
        { status: 500 }
      )
    }
    
    const decodedToken = await auth.verifyIdToken(token)
    const uid = decodedToken.uid

    // Get user data from request body
    const userData: Partial<UserProfile> = await request.json()

    // Check if profile already exists
    const existingUser = await getUserByUid(uid)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User profile already exists' },
        { status: 400 }
      )
    }

    // Create user profile in Firestore
    await createUserProfile(uid, {
      ...userData,
      uid,
      email: decodedToken.email || userData.email || '',
    })

    // Fetch and return created user
    const user = await getUserByUid(uid)
    
    return NextResponse.json(
      { 
        message: 'User profile created successfully',
        user 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating user profile:', error)
    
    // Provide more helpful error messages
    if (error.message?.includes('Firebase Admin Auth not initialized')) {
      return NextResponse.json(
        { error: 'Firebase Admin Auth not initialized. Please check your environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create user profile' },
      { status: 500 }
    )
  }
}
