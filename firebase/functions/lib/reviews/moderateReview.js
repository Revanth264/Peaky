"use strict";
/**
 * Moderate review (admin only)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderateReview = moderateReview;
const admin_js_1 = require("../utils/admin.js");
const errors_js_1 = require("../utils/errors.js");
const admin_js_2 = require("../utils/admin.js");
async function moderateReview(params) {
    const reviewRef = admin_js_1.db.collection('reviews').doc(params.reviewId);
    const reviewDoc = await reviewRef.get();
    if (!reviewDoc.exists) {
        throw (0, errors_js_1.notFound)('Review not found');
    }
    const review = { reviewId: reviewDoc.id, ...reviewDoc.data() };
    if (review.status !== 'pending') {
        throw (0, errors_js_1.badRequest)('Review has already been moderated');
    }
    const newStatus = params.action === 'approve' ? 'approved' : 'rejected';
    // Update review status
    await reviewRef.update({
        status: newStatus,
        updatedAt: (0, admin_js_2.serverTimestamp)(),
    });
    // Update user mirror
    await admin_js_1.db
        .collection('users')
        .doc(review.uid)
        .collection('reviews')
        .doc(params.reviewId)
        .update({
        status: newStatus,
        updatedAt: (0, admin_js_2.serverTimestamp)(),
    });
    // If approved, update product rating aggregates
    if (params.action === 'approve') {
        const productRef = admin_js_1.db.collection('products').doc(review.productId);
        const productDoc = await productRef.get();
        if (productDoc.exists) {
            const product = { productId: productDoc.id, ...productDoc.data() };
            const currentRatingAvg = product.ratingAvg || 0;
            const currentRatingCount = product.ratingCount || 0;
            // Calculate new average
            const newRatingCount = currentRatingCount + 1;
            const newRatingAvg = (currentRatingAvg * currentRatingCount + review.rating) / newRatingCount;
            await productRef.update({
                ratingAvg: Math.round(newRatingAvg * 10) / 10, // Round to 1 decimal
                ratingCount: newRatingCount,
                updatedAt: (0, admin_js_2.serverTimestamp)(),
            });
        }
    }
}
//# sourceMappingURL=moderateReview.js.map