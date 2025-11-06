/**
 * Moderate review (admin only)
 */

import { db } from '../utils/admin.js';
import { notFound, badRequest } from '../utils/errors.js';
import { serverTimestamp } from '../utils/admin.js';
import type { Review, Product } from '../types.js';

interface ModerateReviewParams {
  reviewId: string;
  action: 'approve' | 'reject';
}

export async function moderateReview(params: ModerateReviewParams): Promise<void> {
  const reviewRef = db.collection('reviews').doc(params.reviewId);
  const reviewDoc = await reviewRef.get();
  
  if (!reviewDoc.exists) {
    throw notFound('Review not found');
  }
  
  const review = { reviewId: reviewDoc.id, ...reviewDoc.data() } as Review;
  
  if (review.status !== 'pending') {
    throw badRequest('Review has already been moderated');
  }
  
  const newStatus = params.action === 'approve' ? 'approved' : 'rejected';
  
  // Update review status
  await reviewRef.update({
    status: newStatus,
    updatedAt: serverTimestamp() as any,
  });
  
  // Update user mirror
  await db
    .collection('users')
    .doc(review.uid)
    .collection('reviews')
    .doc(params.reviewId)
    .update({
      status: newStatus,
      updatedAt: serverTimestamp() as any,
    });
  
  // If approved, update product rating aggregates
  if (params.action === 'approve') {
    const productRef = db.collection('products').doc(review.productId);
    const productDoc = await productRef.get();
    
    if (productDoc.exists) {
      const product = { productId: productDoc.id, ...productDoc.data() } as Product;
      const currentRatingAvg = product.ratingAvg || 0;
      const currentRatingCount = product.ratingCount || 0;
      
      // Calculate new average
      const newRatingCount = currentRatingCount + 1;
      const newRatingAvg =
        (currentRatingAvg * currentRatingCount + review.rating) / newRatingCount;
      
      await productRef.update({
        ratingAvg: Math.round(newRatingAvg * 10) / 10, // Round to 1 decimal
        ratingCount: newRatingCount,
        updatedAt: serverTimestamp() as any,
      });
    }
  }
}

