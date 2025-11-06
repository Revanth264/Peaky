/**
 * Typesense search index hook (stub - no-op if keys missing)
 */

import { isTypesenseConfigured } from '../config.js';
import type { Product } from '../types.js';

/**
 * Index product in Typesense (no-op if not configured)
 */
export async function indexProduct(_product: Product): Promise<void> {
  if (!isTypesenseConfigured()) {
    console.log('Typesense not configured, skipping product index');
    return;
  }
  
  // TODO: Implement Typesense indexing
  // const Typesense = require('typesense');
  // const client = new Typesense.Client({
  //   nodes: [{
  //     host: CONFIG.typesense.host!,
  //     port: parseInt(CONFIG.typesense.port!),
  //     protocol: CONFIG.typesense.protocol!,
  //   }],
  //   apiKey: CONFIG.typesense.api_key!,
  // });
  // 
  // await client.collections('products').documents().upsert({
  //   id: product.productId,
  //   name: product.name,
  //   description: product.description,
  //   price: product.price,
  //   category: product.category,
  //   tags: product.tags,
  // });
  
  console.log('Typesense indexing would happen (integration TODO)');
}

/**
 * Remove product from Typesense index
 */
export async function removeProductFromIndex(_productId: string): Promise<void> {
  if (!isTypesenseConfigured()) {
    return;
  }
  
  // TODO: Implement Typesense deletion
  console.log('Typesense deletion would happen (integration TODO)');
}

