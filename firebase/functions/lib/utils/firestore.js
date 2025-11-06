"use strict";
/**
 * Firestore helper utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchWrite = batchWrite;
exports.getDocOrThrow = getDocOrThrow;
exports.getDocOrNull = getDocOrNull;
exports.generateOrderNumber = generateOrderNumber;
const admin_js_1 = require("./admin.js");
/**
 * Batch write helper with automatic chunking
 */
async function batchWrite(operations) {
    const BATCH_SIZE = 500;
    for (let i = 0; i < operations.length; i += BATCH_SIZE) {
        const batch = admin_js_1.db.batch();
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
async function getDocOrThrow(ref) {
    const doc = await ref.get();
    if (!doc.exists) {
        throw new Error(`Document not found: ${ref.path}`);
    }
    return { id: doc.id, ...doc.data() };
}
/**
 * Get document or return null
 */
async function getDocOrNull(ref) {
    const doc = await ref.get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() };
}
/**
 * Generate unique order number
 */
function generateOrderNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
}
//# sourceMappingURL=firestore.js.map