"use strict";
/**
 * Create payment order endpoint
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentOrder = void 0;
const http_1 = require("../utils/http");
const createOrder_1 = require("../orders/createOrder");
const razorpay_1 = require("./razorpay");
exports.createPaymentOrder = (0, http_1.authenticatedHandler)(async (req, _res, authToken) => {
    const body = (0, http_1.parseJsonBody)(req);
    // Create order
    const { orderId, orderNumber, razorpayAmount } = await (0, createOrder_1.createOrder)({
        uid: authToken.uid,
        items: body.items,
        couponCode: body.couponCode,
        shippingAddressId: body.shippingAddressId,
        billingAddressId: body.billingAddressId,
    });
    // Create Razorpay order
    const razorpayOrder = await (0, razorpay_1.createRazorpayOrder)({
        amount: razorpayAmount,
        currency: 'INR',
        receipt: orderNumber,
        notes: {
            orderId,
            orderNumber,
            uid: authToken.uid,
        },
    });
    // Update order with Razorpay order ID
    const { db } = await Promise.resolve().then(() => __importStar(require('../utils/admin')));
    const { getCONFIG } = await Promise.resolve().then(() => __importStar(require('../config')));
    await db.collection('orders').doc(orderId).update({
        razorpayOrderId: razorpayOrder.id,
    });
    return {
        orderId,
        orderNumber,
        razorpayOrderId: razorpayOrder.id,
        razorpayKeyId: getCONFIG().razorpay.key_id, // Frontend needs this for Razorpay Checkout
        amount: razorpayAmount,
    };
});
//# sourceMappingURL=createPaymentOrder.js.map