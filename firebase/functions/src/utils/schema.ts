/**
 * Firestore schema validation helpers
 */

import { z } from 'zod';

// Handle validation
export const HandleSchema = z.string()
  .regex(/^[a-z0-9_]{3,20}$/, 'Handle must be 3-20 characters, lowercase letters, numbers, and underscores only')
  .toLowerCase();

// Address validation
export const AddressSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(10).max(15),
  addressLine1: z.string().min(1).max(200),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  country: z.string().min(1).max(100),
  isDefault: z.boolean().optional().default(false),
  type: z.enum(['home', 'work', 'other']).optional(),
});

// Order item validation
export const OrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(100),
});

// Create order request
export const CreateOrderRequestSchema = z.object({
  items: z.array(OrderItemSchema).min(1).max(50),
  couponCode: z.string().optional(),
  shippingAddressId: z.string().min(1),
  billingAddressId: z.string().optional(),
});

// Review submission
export const ReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

// Coupon validation
export const CouponSchema = z.object({
  code: z.string().min(1).max(50),
  type: z.enum(['percent', 'flat']),
  value: z.number().positive(),
  minSubtotal: z.number().nonnegative().optional(),
  maxDiscount: z.number().positive().optional(),
  validFrom: z.date(),
  validUntil: z.date(),
  usageLimit: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
});

