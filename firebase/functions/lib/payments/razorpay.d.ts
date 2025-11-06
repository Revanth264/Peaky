/**
 * Razorpay client and helpers
 */
import Razorpay from 'razorpay';
export declare function getRazorpayClient(): Razorpay;
/**
 * Verify Razorpay webhook signature
 */
export declare function verifyWebhookSignature(payload: string, signature: string): boolean;
/**
 * Create Razorpay order
 */
export declare function createRazorpayOrder(params: {
    amount: number;
    currency?: string;
    receipt: string;
    notes?: Record<string, string>;
}): Promise<any>;
/**
 * Fetch Razorpay payment
 */
export declare function fetchRazorpayPayment(paymentId: string): Promise<any>;
//# sourceMappingURL=razorpay.d.ts.map