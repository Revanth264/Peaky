"use strict";
/**
 * Reserve inventory items (transaction-safe)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.reserveInventory = reserveInventory;
const admin_js_1 = require("../utils/admin.js");
const errors_js_1 = require("../utils/errors.js");
const admin_js_2 = require("../utils/admin.js");
/**
 * Reserve inventory for multiple products (transaction)
 * Returns true if all items can be reserved, false otherwise
 */
async function reserveInventory(items) {
    const reserved = new Map();
    try {
        await admin_js_1.db.runTransaction(async (transaction) => {
            // Check and reserve each item
            for (const item of items) {
                const invRef = admin_js_1.db.collection('inventory').doc(item.productId);
                const invDoc = await transaction.get(invRef);
                if (!invDoc.exists) {
                    throw (0, errors_js_1.badRequest)(`Product ${item.productId} not found in inventory`);
                }
                const inv = invDoc.data();
                const available = inv.stock - inv.reserved;
                if (available < item.quantity) {
                    throw (0, errors_js_1.conflict)(`Insufficient stock for product ${item.productId}. Available: ${available}, Requested: ${item.quantity}`);
                }
                // Reserve the quantity
                transaction.update(invRef, {
                    reserved: (inv.reserved || 0) + item.quantity,
                    updatedAt: (0, admin_js_2.serverTimestamp)(),
                });
                reserved.set(item.productId, item.quantity);
            }
        });
        return { success: true, reserved };
    }
    catch (error) {
        // If reservation failed, return failure
        if (error.code === 'CONFLICT' || error.code === 'BAD_REQUEST') {
            return { success: false, reserved };
        }
        throw error;
    }
}
//# sourceMappingURL=reserve.js.map