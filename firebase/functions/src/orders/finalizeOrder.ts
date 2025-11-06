/**
 * Finalize order after payment
 */

import { db } from '../utils/admin.js';
import { notFound } from '../utils/errors.js';
import { decrementInventory } from '../inventory/decrement.js';
import { mirrorOrderToUser } from './mirrorToUser.js';
import { serverTimestamp } from '../utils/admin.js';
import type { Order } from '../types.js';

/**
 * Finalize order: mark as paid, decrement inventory, mirror to user
 */
export async function finalizeOrder(
  orderId: string,
  razorpayPaymentId: string,
  razorpaySignature?: string
): Promise<void> {
  const orderRef = db.collection('orders').doc(orderId);
  const orderDoc = await orderRef.get();
  
  if (!orderDoc.exists) {
    throw notFound('Order not found');
  }
  
  const order = { orderId: orderDoc.id, ...orderDoc.data() } as Order;
  
  if (order.paymentStatus === 'paid') {
    console.log(`Order ${orderId} already finalized`);
    return;
  }
  
  // Update order status
  await orderRef.update({
    paymentStatus: 'paid',
    orderStatus: 'paid',
    status: 'paid',
    razorpayPaymentId,
    razorpaySignature,
    updatedAt: serverTimestamp() as any,
  });
  
  // Decrement inventory
  await decrementInventory(
    order.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      reserved: item.quantity, // Assume all reserved quantity was used
    }))
  );
  
  // Mirror to user
  await mirrorOrderToUser({
    ...order,
    paymentStatus: 'paid',
    orderStatus: 'paid',
    status: 'paid',
    razorpayPaymentId,
    razorpaySignature,
  });
  
  // Log purchase event for metrics
  for (const item of order.items) {
    await db.collection('events').add({
      type: 'purchase',
      productId: item.productId,
      uid: order.uid,
      ts: serverTimestamp() as any,
    });
  }
}

