/**
 * Razorpay payment webhook handler
 */

import { httpHandler } from '../utils/http';
import { verifyWebhookSignature } from './razorpay';
import { finalizeOrder } from '../orders/finalizeOrder';
import { sendReceipt } from '../email/sendReceipt';
import { unauthorized, badRequest } from '../utils/errors';
import type { Request, Response } from 'express';
import { db } from '../utils/admin';

export const paymentWebhook = httpHandler(
  async (req: Request, _res: Response) => {
    // Verify webhook signature (skip in test mode if no secret configured)
    const { getCONFIG } = await import('../config');
    const config = getCONFIG();
    const signature = req.headers['x-razorpay-signature'] as string;
    
    if (config.razorpay.webhook_secret) {
      // Production mode: verify signature
      if (!signature) {
        throw unauthorized('Missing webhook signature');
      }
      
      const payload = JSON.stringify(req.body);
      if (!verifyWebhookSignature(payload, signature)) {
        throw unauthorized('Invalid webhook signature');
      }
    } else {
      // Test mode: log but don't verify
      console.log('[Webhook] Test mode - skipping signature verification');
    }
    
    const event = req.body;
    
    // Handle payment.captured event
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.notes?.orderId;
      
      if (!orderId) {
        throw badRequest('Order ID not found in payment notes');
      }
      
      // Finalize order
      await finalizeOrder(
        orderId,
        payment.id,
        signature
      );
      
      // Send receipt email
      const orderDoc = await db.collection('orders').doc(orderId).get();
      if (orderDoc.exists) {
        const order = { orderId: orderDoc.id, ...orderDoc.data() };
        try {
          await sendReceipt(order as any);
        } catch (emailError) {
          console.error('Failed to send receipt email:', emailError);
          // Don't fail the webhook if email fails
        }
      }
      
      return { success: true, message: 'Order finalized' };
    }
    
    // Handle other events (payment.failed, etc.)
    if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const orderId = payment.notes?.orderId;
      
      if (orderId) {
        await db.collection('orders').doc(orderId).update({
          paymentStatus: 'failed',
          updatedAt: new Date(),
        });
      }
    }
    
    return { success: true, message: 'Webhook processed' };
  }
);
