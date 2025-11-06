"use strict";
/**
 * Create order with stock validation and pricing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
const admin_js_1 = require("../utils/admin.js");
const errors_js_1 = require("../utils/errors.js");
const reserve_js_1 = require("../inventory/reserve.js");
const firestore_js_1 = require("../utils/firestore.js");
const validators_js_1 = require("../validators.js");
async function createOrder(params) {
    // Validate request
    (0, validators_js_1.validateCreateOrderRequest)(params);
    // Fetch shipping address
    const shippingAddrRef = admin_js_1.db
        .collection('users')
        .doc(params.uid)
        .collection('addresses')
        .doc(params.shippingAddressId);
    const shippingAddrDoc = await shippingAddrRef.get();
    if (!shippingAddrDoc.exists) {
        throw (0, errors_js_1.notFound)('Shipping address not found');
    }
    const shippingAddress = { id: shippingAddrDoc.id, ...shippingAddrDoc.data() };
    // Fetch billing address (or use shipping)
    let billingAddress = shippingAddress;
    if (params.billingAddressId && params.billingAddressId !== params.shippingAddressId) {
        const billingAddrRef = admin_js_1.db
            .collection('users')
            .doc(params.uid)
            .collection('addresses')
            .doc(params.billingAddressId);
        const billingAddrDoc = await billingAddrRef.get();
        if (billingAddrDoc.exists) {
            billingAddress = { id: billingAddrDoc.id, ...billingAddrDoc.data() };
        }
    }
    // Fetch products and calculate pricing
    const productRefs = params.items.map(item => admin_js_1.db.collection('products').doc(item.productId));
    const productDocs = await admin_js_1.db.getAll(...productRefs);
    const orderItems = [];
    let subtotal = 0;
    for (let i = 0; i < params.items.length; i++) {
        const item = params.items[i];
        const productDoc = productDocs[i];
        if (!productDoc.exists) {
            throw (0, errors_js_1.notFound)(`Product ${item.productId} not found`);
        }
        const product = { productId: productDoc.id, ...productDoc.data() };
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
    let coupon = null;
    if (params.couponCode) {
        const couponDoc = await admin_js_1.db.collection('coupons').doc(params.couponCode.toUpperCase()).get();
        if (!couponDoc.exists) {
            throw (0, errors_js_1.notFound)('Coupon not found');
        }
        coupon = { code: couponDoc.id, ...couponDoc.data() };
        const now = new Date();
        const validFrom = coupon.validFrom instanceof Date ? coupon.validFrom : coupon.validFrom.toDate();
        const validUntil = coupon.validUntil instanceof Date ? coupon.validUntil : coupon.validUntil.toDate();
        if (!coupon.isActive || now < validFrom || now > validUntil) {
            throw (0, errors_js_1.badRequest)('Coupon is not valid');
        }
        if (coupon.usageLimit && (coupon.usageCount || 0) >= coupon.usageLimit) {
            throw (0, errors_js_1.badRequest)('Coupon usage limit reached');
        }
        if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
            throw (0, errors_js_1.badRequest)(`Minimum subtotal of ₹${coupon.minSubtotal} required for this coupon`);
        }
        // Calculate discount
        if (coupon.type === 'percent') {
            discount = (subtotal * coupon.value) / 100;
            if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount);
            }
        }
        else {
            discount = coupon.value;
        }
        discount = Math.min(discount, subtotal);
    }
    // Calculate totals
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
    const tax = (subtotal - discount) * 0.18; // 18% GST
    const total = subtotal - discount + shipping + tax;
    // Reserve inventory
    const reserveResult = await (0, reserve_js_1.reserveInventory)(params.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
    })));
    if (!reserveResult.success) {
        throw (0, errors_js_1.conflict)('Inventory reservation failed');
    }
    // Generate order number
    const orderNumber = (0, firestore_js_1.generateOrderNumber)();
    const orderId = admin_js_1.db.collection('orders').doc().id;
    // Create order document
    const order = {
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
        createdAt: (0, admin_js_1.serverTimestamp)(),
    };
    await admin_js_1.db.collection('orders').doc(orderId).set(order);
    // Mirror to user
    await admin_js_1.db
        .collection('users')
        .doc(params.uid)
        .collection('orders')
        .doc(orderId)
        .set({
        orderId,
        orderNumber,
        status: 'created',
        total,
        createdAt: (0, admin_js_1.serverTimestamp)(),
    });
    // Increment coupon usage if applied
    if (coupon) {
        await admin_js_1.db.collection('coupons').doc(coupon.code).update({
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
//# sourceMappingURL=createOrder.js.map