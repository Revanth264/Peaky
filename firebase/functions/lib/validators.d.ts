/**
 * Request validators using Zod
 */
import { z } from 'zod';
/**
 * Validate and parse request body
 */
export declare function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): T;
/**
 * Validate handle
 */
export declare function validateHandle(handle: string): string;
/**
 * Validate create order request
 */
export declare const validateCreateOrderRequest: (data: unknown) => {
    items: {
        productId: string;
        quantity: number;
    }[];
    shippingAddressId: string;
    couponCode?: string | undefined;
    billingAddressId?: string | undefined;
};
/**
 * Validate review submission
 */
export declare const validateReviewSubmission: (data: unknown) => {
    productId: string;
    rating: number;
    comment: string;
};
//# sourceMappingURL=validators.d.ts.map