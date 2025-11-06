/**
 * Razorpay client and helpers
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { getCONFIG } from '../config.js';
import { internalError } from '../utils/errors.js';

// Initialize Razorpay client (lazy)
let _razorpay: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!_razorpay) {
    const config = getCONFIG();
    if (!config.razorpay.key_id || !config.razorpay.key_secret) {
      throw new Error('Razorpay credentials not configured');
    }
    _razorpay = new Razorpay({
      key_id: config.razorpay.key_id,
      key_secret: config.razorpay.key_secret,
    });
  }
  return _razorpay;
}

/**
 * Verify Razorpay webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  try {
    const config = getCONFIG();
    const hmac = crypto.createHmac('sha256', config.razorpay.webhook_secret);
    hmac.update(payload);
    const generatedSignature = hmac.digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(generatedSignature)
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Create Razorpay order
 */
export async function createRazorpayOrder(params: {
  amount: number; // in paisa
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<any> {
  try {
    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: params.amount,
      currency: params.currency || 'INR',
      receipt: params.receipt,
      notes: params.notes || {},
    });
    return order;
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    throw internalError(
      `Failed to create Razorpay order: ${error.message || 'Unknown error'}`
    );
  }
}

/**
 * Fetch Razorpay payment
 */
export async function fetchRazorpayPayment(paymentId: string): Promise<any> {
  try {
    const razorpay = getRazorpayClient();
    return await razorpay.payments.fetch(paymentId);
  } catch (error: any) {
    console.error('Razorpay payment fetch error:', error);
    throw internalError(
      `Failed to fetch Razorpay payment: ${error.message || 'Unknown error'}`
    );
  }
}

