"use strict";
/**
 * Firebase Cloud Functions v2 - Main Entry Point
 * Peakime E-commerce Store Backend
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebuildMetricsCron = exports.api = void 0;
const functions = __importStar(require("firebase-functions/v2"));
const express_1 = __importDefault(require("express"));
const createPaymentOrder_1 = require("./payments/createPaymentOrder");
const paymentWebhook_1 = require("./payments/paymentWebhook");
const submitReview_1 = require("./reviews/submitReview");
const moderateReview_1 = require("./reviews/moderateReview");
const ensureHandle_1 = require("./profile/ensureHandle");
const rebuildMetricsCron_1 = require("./metrics/rebuildMetricsCron");
const http_1 = require("./utils/http");
const auth_1 = require("./auth");
const validators_1 = require("./validators");
// Initialize Express app for HTTP functions
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
// POST /api/create-payment-order
app.post('/api/create-payment-order', createPaymentOrder_1.createPaymentOrder);
// POST /api/payment-webhook (public, no auth)
app.post('/api/payment-webhook', paymentWebhook_1.paymentWebhook);
// POST /api/submit-review
app.post('/api/submit-review', (0, http_1.authenticatedHandler)(async (req, _res, authToken) => {
    const body = (0, http_1.parseJsonBody)(req);
    const reviewData = (0, validators_1.validateReviewSubmission)(body);
    const result = await (0, submitReview_1.submitReview)(authToken.uid, reviewData);
    return result;
}));
// POST /api/moderate-review (admin only)
app.post('/api/moderate-review', (0, http_1.authenticatedHandler)(async (req, _res, authToken) => {
    (0, auth_1.requireAdmin)(authToken);
    const body = (0, http_1.parseJsonBody)(req);
    await (0, moderateReview_1.moderateReview)({ reviewId: body.reviewId, action: body.action });
    return { success: true };
}));
// POST /api/ensure-handle
app.post('/api/ensure-handle', (0, http_1.authenticatedHandler)(async (req, _res, authToken) => {
    const body = (0, http_1.parseJsonBody)(req);
    const result = await (0, ensureHandle_1.ensureHandle)(authToken.uid, body);
    return result;
}));
// Export HTTP function
exports.api = functions.https.onRequest({
    region: 'asia-south1', // Closest to India
    cors: true,
    timeoutSeconds: 60,
    memory: '512MiB',
}, app);
// Scheduled function: Rebuild metrics (hourly)
exports.rebuildMetricsCron = functions.scheduler.onSchedule({
    schedule: 'every 1 hours',
    timeZone: 'Asia/Kolkata',
    region: 'asia-south1',
    timeoutSeconds: 540, // 9 minutes max
    memory: '512MiB',
}, async () => {
    console.log('Running metrics rebuild cron...');
    try {
        await (0, rebuildMetricsCron_1.rebuildMetrics)();
        console.log('Metrics rebuild completed successfully');
    }
    catch (error) {
        console.error('Metrics rebuild failed:', error);
        throw error;
    }
});
//# sourceMappingURL=index.js.map