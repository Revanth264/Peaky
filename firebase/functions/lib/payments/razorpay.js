"use strict";
/**
 * Razorpay client and helpers
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRazorpayClient = getRazorpayClient;
exports.verifyWebhookSignature = verifyWebhookSignature;
exports.createRazorpayOrder = createRazorpayOrder;
exports.fetchRazorpayPayment = fetchRazorpayPayment;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const config_js_1 = require("../config.js");
const errors_js_1 = require("../utils/errors.js");
// Initialize Razorpay client (lazy)
let _razorpay = null;
function getRazorpayClient() {
    if (!_razorpay) {
        const config = (0, config_js_1.getCONFIG)();
        if (!config.razorpay.key_id || !config.razorpay.key_secret) {
            throw new Error('Razorpay credentials not configured');
        }
        _razorpay = new razorpay_1.default({
            key_id: config.razorpay.key_id,
            key_secret: config.razorpay.key_secret,
        });
    }
    return _razorpay;
}
/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(payload, signature) {
    try {
        const config = (0, config_js_1.getCONFIG)();
        const hmac = crypto_1.default.createHmac('sha256', config.razorpay.webhook_secret);
        hmac.update(payload);
        const generatedSignature = hmac.digest('hex');
        return crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(generatedSignature));
    }
    catch (error) {
        console.error('Webhook signature verification error:', error);
        return false;
    }
}
/**
 * Create Razorpay order
 */
async function createRazorpayOrder(params) {
    try {
        const razorpay = getRazorpayClient();
        const order = await razorpay.orders.create({
            amount: params.amount,
            currency: params.currency || 'INR',
            receipt: params.receipt,
            notes: params.notes || {},
        });
        return order;
    }
    catch (error) {
        console.error('Razorpay order creation error:', error);
        throw (0, errors_js_1.internalError)(`Failed to create Razorpay order: ${error.message || 'Unknown error'}`);
    }
}
/**
 * Fetch Razorpay payment
 */
async function fetchRazorpayPayment(paymentId) {
    try {
        const razorpay = getRazorpayClient();
        return await razorpay.payments.fetch(paymentId);
    }
    catch (error) {
        console.error('Razorpay payment fetch error:', error);
        throw (0, errors_js_1.internalError)(`Failed to fetch Razorpay payment: ${error.message || 'Unknown error'}`);
    }
}
//# sourceMappingURL=razorpay.js.map