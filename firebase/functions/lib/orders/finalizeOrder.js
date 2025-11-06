"use strict";
/**
 * Finalize order after payment
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalizeOrder = finalizeOrder;
const admin_js_1 = require("../utils/admin.js");
const errors_js_1 = require("../utils/errors.js");
const decrement_js_1 = require("../inventory/decrement.js");
const mirrorToUser_js_1 = require("./mirrorToUser.js");
const admin_js_2 = require("../utils/admin.js");
/**
 * Finalize order: mark as paid, decrement inventory, mirror to user
 */
async function finalizeOrder(orderId, razorpayPaymentId, razorpaySignature) {
    const orderRef = admin_js_1.db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) {
        throw (0, errors_js_1.notFound)('Order not found');
    }
    const order = { orderId: orderDoc.id, ...orderDoc.data() };
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
        updatedAt: (0, admin_js_2.serverTimestamp)(),
    });
    // Decrement inventory
    await (0, decrement_js_1.decrementInventory)(order.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        reserved: item.quantity, // Assume all reserved quantity was used
    })));
    // Mirror to user
    await (0, mirrorToUser_js_1.mirrorOrderToUser)({
        ...order,
        paymentStatus: 'paid',
        orderStatus: 'paid',
        status: 'paid',
        razorpayPaymentId,
        razorpaySignature,
    });
    // Log purchase event for metrics
    for (const item of order.items) {
        await admin_js_1.db.collection('events').add({
            type: 'purchase',
            productId: item.productId,
            uid: order.uid,
            ts: (0, admin_js_2.serverTimestamp)(),
        });
    }
}
//# sourceMappingURL=finalizeOrder.js.map