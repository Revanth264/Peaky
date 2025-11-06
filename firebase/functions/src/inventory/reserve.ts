/**
 * Reserve inventory items (transaction-safe)
 */

import { db } from '../utils/admin.js';
import { badRequest, conflict } from '../utils/errors.js';
import type { Inventory } from '../types.js';
import { serverTimestamp } from '../utils/admin.js';

interface ReserveItem {
  productId: string;
  quantity: number;
}

/**
 * Reserve inventory for multiple products (transaction)
 * Returns true if all items can be reserved, false otherwise
 */
export async function reserveInventory(
  items: ReserveItem[]
): Promise<{ success: boolean; reserved: Map<string, number> }> {
  const reserved = new Map<string, number>();
  
  try {
    await db.runTransaction(async (transaction) => {
      // Check and reserve each item
      for (const item of items) {
        const invRef = db.collection('inventory').doc(item.productId);
        const invDoc = await transaction.get(invRef);
        
        if (!invDoc.exists) {
          throw badRequest(`Product ${item.productId} not found in inventory`);
        }
        
        const inv = invDoc.data() as Inventory;
        const available = inv.stock - inv.reserved;
        
        if (available < item.quantity) {
          throw conflict(
            `Insufficient stock for product ${item.productId}. Available: ${available}, Requested: ${item.quantity}`
          );
        }
        
        // Reserve the quantity
        transaction.update(invRef, {
          reserved: (inv.reserved || 0) + item.quantity,
          updatedAt: serverTimestamp(),
        });
        
        reserved.set(item.productId, item.quantity);
      }
    });
    
    return { success: true, reserved };
  } catch (error: any) {
    // If reservation failed, return failure
    if (error.code === 'CONFLICT' || error.code === 'BAD_REQUEST') {
      return { success: false, reserved };
    }
    throw error;
  }
}

