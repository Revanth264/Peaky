import { NextRequest } from 'next/server'
import { auth } from './firebase-admin'
import { DecodedIdToken } from 'firebase-admin/auth'

export async function verifyFirebaseToken(request: NextRequest): Promise<DecodedIdToken | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await auth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    console.error('Error verifying Firebase token:', error)
    return null
  }
}

export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const decodedToken = await verifyFirebaseToken(request)
  return decodedToken?.uid || null
}

