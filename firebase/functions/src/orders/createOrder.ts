/**
 * Create order with stock validation and pricing
 */

import { db, serverTimestamp } from '../utils/admin.js';
import { badRequest, notFound, conflict } from '../utils/errors.js';
import { reserveInventory } from '../inventory/reserve.js';
import { generateOrderNumber } from '../utils/firestore.js';
import type { Order, Product, Address, Coupon, OrderItem } from '../types.js';
import { validateCreateOrderRequest } from '../validators.js';

interface CreateOrderParams {
  uid: string;
  items: Array<{ productId: string; quantity: number }>;
  couponCode?: string;
  shippingAddressId: string;
  billingAddressId?: string;
}

export async function createOrder(params: CreateOrderParams): Promise<{
  orderId: string;
  orderNumber: string;
  total: number;
  razorpayAmount: number; // in paisa
}> {
  // Validate request
  validateCreateOrderRequest(params);
  
  // Fetch shipping address
  const shippingAddrRef = db
    .collection('users')
    .doc(params.uid)
    .collection('addresses')
    .doc(params.shippingAddressId);
  const shippingAddrDoc = await shippingAddrRef.get();
  
  if (!shippingAddrDoc.exists) {
    throw notFound('Shipping address not found');
  }
  const shippingAddress = { id: shippingAddrDoc.id, ...shippingAddrDoc.data() } as Address;
  
  // Fetch billing address (or use shipping)
  let billingAddress = shippingAddress;
  if (params.billingAddressId && params.billingAddressId !== params.shippingAddressId) {
    const billingAddrRef = db
      .collection('users')
      .doc(params.uid)
      .collection('addresses')
      .doc(params.billingAddressId);
    const billingAddrDoc = await billingAddrRef.get();
    if (billingAddrDoc.exists) {
      billingAddress = { id: billingAddrDoc.id, ...billingAddrDoc.data() } as Address;
    }
  }
  
  // Fetch products and calculate pricing
  const productRefs = params.items.map(item =>
    db.collection('products').doc(item.productId)
  );
  const productDocs = await db.getAll(...productRefs);
  
  const orderItems: OrderItem[] = [];
  let subtotal = 0;
  
  for (let i = 0; i < params.items.length; i++) {
    const item = params.items[i];
    const productDoc = productDocs[i];
    
    if (!productDoc.exists) {
      throw notFound(`Product ${item.productId} not found`);
    }
    
    const product = { productId: productDoc.id, ...productDoc.data() } as Product;
    const price = product.discountPrice || product.price;
    const itemTotal = price * item.quantity;
    subtotal += itemTotal;
    
    orderItems.push({
      productId: product.productId,
      name: product.name,
      price,
      quantity: item.quantity,
      image: product.images?.[0],
    });
  }
  
  // Apply coupon if provided
  let discount = 0;
  let coupon: Coupon | null = null;
  
  if (params.couponCode) {
    const couponDoc = await db.collection('coupons').doc(params.couponCode.toUpperCase()).get();
    if (!couponDoc.exists) {
      throw notFound('Coupon not found');
    }
    
    coupon = { code: couponDoc.id, ...couponDoc.data() } as Coupon;
    const now = new Date();
    const validFrom = coupon.validFrom instanceof Date ? coupon.validFrom : coupon.validFrom.toDate();
    const validUntil = coupon.validUntil instanceof Date ? coupon.validUntil : coupon.validUntil.toDate();
    
    if (!coupon.isActive || now < validFrom || now > validUntil) {
      throw badRequest('Coupon is not valid');
    }
    
    if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
      throw badRequest('Coupon usage limit reached');
    }
    
    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
      throw badRequest(`Minimum subtotal of ₹${coupon.minSubtotal} required for this coupon`);
    }
    
    // Calculate discount
    if (coupon.type === 'percent') {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.value;
    }
    
    discount = Math.min(discount, subtotal);
  }
  
  // Calculate totals
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
  const tax = (subtotal - discount) * 0.18; // 18% GST
  const total = subtotal - discount + shipping + tax;
  
  // Reserve inventory
  const reserveResult = await reserveInventory(
    params.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    }))
  );
  
  if (!reserveResult.success) {
    throw conflict('Inventory reservation failed');
  }
  
  // Generate order number
  const orderNumber = generateOrderNumber();
  const orderId = db.collection('orders').doc().id;
  
  // Create order document
  const order: Omit<Order, 'orderId'> = {
    uid: params.uid,
    orderNumber,
    items: orderItems,
    shippingAddress,
    billingAddress,
    subtotal,
    shipping,
    tax,
    discount,
    total,
    couponCode: params.couponCode,
    paymentMethod: 'razorpay',
    paymentStatus: 'pending',
    orderStatus: 'created',
    status: 'created',
    createdAt: serverTimestamp() as any,
  };
  
  await db.collection('orders').doc(orderId).set(order);
  
  // Mirror to user
  await db
    .collection('users')
    .doc(params.uid)
    .collection('orders')
    .doc(orderId)
    .set({
      orderId,
      orderNumber,
      status: 'created',
      total,
      createdAt: serverTimestamp() as any,
    });
  
  // Increment coupon usage if applied
  if (coupon) {
    await db.collection('coupons').doc(coupon.code).update({
      usageCount: (coupon.usageCount || 0) + 1,
    });
  }
  
  return {
    orderId,
    orderNumber,
    total,
    razorpayAmount: Math.round(total * 100), // Convert to paisa
  };
}

