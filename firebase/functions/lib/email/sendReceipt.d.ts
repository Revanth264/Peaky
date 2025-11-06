/**
 * Send order receipt email (SendGrid or console fallback)
 */
import type { Order } from '../types.js';
/**
 * Send receipt email to user
 * Falls back to console log if SendGrid is not configured
 */
export declare function sendReceipt(order: Order): Promise<void>;
//# sourceMappingURL=sendReceipt.d.ts.map