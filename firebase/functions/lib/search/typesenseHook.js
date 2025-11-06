"use strict";
/**
 * Typesense search index hook (stub - no-op if keys missing)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexProduct = indexProduct;
exports.removeProductFromIndex = removeProductFromIndex;
const config_js_1 = require("../config.js");
/**
 * Index product in Typesense (no-op if not configured)
 */
async function indexProduct(_product) {
    if (!(0, config_js_1.isTypesenseConfigured)()) {
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
async function removeProductFromIndex(_productId) {
    if (!(0, config_js_1.isTypesenseConfigured)()) {
        return;
    }
    // TODO: Implement Typesense deletion
    console.log('Typesense deletion would happen (integration TODO)');
}
//# sourceMappingURL=typesenseHook.js.map