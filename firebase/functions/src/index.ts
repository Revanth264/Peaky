/**
 * Firebase Cloud Functions v2 - Main Entry Point
 * Peakime E-commerce Store Backend
 */

import * as functions from 'firebase-functions/v2';
import express from 'express';
import { createPaymentOrder } from './payments/createPaymentOrder';
import { paymentWebhook } from './payments/paymentWebhook';
import { submitReview } from './reviews/submitReview';
import { moderateReview } from './reviews/moderateReview';
import { ensureHandle } from './profile/ensureHandle';
import { rebuildMetrics } from './metrics/rebuildMetricsCron';
import { authenticatedHandler, parseJsonBody } from './utils/http';
import { requireAdmin } from './auth';
import { validateReviewSubmission } from './validators';
import type { Request, Response } from 'express';
import type admin from 'firebase-admin';

// Initialize Express app for HTTP functions
const app = express();
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes

// POST /api/create-payment-order
app.post('/api/create-payment-order', createPaymentOrder);

// POST /api/payment-webhook (public, no auth)
app.post('/api/payment-webhook', paymentWebhook);

// POST /api/submit-review
app.post('/api/submit-review', authenticatedHandler(
  async (req: Request, _res: Response, authToken: admin.auth.DecodedIdToken) => {
    const body = parseJsonBody(req);
    const reviewData = validateReviewSubmission(body);
    const result = await submitReview(authToken.uid, reviewData);
    return result;
  }
));

// POST /api/moderate-review (admin only)
app.post('/api/moderate-review', authenticatedHandler(
  async (req: Request, _res: Response, authToken: admin.auth.DecodedIdToken) => {
    requireAdmin(authToken);
    const body = parseJsonBody<{ reviewId: string; action: 'approve' | 'reject' }>(req);
    await moderateReview({ reviewId: body.reviewId, action: body.action });
    return { success: true };
  }
));

// POST /api/ensure-handle
app.post('/api/ensure-handle', authenticatedHandler(
  async (req: Request, _res: Response, authToken: admin.auth.DecodedIdToken) => {
    const body = parseJsonBody<{ handle: string }>(req);
    const result = await ensureHandle(authToken.uid, body);
    return result;
  }
));

// Export HTTP function
export const api = functions.https.onRequest(
  {
    region: 'asia-south1', // Closest to India
    cors: true,
    timeoutSeconds: 60,
    memory: '512MiB',
  },
  app
);

// Scheduled function: Rebuild metrics (hourly)
export const rebuildMetricsCron = functions.scheduler.onSchedule(
  {
    schedule: 'every 1 hours',
    timeZone: 'Asia/Kolkata',
    region: 'asia-south1',
    timeoutSeconds: 540, // 9 minutes max
    memory: '512MiB',
  },
  async () => {
    console.log('Running metrics rebuild cron...');
    try {
      await rebuildMetrics();
      console.log('Metrics rebuild completed successfully');
    } catch (error) {
      console.error('Metrics rebuild failed:', error);
      throw error;
    }
  }
);

