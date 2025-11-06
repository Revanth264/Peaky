/**
 * Firestore helper utilities
 */

import { db } from './admin.js';
import * as admin from 'firebase-admin';

/**
 * Batch write helper with automatic chunking
 */
export async function batchWrite(
  operations: Array<{
    type: 'set' | 'update' | 'delete';
    ref: admin.firestore.DocumentReference;
    data?: any;
  }>
): Promise<void> {
  const BATCH_SIZE = 500;
  
  for (let i = 0; i < operations.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = operations.slice(i, i + BATCH_SIZE);
    
    for (const op of chunk) {
      switch (op.type) {
        case 'set':
          batch.set(op.ref, op.data);
          break;
        case 'update':
          batch.update(op.ref, op.data);
          break;
        case 'delete':
          batch.delete(op.ref);
          break;
      }
    }
    
    await batch.commit();
  }
}

/**
 * Get document or throw if not found
 */
export async function getDocOrThrow<T>(
  ref: admin.firestore.DocumentReference
): Promise<T> {
  const doc = await ref.get();
  if (!doc.exists) {
    throw new Error(`Document not found: ${ref.path}`);
  }
  return { id: doc.id, ...doc.data() } as T;
}

/**
 * Get document or return null
 */
export async function getDocOrNull<T>(
  ref: admin.firestore.DocumentReference
): Promise<T | null> {
  const doc = await ref.get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() } as T;
}

/**
 * Generate unique order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

