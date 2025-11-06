"use strict";
/**
 * Submit review (verified purchase only)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitReview = submitReview;
const admin_js_1 = require("../utils/admin.js");
const validators_js_1 = require("../validators.js");
const errors_js_1 = require("../utils/errors.js");
const admin_js_2 = require("../utils/admin.js");
async function submitReview(uid, data) {
    // Validate review data
    (0, validators_js_1.validateReviewSubmission)(data);
    // Check if user has a paid/delivered order containing this product
    const ordersQuery = await admin_js_1.db
        .collection('orders')
        .where('uid', '==', uid)
        .where('paymentStatus', '==', 'paid')
        .where('orderStatus', 'in', ['paid', 'confirmed', 'processing', 'shipped', 'delivered'])
        .get();
    let hasPurchased = false;
    for (const orderDoc of ordersQuery.docs) {
        const order = { orderId: orderDoc.id, ...orderDoc.data() };
        if (order.items.some(item => item.productId === data.productId)) {
            hasPurchased = true;
            break;
        }
    }
    if (!hasPurchased) {
        throw (0, errors_js_1.forbidden)('You can only review products you have purchased');
    }
    // Check if user already reviewed this product
    const existingReviewQuery = await admin_js_1.db
        .collection('reviews')
        .where('uid', '==', uid)
        .where('productId', '==', data.productId)
        .limit(1)
        .get();
    if (!existingReviewQuery.empty) {
        throw (0, errors_js_1.badRequest)('You have already reviewed this product');
    }
    // Create review
    const reviewRef = admin_js_1.db.collection('reviews').doc();
    const review = {
        productId: data.productId,
        uid,
        rating: data.rating,
        comment: data.comment,
        status: 'pending',
        createdAt: (0, admin_js_2.serverTimestamp)(),
    };
    await reviewRef.set(review);
    // Mirror to user's reviews
    await admin_js_1.db
        .collection('users')
        .doc(uid)
        .collection('reviews')
        .doc(reviewRef.id)
        .set({
        reviewId: reviewRef.id,
        productId: data.productId,
        rating: data.rating,
        status: 'pending',
        createdAt: (0, admin_js_2.serverTimestamp)(),
    });
    return { reviewId: reviewRef.id };
}
//# sourceMappingURL=submitReview.js.map