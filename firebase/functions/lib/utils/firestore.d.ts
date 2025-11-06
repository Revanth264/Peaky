/**
 * Firestore helper utilities
 */
import * as admin from 'firebase-admin';
/**
 * Batch write helper with automatic chunking
 */
export declare function batchWrite(operations: Array<{
    type: 'set' | 'update' | 'delete';
    ref: admin.firestore.DocumentReference;
    data?: any;
}>): Promise<void>;
/**
 * Get document or throw if not found
 */
export declare function getDocOrThrow<T>(ref: admin.firestore.DocumentReference): Promise<T>;
/**
 * Get document or return null
 */
export declare function getDocOrNull<T>(ref: admin.firestore.DocumentReference): Promise<T | null>;
/**
 * Generate unique order number
 */
export declare function generateOrderNumber(): string;
//# sourceMappingURL=firestore.d.ts.map