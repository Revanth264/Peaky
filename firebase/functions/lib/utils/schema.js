"use strict";
/**
 * Firestore schema validation helpers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponSchema = exports.ReviewSchema = exports.CreateOrderRequestSchema = exports.OrderItemSchema = exports.AddressSchema = exports.HandleSchema = void 0;
const zod_1 = require("zod");
// Handle validation
exports.HandleSchema = zod_1.z.string()
    .regex(/^[a-z0-9_]{3,20}$/, 'Handle must be 3-20 characters, lowercase letters, numbers, and underscores only')
    .toLowerCase();
// Address validation
exports.AddressSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    phone: zod_1.z.string().min(10).max(15),
    addressLine1: zod_1.z.string().min(1).max(200),
    addressLine2: zod_1.z.string().max(200).optional(),
    city: zod_1.z.string().min(1).max(100),
    state: zod_1.z.string().min(1).max(100),
    pincode: zod_1.z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
    country: zod_1.z.string().min(1).max(100),
    isDefault: zod_1.z.boolean().optional().default(false),
    type: zod_1.z.enum(['home', 'work', 'other']).optional(),
});
// Order item validation
exports.OrderItemSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    quantity: zod_1.z.number().int().positive().max(100),
});
// Create order request
exports.CreateOrderRequestSchema = zod_1.z.object({
    items: zod_1.z.array(exports.OrderItemSchema).min(1).max(50),
    couponCode: zod_1.z.string().optional(),
    shippingAddressId: zod_1.z.string().min(1),
    billingAddressId: zod_1.z.string().optional(),
});
// Review submission
exports.ReviewSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().min(10).max(1000),
});
// Coupon validation
exports.CouponSchema = zod_1.z.object({
    code: zod_1.z.string().min(1).max(50),
    type: zod_1.z.enum(['percent', 'flat']),
    value: zod_1.z.number().positive(),
    minSubtotal: zod_1.z.number().nonnegative().optional(),
    maxDiscount: zod_1.z.number().positive().optional(),
    validFrom: zod_1.z.date(),
    validUntil: zod_1.z.date(),
    usageLimit: zod_1.z.number().int().positive().optional(),
    isActive: zod_1.z.boolean().default(true),
});
//# sourceMappingURL=schema.js.map