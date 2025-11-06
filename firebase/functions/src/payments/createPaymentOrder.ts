/**
 * Create payment order endpoint
 */

import { authenticatedHandler, parseJsonBody } from '../utils/http';
import { createOrder } from '../orders/createOrder';
import { createRazorpayOrder } from './razorpay';
import type { Request, Response } from 'express';
import type admin from 'firebase-admin';

export const createPaymentOrder = authenticatedHandler(
  async (req: Request, _res: Response, authToken: admin.auth.DecodedIdToken) => {
    const body = parseJsonBody<{
      items: Array<{ productId: string; quantity: number }>;
      couponCode?: string;
      shippingAddressId: string;
      billingAddressId?: string;
    }>(req);
    
    // Create order
    const { orderId, orderNumber, razorpayAmount } = await createOrder({
      uid: authToken.uid,
      items: body.items,
      couponCode: body.couponCode,
      shippingAddressId: body.shippingAddressId,
      billingAddressId: body.billingAddressId,
    });
    
    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: razorpayAmount,
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        orderId,
        orderNumber,
        uid: authToken.uid,
      },
    });
    
    // Update order with Razorpay order ID
    const { db } = await import('../utils/admin');
    const { getCONFIG } = await import('../config');
    await db.collection('orders').doc(orderId).update({
      razorpayOrderId: razorpayOrder.id,
    });
    
    return {
      orderId,
      orderNumber,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: getCONFIG().razorpay.key_id, // Frontend needs this for Razorpay Checkout
      amount: razorpayAmount,
    };
  }
);
