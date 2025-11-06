import { 
  ConfirmationResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  reload,
  User,
} from 'firebase/auth'
import { auth } from './firebase'

export async function verifyPhoneOTP(
  confirmationResult: ConfirmationResult,
  otp: string
): Promise<User> {
  const result = await confirmationResult.confirm(otp)
  return result.user
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  const user = userCredential.user
  
  // Reload user to get latest verification status
  await reload(user)
  
  // Block unverified email users
  if (user.email && !user.emailVerified) {
    await signOut(auth)
    throw new Error('EMAIL_NOT_VERIFIED')
  }
  
  return user
}

// Register with email and password
export async function registerWithEmail(data: {
  email: string
  password: string
  displayName: string
}): Promise<{ status: string }> {
  const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
  const user = userCredential.user
  
  // Update profile
  await updateProfile(user, {
    displayName: data.displayName,
  })
  
  // Send verification email
  const verifyOptions: any = { handleCodeInApp: true }
  if (typeof window !== 'undefined') {
    verifyOptions.url = `${window.location.origin}/verify-email`
  }
  await sendEmailVerification(user, verifyOptions)
  
  // Critical: Sign out unverified user
  await signOut(auth)
  
  return { status: 'VERIFY_EMAIL_SENT' }
}

// Reset password
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

