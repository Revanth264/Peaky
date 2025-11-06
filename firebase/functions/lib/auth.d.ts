/**
 * Authentication and authorization helpers
 */
import * as admin from 'firebase-admin';
/**
 * Require authentication and return decoded token
 */
export declare function requireAuth(decodedToken?: admin.auth.DecodedIdToken): admin.auth.DecodedIdToken;
/**
 * Require admin role
 */
export declare function requireAdmin(decodedToken?: admin.auth.DecodedIdToken): admin.auth.DecodedIdToken;
/**
 * Set custom claim for admin role
 */
export declare function setAdminRole(uid: string, isAdmin: boolean): Promise<void>;
/**
 * Check if user is admin
 */
export declare function isAdmin(decodedToken?: admin.auth.DecodedIdToken): boolean;
//# sourceMappingURL=auth.d.ts.map