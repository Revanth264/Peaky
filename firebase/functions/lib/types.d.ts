/**
 * Core type definitions for Peakime E-commerce Store
 */
export interface UserProfile {
    uid: string;
    email: string;
    handle?: string;
    handleLower?: string;
    fullName?: string;
    avatarUrl?: string;
    createdAt: FirebaseFirestore.Timestamp | Date;
    updatedAt?: FirebaseFirestore.Timestamp | Date;
}
export interface Address {
    id: string;
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean;
    type?: 'home' | 'work' | 'other';
    createdAt?: FirebaseFirestore.Timestamp | Date;
}
export interface CartItem {
    productId: string;
    quantity: number;
    addedAt?: FirebaseFirestore.Timestamp | Date;
}
export interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    size?: string;
    color?: string;
}
export interface Order {
    orderId: string;
    uid: string;
    orderNumber: string;
    items: OrderItem[];
    shippingAddress: Address;
    billingAddress: Address;
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    couponCode?: string;
    paymentMethod: string;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    orderStatus: 'created' | 'paid' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    status: 'created' | 'paid' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: FirebaseFirestore.Timestamp | Date;
    updatedAt?: FirebaseFirestore.Timestamp | Date;
}
export interface Inventory {
    productId: string;
    stock: number;
    reserved: number;
    updatedAt: FirebaseFirestore.Timestamp | Date;
}
export interface Product {
    productId: string;
    name: string;
    description?: string;
    price: number;
    discountPrice?: number;
    category?: string;
    tags?: string[];
    images?: string[];
    ratingAvg?: number;
    ratingCount?: number;
    salesLast7?: number;
    salesLast30?: number;
    likes?: number;
    isLimited?: boolean;
    createdAt: FirebaseFirestore.Timestamp | Date;
    updatedAt?: FirebaseFirestore.Timestamp | Date;
}
export interface Review {
    reviewId: string;
    productId: string;
    uid: string;
    rating: number;
    comment: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: FirebaseFirestore.Timestamp | Date;
    updatedAt?: FirebaseFirestore.Timestamp | Date;
}
export interface Event {
    eventId: string;
    type: 'view' | 'click' | 'wishlist_add' | 'cart_add' | 'purchase';
    productId: string;
    uid?: string;
    ts: FirebaseFirestore.Timestamp | Date;
}
export interface Coupon {
    code: string;
    type: 'percent' | 'flat';
    value: number;
    minSubtotal?: number;
    maxDiscount?: number;
    validFrom: FirebaseFirestore.Timestamp | Date;
    validUntil: FirebaseFirestore.Timestamp | Date;
    usageLimit?: number;
    usageCount?: number;
    isActive: boolean;
    createdAt?: FirebaseFirestore.Timestamp | Date;
}
export interface MaterializedList {
    ids: string[];
    updatedAt: FirebaseFirestore.Timestamp | Date;
}
export interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    created_at: number;
}
export interface RazorpayPayment {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    status: string;
    order_id: string;
    method: string;
    created_at: number;
}
//# sourceMappingURL=types.d.ts.map