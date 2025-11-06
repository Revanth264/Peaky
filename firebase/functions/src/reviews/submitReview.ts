/**
 * Submit review (verified purchase only)
 */

import { db } from '../utils/admin.js';
import { validateReviewSubmission } from '../validators.js';
import { forbidden, badRequest } from '../utils/errors.js';
import { serverTimestamp } from '../utils/admin.js';
import type { Review, Order } from '../types.js';

export async function submitReview(
  uid: string,
  data: { productId: string; rating: number; comment: string }
): Promise<{ reviewId: string }> {
  // Validate review data
  validateReviewSubmission(data);
  
  // Check if user has a paid/delivered order containing this product
  const ordersQuery = await db
    .collection('orders')
    .where('uid', '==', uid)
    .where('paymentStatus', '==', 'paid')
    .where('orderStatus', 'in', ['paid', 'confirmed', 'processing', 'shipped', 'delivered'])
    .get();
  
  let hasPurchased = false;
  for (const orderDoc of ordersQuery.docs) {
    const order = { orderId: orderDoc.id, ...orderDoc.data() } as Order;
    if (order.items.some(item => item.productId === data.productId)) {
      hasPurchased = true;
      break;
    }
  }
  
  if (!hasPurchased) {
    throw forbidden('You can only review products you have purchased');
  }
  
  // Check if user already reviewed this product
  const existingReviewQuery = await db
    .collection('reviews')
    .where('uid', '==', uid)
    .where('productId', '==', data.productId)
    .limit(1)
    .get();
  
  if (!existingReviewQuery.empty) {
    throw badRequest('You have already reviewed this product');
  }
  
  // Create review
  const reviewRef = db.collection('reviews').doc();
  const review: Omit<Review, 'reviewId'> = {
    productId: data.productId,
    uid,
    rating: data.rating,
    comment: data.comment,
    status: 'pending',
    createdAt: serverTimestamp() as any,
  };
  
  await reviewRef.set(review);
  
  // Mirror to user's reviews
  await db
    .collection('users')
    .doc(uid)
    .collection('reviews')
    .doc(reviewRef.id)
    .set({
      reviewId: reviewRef.id,
      productId: data.productId,
      rating: data.rating,
      status: 'pending',
      createdAt: serverTimestamp() as any,
    });
  
  return { reviewId: reviewRef.id };
}

