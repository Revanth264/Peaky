"use strict";
/**
 * Decrement inventory after payment (transaction-safe)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrementInventory = decrementInventory;
const admin_js_1 = require("../utils/admin.js");
const errors_js_1 = require("../utils/errors.js");
const admin_js_2 = require("../utils/admin.js");
/**
 * Decrement inventory and release reservation (transaction)
 */
async function decrementInventory(items) {
    await admin_js_1.db.runTransaction(async (transaction) => {
        for (const item of items) {
            const invRef = admin_js_1.db.collection('inventory').doc(item.productId);
            const invDoc = await transaction.get(invRef);
            if (!invDoc.exists) {
                throw (0, errors_js_1.badRequest)(`Product ${item.productId} not found in inventory`);
            }
            const inv = invDoc.data();
            if (!inv) {
                throw (0, errors_js_1.badRequest)(`Product ${item.productId} inventory data not found`);
            }
            const currentStock = inv.stock || 0;
            const currentReserved = inv.reserved || 0;
            // Validate reserved amount matches
            if (currentReserved < item.reserved) {
                throw new Error(`Reserved amount mismatch for product ${item.productId}`);
            }
            // Decrement stock and release reservation
            const newStock = currentStock - item.quantity;
            const newReserved = currentReserved - item.reserved;
            if (newStock < 0) {
                throw new Error(`Stock would go negative for product ${item.productId}`);
            }
            transaction.update(invRef, {
                stock: newStock,
                reserved: newReserved,
                updatedAt: (0, admin_js_2.serverTimestamp)(),
            });
        }
    });
}
//# sourceMappingURL=decrement.js.map