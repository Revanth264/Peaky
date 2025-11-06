"use strict";
/**
 * Authentication and authorization helpers
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
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
exports.setAdminRole = setAdminRole;
exports.isAdmin = isAdmin;
const admin = __importStar(require("firebase-admin"));
const errors_js_1 = require("./utils/errors.js");
/**
 * Require authentication and return decoded token
 */
function requireAuth(decodedToken) {
    if (!decodedToken) {
        throw (0, errors_js_1.unauthorized)('Authentication required');
    }
    return decodedToken;
}
/**
 * Require admin role
 */
function requireAdmin(decodedToken) {
    const token = requireAuth(decodedToken);
    if (token.role !== 'admin') {
        throw (0, errors_js_1.forbidden)('Admin access required');
    }
    return token;
}
/**
 * Set custom claim for admin role
 */
async function setAdminRole(uid, isAdmin) {
    const customClaims = isAdmin ? { role: 'admin' } : {};
    await admin.auth().setCustomUserClaims(uid, customClaims);
}
/**
 * Check if user is admin
 */
function isAdmin(decodedToken) {
    return decodedToken?.role === 'admin' || false;
}
//# sourceMappingURL=auth.js.map