"use strict";
/**
 * Configuration management for Firebase Functions
 * Reads from Firebase Functions Config (functions.config())
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
exports.CONFIG = void 0;
exports.getCONFIG = getCONFIG;
exports.isEmailConfigured = isEmailConfigured;
exports.isTypesenseConfigured = isTypesenseConfigured;
const functions = __importStar(require("firebase-functions"));
function getConfig() {
    const config = functions.config();
    const razorpay = {
        key_id: config.razorpay?.key_id || '',
        key_secret: config.razorpay?.key_secret || '',
        webhook_secret: config.razorpay?.webhook_secret || '',
    };
    const email = {
        sendgrid_key: config.email?.sendgrid_key,
    };
    const typesense = {
        api_key: config.typesense?.api_key,
        host: config.typesense?.host,
        port: config.typesense?.port || '8108',
        protocol: config.typesense?.protocol || 'http',
    };
    // Validate required config
    const missing = [];
    if (!razorpay.key_id)
        missing.push('razorpay.key_id');
    if (!razorpay.key_secret)
        missing.push('razorpay.key_secret');
    // webhook_secret is optional (not needed for test mode)
    if (missing.length > 0) {
        throw new Error(`Missing required Firebase Functions config: ${missing.join(', ')}\n` +
            `Set them with: firebase functions:config:set ${missing.map(k => `${k.replace('.', ':')}="VALUE"`).join(' ')}`);
    }
    return { razorpay, email, typesense };
}
// Lazy-load config to avoid errors during module initialization
let _config = null;
function getCONFIG() {
    if (!_config) {
        try {
            _config = getConfig();
        }
        catch (error) {
            console.warn('Config not fully initialized:', error);
            // Return partial config for development
            const functions = require('firebase-functions');
            const config = functions.config();
            _config = {
                razorpay: {
                    key_id: config.razorpay?.key_id || '',
                    key_secret: config.razorpay?.key_secret || '',
                    webhook_secret: config.razorpay?.webhook_secret || '',
                },
                email: {
                    sendgrid_key: config.email?.sendgrid_key,
                },
                typesense: {
                    api_key: config.typesense?.api_key,
                    host: config.typesense?.host,
                    port: config.typesense?.port || '8108',
                    protocol: config.typesense?.protocol || 'http',
                },
            };
        }
    }
    return _config;
}
exports.CONFIG = new Proxy({}, {
    get(_target, prop) {
        return getCONFIG()[prop];
    },
});
// Helper to check if optional services are configured
function isEmailConfigured() {
    return !!getCONFIG().email.sendgrid_key;
}
function isTypesenseConfigured() {
    const ts = getCONFIG().typesense;
    return !!(ts.api_key &&
        ts.host &&
        ts.port &&
        ts.protocol);
}
//# sourceMappingURL=config.js.map