/**
 * Firebase Admin SDK initialization
 */

import * as admin from 'firebase-admin';

// Initialize Admin SDK (singleton)
if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage: admin.storage.Storage = admin.storage();

// Helper to get current timestamp
export function serverTimestamp(): admin.firestore.FieldValue {
  return admin.firestore.FieldValue.serverTimestamp();
}

// Helper to get current date
export function now(): Date {
  return new Date();
}

