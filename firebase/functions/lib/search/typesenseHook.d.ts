/**
 * Typesense search index hook (stub - no-op if keys missing)
 */
import type { Product } from '../types.js';
/**
 * Index product in Typesense (no-op if not configured)
 */
export declare function indexProduct(_product: Product): Promise<void>;
/**
 * Remove product from Typesense index
 */
export declare function removeProductFromIndex(_productId: string): Promise<void>;
//# sourceMappingURL=typesenseHook.d.ts.map