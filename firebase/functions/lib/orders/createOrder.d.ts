/**
 * Create order with stock validation and pricing
 */
interface CreateOrderParams {
    uid: string;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
    couponCode?: string;
    shippingAddressId: string;
    billingAddressId?: string;
}
export declare function createOrder(params: CreateOrderParams): Promise<{
    orderId: string;
    orderNumber: string;
    total: number;
    razorpayAmount: number;
}>;
export {};
//# sourceMappingURL=createOrder.d.ts.map