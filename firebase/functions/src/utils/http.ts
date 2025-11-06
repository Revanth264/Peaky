/**
 * HTTP handler wrapper with CORS, JSON parsing, and auth extraction
 */

import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { errorHandler, unauthorized } from './errors.js';
import cors from 'cors';

const corsHandler = cors({ origin: true });

/**
 * Extract Firebase Auth token from request
 */
export async function extractAuthToken(req: Request): Promise<admin.auth.DecodedIdToken | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split('Bearer ')[1];
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    return null;
  }
}

/**
 * Wrapper for HTTP functions with CORS and error handling
 */
export function httpHandler(
  handler: (req: Request, res: Response, authToken?: admin.auth.DecodedIdToken) => Promise<any>
) {
  return async (req: Request, res: Response) => {
    // Handle CORS
    corsHandler(req, res, async () => {
      try {
        // Extract auth token (optional)
        const authToken = await extractAuthToken(req);
        
        // Call handler
        const result = await handler(req, res, authToken || undefined);
        
        // Send response if not already sent
        if (!res.headersSent) {
          res.status(200).json(result || { success: true });
        }
      } catch (error) {
        const { statusCode, body } = errorHandler(error);
        if (!res.headersSent) {
          res.status(statusCode).json(body);
        }
      }
    });
  };
}

/**
 * Wrapper for authenticated HTTP functions
 */
export function authenticatedHandler(
  handler: (req: Request, res: Response, authToken: admin.auth.DecodedIdToken) => Promise<any>
) {
  return httpHandler(async (req, res, authToken) => {
    if (!authToken) {
      throw unauthorized('Authentication required');
    }
    return handler(req, res, authToken);
  });
}

/**
 * Parse JSON body helper
 */
export function parseJsonBody<T>(req: Request): T {
  if (!req.body || typeof req.body !== 'object') {
    throw new Error('Invalid JSON body');
  }
  return req.body as T;
}

