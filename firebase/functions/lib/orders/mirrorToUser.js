"use strict";
/**
 * Mirror order to user's orders subcollection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mirrorOrderToUser = mirrorOrderToUser;
const admin_js_1 = require("../utils/admin.js");
const admin_js_2 = require("../utils/admin.js");
/**
 * Mirror order summary to user's orders collection
 */
async function mirrorOrderToUser(order) {
    const userOrderRef = admin_js_1.db
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
        updatedAt: (0, admin_js_2.serverTimestamp)(),
    }, { merge: true });
}
//# sourceMappingURL=mirrorToUser.js.map