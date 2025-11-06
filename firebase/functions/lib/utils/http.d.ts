/**
 * HTTP handler wrapper with CORS, JSON parsing, and auth extraction
 */
import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
/**
 * Extract Firebase Auth token from request
 */
export declare function extractAuthToken(req: Request): Promise<admin.auth.DecodedIdToken | null>;
/**
 * Wrapper for HTTP functions with CORS and error handling
 */
export declare function httpHandler(handler: (req: Request, res: Response, authToken?: admin.auth.DecodedIdToken) => Promise<any>): (req: Request, res: Response) => Promise<void>;
/**
 * Wrapper for authenticated HTTP functions
 */
export declare function authenticatedHandler(handler: (req: Request, res: Response, authToken: admin.auth.DecodedIdToken) => Promise<any>): (req: Request, res: Response) => Promise<void>;
/**
 * Parse JSON body helper
 */
export declare function parseJsonBody<T>(req: Request): T;
//# sourceMappingURL=http.d.ts.map