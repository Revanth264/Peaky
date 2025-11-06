/**
 * Firestore schema validation helpers
 */
import { z } from 'zod';
export declare const HandleSchema: z.ZodString;
export declare const AddressSchema: z.ZodObject<{
    name: z.ZodString;
    phone: z.ZodString;
    addressLine1: z.ZodString;
    addressLine2: z.ZodOptional<z.ZodString>;
    city: z.ZodString;
    state: z.ZodString;
    pincode: z.ZodString;
    country: z.ZodString;
    isDefault: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    type: z.ZodOptional<z.ZodEnum<["home", "work", "other"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean;
    addressLine2?: string | undefined;
    type?: "home" | "work" | "other" | undefined;
}, {
    name: string;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    addressLine2?: string | undefined;
    isDefault?: boolean | undefined;
    type?: "home" | "work" | "other" | undefined;
}>;
export declare const OrderItemSchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    productId: string;
    quantity: number;
}, {
    productId: string;
    quantity: number;
}>;
export declare const CreateOrderRequestSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
    }, {
        productId: string;
        quantity: number;
    }>, "many">;
    couponCode: z.ZodOptional<z.ZodString>;
    shippingAddressId: z.ZodString;
    billingAddressId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        productId: string;
        quantity: number;
    }[];
    shippingAddressId: string;
    couponCode?: string | undefined;
    billingAddressId?: string | undefined;
}, {
    items: {
        productId: string;
        quantity: number;
    }[];
    shippingAddressId: string;
    couponCode?: string | undefined;
    billingAddressId?: string | undefined;
}>;
export declare const ReviewSchema: z.ZodObject<{
    productId: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodString;
}, "strip", z.ZodTypeAny, {
    productId: string;
    rating: number;
    comment: string;
}, {
    productId: string;
    rating: number;
    comment: string;
}>;
export declare const CouponSchema: z.ZodObject<{
    code: z.ZodString;
    type: z.ZodEnum<["percent", "flat"]>;
    value: z.ZodNumber;
    minSubtotal: z.ZodOptional<z.ZodNumber>;
    maxDiscount: z.ZodOptional<z.ZodNumber>;
    validFrom: z.ZodDate;
    validUntil: z.ZodDate;
    usageLimit: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "percent" | "flat";
    value: number;
    code: string;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
    minSubtotal?: number | undefined;
    maxDiscount?: number | undefined;
    usageLimit?: number | undefined;
}, {
    type: "percent" | "flat";
    value: number;
    code: string;
    validFrom: Date;
    validUntil: Date;
    minSubtotal?: number | undefined;
    maxDiscount?: number | undefined;
    usageLimit?: number | undefined;
    isActive?: boolean | undefined;
}>;
//# sourceMappingURL=schema.d.ts.map