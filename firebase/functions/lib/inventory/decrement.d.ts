/**
 * Decrement inventory after payment (transaction-safe)
 */
interface DecrementItem {
    productId: string;
    quantity: number;
    reserved: number;
}
/**
 * Decrement inventory and release reservation (transaction)
 */
export declare function decrementInventory(items: DecrementItem[]): Promise<void>;
export {};
//# sourceMappingURL=decrement.d.ts.map