/**
 * Rebuild materialized metrics (scheduled cron)
 */

import { db } from '../utils/admin.js';
import { serverTimestamp } from '../utils/admin.js';
import type { Event, Product, MaterializedList } from '../types.js';

/**
 * Rebuild all materialized lists
 */
export async function rebuildMetrics(): Promise<void> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Get all purchase events from last 7 days
  const purchaseEventsQuery = await db
    .collection('events')
    .where('type', '==', 'purchase')
    .where('ts', '>=', sevenDaysAgo)
    .get();
  
  // Get all purchase events from last 30 days
  const purchaseEvents30Query = await db
    .collection('events')
    .where('type', '==', 'purchase')
    .where('ts', '>=', thirtyDaysAgo)
    .get();
  
  // Count sales per product (last 7 days)
  const salesLast7 = new Map<string, number>();
  purchaseEventsQuery.docs.forEach(doc => {
    const event = doc.data() as Event;
    salesLast7.set(event.productId, (salesLast7.get(event.productId) || 0) + 1);
  });
  
  // Count sales per product (last 30 days)
  const salesLast30 = new Map<string, number>();
  purchaseEvents30Query.docs.forEach(doc => {
    const event = doc.data() as Event;
    salesLast30.set(event.productId, (salesLast30.get(event.productId) || 0) + 1);
  });
  
  // Get all products
  const productsSnapshot = await db.collection('products').get();
  const products = productsSnapshot.docs.map(doc => ({
    productId: doc.id,
    ...doc.data(),
  })) as Product[];
  
  // Update product metrics
  const batch = db.batch();
  for (const product of products) {
    const productRef = db.collection('products').doc(product.productId);
    batch.update(productRef, {
      salesLast7: salesLast7.get(product.productId) || 0,
      salesLast30: salesLast30.get(product.productId) || 0,
      updatedAt: serverTimestamp() as any,
    });
  }
  await batch.commit();
  
  // Build best sellers (top 20 by salesLast7)
  const bestSellers = products
    .sort((a, b) => (b.salesLast7 || 0) - (a.salesLast7 || 0))
    .slice(0, 20)
    .map(p => p.productId);
  
  // Build new arrivals (top 20 by createdAt, last 30 days)
  const newArrivals = products
    .filter(p => {
      const createdAt = p.createdAt instanceof Date ? p.createdAt : p.createdAt.toDate();
      return createdAt >= thirtyDaysAgo;
    })
    .sort((a, b) => {
      const aDate = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
      const bDate = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
      return bDate.getTime() - aDate.getTime();
    })
    .slice(0, 20)
    .map(p => p.productId);
  
  // Build sale offers (top 20 by discount percentage)
  const saleOffers = products
    .filter(p => p.discountPrice && p.discountPrice < p.price)
    .sort((a, b) => {
      const aDiscount = ((a.price - (a.discountPrice || a.price)) / a.price) * 100;
      const bDiscount = ((b.price - (b.discountPrice || b.price)) / b.price) * 100;
      return bDiscount - aDiscount;
    })
    .slice(0, 20)
    .map(p => p.productId);
  
  // Build limited edition (top 20 by likes)
  const limitedEdition = products
    .filter(p => p.isLimited)
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 20)
    .map(p => p.productId);
  
  // Write materialized lists
  const materializedLists = {
    bestSellers,
    newArrivals,
    saleOffers,
    limitedEdition,
  };
  
  for (const [listName, ids] of Object.entries(materializedLists)) {
    const listRef = db.collection('materialized').doc('home').collection(listName).doc('current');
    const list: MaterializedList = {
      ids,
      updatedAt: serverTimestamp() as any,
    };
    await listRef.set(list);
  }
  
  console.log('Metrics rebuilt:', {
    bestSellers: bestSellers.length,
    newArrivals: newArrivals.length,
    saleOffers: saleOffers.length,
    limitedEdition: limitedEdition.length,
  });
}

