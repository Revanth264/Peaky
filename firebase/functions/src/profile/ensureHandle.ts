/**
 * Ensure unique handle for user profile
 */

import { db } from '../utils/admin.js';
import { validateHandle } from '../validators.js';
import { conflict, unprocessableEntity } from '../utils/errors.js';
import { serverTimestamp } from '../utils/admin.js';

interface EnsureHandleRequest {
  handle: string;
}

export async function ensureHandle(
  uid: string,
  data: EnsureHandleRequest
): Promise<{ handle: string; handleLower: string }> {
  // Validate handle format
  const handleLower = validateHandle(data.handle);
  
  // Check if handle is already taken
  const handleQuery = await db
    .collectionGroup('profile')
    .where('handleLower', '==', handleLower)
    .limit(1)
    .get();
  
  if (!handleQuery.empty) {
    const existingDoc = handleQuery.docs[0];
    if (existingDoc.data().uid !== uid) {
      throw conflict('Handle is already taken');
    }
    // Same user, handle already set - return existing
    return {
      handle: existingDoc.data().handle || handleLower,
      handleLower,
    };
  }
  
  // Check user's existing profile
  const profileRef = db.collection('users').doc(uid).collection('profile').doc('main');
  const profileDoc = await profileRef.get();
  
  if (profileDoc.exists) {
    const existing = profileDoc.data();
    if (existing?.handleLower && existing.handleLower !== handleLower) {
      throw unprocessableEntity('Handle cannot be changed once set');
    }
    if (existing?.handleLower === handleLower) {
      // Already set to this handle
      return {
        handle: existing.handle || handleLower,
        handleLower,
      };
    }
  }
  
  // Set handle
  await profileRef.set(
    {
      handle: data.handle,
      handleLower,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  
  return {
    handle: data.handle,
    handleLower,
  };
}

