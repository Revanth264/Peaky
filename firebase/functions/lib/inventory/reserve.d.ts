/**
 * Reserve inventory items (transaction-safe)
 */
interface ReserveItem {
    productId: string;
    quantity: number;
}
/**
 * Reserve inventory for multiple products (transaction)
 * Returns true if all items can be reserved, false otherwise
 */
export declare function reserveInventory(items: ReserveItem[]): Promise<{
    success: boolean;
    reserved: Map<string, number>;
}>;
export {};
//# sourceMappingURL=reserve.d.ts.map