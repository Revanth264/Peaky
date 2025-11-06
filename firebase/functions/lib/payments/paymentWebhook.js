"use strict";
/**
 * Razorpay payment webhook handler
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
exports.paymentWebhook = void 0;
const http_1 = require("../utils/http");
const razorpay_1 = require("./razorpay");
const finalizeOrder_1 = require("../orders/finalizeOrder");
const sendReceipt_1 = require("../email/sendReceipt");
const errors_1 = require("../utils/errors");
const admin_1 = require("../utils/admin");
exports.paymentWebhook = (0, http_1.httpHandler)(async (req, _res) => {
    // Verify webhook signature (skip in test mode if no secret configured)
    const { getCONFIG } = await Promise.resolve().then(() => __importStar(require('../config')));
    const config = getCONFIG();
    const signature = req.headers['x-razorpay-signature'];
    if (config.razorpay.webhook_secret) {
        // Production mode: verify signature
        if (!signature) {
            throw (0, errors_1.unauthorized)('Missing webhook signature');
        }
        const payload = JSON.stringify(req.body);
        if (!(0, razorpay_1.verifyWebhookSignature)(payload, signature)) {
            throw (0, errors_1.unauthorized)('Invalid webhook signature');
        }
    }
    else {
        // Test mode: log but don't verify
        console.log('[Webhook] Test mode - skipping signature verification');
    }
    const event = req.body;
    // Handle payment.captured event
    if (event.event === 'payment.captured') {
        const payment = event.payload.payment.entity;
        const orderId = payment.notes?.orderId;
        if (!orderId) {
            throw (0, errors_1.badRequest)('Order ID not found in payment notes');
        }
        // Finalize order
        await (0, finalizeOrder_1.finalizeOrder)(orderId, payment.id, signature);
        // Send receipt email
        const orderDoc = await admin_1.db.collection('orders').doc(orderId).get();
        if (orderDoc.exists) {
            const order = { orderId: orderDoc.id, ...orderDoc.data() };
            try {
                await (0, sendReceipt_1.sendReceipt)(order);
            }
            catch (emailError) {
                console.error('Failed to send receipt email:', emailError);
                // Don't fail the webhook if email fails
            }
        }
        return { success: true, message: 'Order finalized' };
    }
    // Handle other events (payment.failed, etc.)
    if (event.event === 'payment.failed') {
        const payment = event.payload.payment.entity;
        const orderId = payment.notes?.orderId;
        if (orderId) {
            await admin_1.db.collection('orders').doc(orderId).update({
                paymentStatus: 'failed',
                updatedAt: new Date(),
            });
        }
    }
    return { success: true, message: 'Webhook processed' };
});
//# sourceMappingURL=paymentWebhook.js.map