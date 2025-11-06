/**
 * Finalize order after payment
 */
/**
 * Finalize order: mark as paid, decrement inventory, mirror to user
 */
export declare function finalizeOrder(orderId: string, razorpayPaymentId: string, razorpaySignature?: string): Promise<void>;
//# sourceMappingURL=finalizeOrder.d.ts.map