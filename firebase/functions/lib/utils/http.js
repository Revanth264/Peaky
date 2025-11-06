"use strict";
/**
 * HTTP handler wrapper with CORS, JSON parsing, and auth extraction
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
exports.extractAuthToken = extractAuthToken;
exports.httpHandler = httpHandler;
exports.authenticatedHandler = authenticatedHandler;
exports.parseJsonBody = parseJsonBody;
const admin = __importStar(require("firebase-admin"));
const errors_js_1 = require("./errors.js");
const cors_1 = __importDefault(require("cors"));
const corsHandler = (0, cors_1.default)({ origin: true });
/**
 * Extract Firebase Auth token from request
 */
async function extractAuthToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split('Bearer ')[1];
    try {
        return await admin.auth().verifyIdToken(token);
    }
    catch (error) {
        return null;
    }
}
/**
 * Wrapper for HTTP functions with CORS and error handling
 */
function httpHandler(handler) {
    return async (req, res) => {
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
            }
            catch (error) {
                const { statusCode, body } = (0, errors_js_1.errorHandler)(error);
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
function authenticatedHandler(handler) {
    return httpHandler(async (req, res, authToken) => {
        if (!authToken) {
            throw (0, errors_js_1.unauthorized)('Authentication required');
        }
        return handler(req, res, authToken);
    });
}
/**
 * Parse JSON body helper
 */
function parseJsonBody(req) {
    if (!req.body || typeof req.body !== 'object') {
        throw new Error('Invalid JSON body');
    }
    return req.body;
}
//# sourceMappingURL=http.js.map