/**
 * Authentication and authorization helpers
 */

import * as admin from 'firebase-admin';
import { unauthorized, forbidden } from './utils/errors.js';

/**
 * Require authentication and return decoded token
 */
export function requireAuth(decodedToken?: admin.auth.DecodedIdToken): admin.auth.DecodedIdToken {
  if (!decodedToken) {
    throw unauthorized('Authentication required');
  }
  return decodedToken;
}

/**
 * Require admin role
 */
export function requireAdmin(decodedToken?: admin.auth.DecodedIdToken): admin.auth.DecodedIdToken {
  const token = requireAuth(decodedToken);
  if (token.role !== 'admin') {
    throw forbidden('Admin access required');
  }
  return token;
}

/**
 * Set custom claim for admin role
 */
export async function setAdminRole(uid: string, isAdmin: boolean): Promise<void> {
  const customClaims = isAdmin ? { role: 'admin' } : {};
  await admin.auth().setCustomUserClaims(uid, customClaims);
}

/**
 * Check if user is admin
 */
export function isAdmin(decodedToken?: admin.auth.DecodedIdToken): boolean {
  return decodedToken?.role === 'admin' || false;
}

