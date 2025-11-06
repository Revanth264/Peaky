/**
 * Mirror order to user's orders subcollection
 */

import { db } from '../utils/admin.js';
import { serverTimestamp } from '../utils/admin.js';
import type { Order } from '../types.js';

/**
 * Mirror order summary to user's orders collection
 */
export async function mirrorOrderToUser(order: Order): Promise<void> {
  const userOrderRef = db
    .collection('users')
    .doc(order.uid)
    .collection('orders')
    .doc(order.orderId);
  
  await userOrderRef.set({
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    status: order.status,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    total: order.total,
    itemCount: order.items.length,
    createdAt: order.createdAt,
    updatedAt: serverTimestamp() as any,
  }, { merge: true });
}

