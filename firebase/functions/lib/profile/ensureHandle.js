"use strict";
/**
 * Ensure unique handle for user profile
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureHandle = ensureHandle;
const admin_js_1 = require("../utils/admin.js");
const validators_js_1 = require("../validators.js");
const errors_js_1 = require("../utils/errors.js");
const admin_js_2 = require("../utils/admin.js");
async function ensureHandle(uid, data) {
    // Validate handle format
    const handleLower = (0, validators_js_1.validateHandle)(data.handle);
    // Check if handle is already taken
    const handleQuery = await admin_js_1.db
        .collectionGroup('profile')
        .where('handleLower', '==', handleLower)
        .limit(1)
        .get();
    if (!handleQuery.empty) {
        const existingDoc = handleQuery.docs[0];
        if (existingDoc.data().uid !== uid) {
            throw (0, errors_js_1.conflict)('Handle is already taken');
        }
        // Same user, handle already set - return existing
        return {
            handle: existingDoc.data().handle || handleLower,
            handleLower,
        };
    }
    // Check user's existing profile
    const profileRef = admin_js_1.db.collection('users').doc(uid).collection('profile').doc('main');
    const profileDoc = await profileRef.get();
    if (profileDoc.exists) {
        const existing = profileDoc.data();
        if (existing?.handleLower && existing.handleLower !== handleLower) {
            throw (0, errors_js_1.unprocessableEntity)('Handle cannot be changed once set');
        }
        if (existing?.handleLower === handleLower) {
            // Already set to this handle
            return {
                handle: existing.handle || handleLower,
                handleLower,
            };
        }
    }
    // Set handle
    await profileRef.set({
        handle: data.handle,
        handleLower,
        updatedAt: (0, admin_js_2.serverTimestamp)(),
    }, { merge: true });
    return {
        handle: data.handle,
        handleLower,
    };
}
//# sourceMappingURL=ensureHandle.js.map