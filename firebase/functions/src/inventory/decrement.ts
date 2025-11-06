/**
 * Decrement inventory after payment (transaction-safe)
 */

import { db } from '../utils/admin.js';
import { badRequest } from '../utils/errors.js';
import { serverTimestamp } from '../utils/admin.js';

interface DecrementItem {
  productId: string;
  quantity: number;
  reserved: number; // Amount that was reserved
}

/**
 * Decrement inventory and release reservation (transaction)
 */
export async function decrementInventory(
  items: DecrementItem[]
): Promise<void> {
  await db.runTransaction(async (transaction) => {
    for (const item of items) {
      const invRef = db.collection('inventory').doc(item.productId);
      const invDoc = await transaction.get(invRef);
      
      if (!invDoc.exists) {
        throw badRequest(`Product ${item.productId} not found in inventory`);
      }
      
      const inv = invDoc.data();
      if (!inv) {
        throw badRequest(`Product ${item.productId} inventory data not found`);
      }
      const currentStock = inv.stock || 0;
      const currentReserved = inv.reserved || 0;
      
      // Validate reserved amount matches
      if (currentReserved < item.reserved) {
        throw new Error(
          `Reserved amount mismatch for product ${item.productId}`
        );
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
        updatedAt: serverTimestamp(),
      });
    }
  });
}

