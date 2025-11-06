"use strict";
/**
 * Request validators using Zod
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateReviewSubmission = exports.validateCreateOrderRequest = void 0;
exports.validateBody = validateBody;
exports.validateHandle = validateHandle;
const zod_1 = require("zod");
const errors_js_1 = require("./utils/errors.js");
const schema_js_1 = require("./utils/schema.js");
/**
 * Validate and parse request body
 */
function validateBody(schema, data) {
    try {
        return schema.parse(data);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw (0, errors_js_1.unprocessableEntity)('Validation failed', {
                errors: error.errors.map(e => ({
                    path: e.path.join('.'),
                    message: e.message,
                })),
            });
        }
        throw (0, errors_js_1.badRequest)('Invalid request body');
    }
}
/**
 * Validate handle
 */
function validateHandle(handle) {
    try {
        return schema_js_1.HandleSchema.parse(handle);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            throw (0, errors_js_1.unprocessableEntity)(error.errors[0]?.message || 'Invalid handle');
        }
        throw (0, errors_js_1.badRequest)('Invalid handle');
    }
}
/**
 * Validate create order request
 */
const validateCreateOrderRequest = (data) => validateBody(schema_js_1.CreateOrderRequestSchema, data);
exports.validateCreateOrderRequest = validateCreateOrderRequest;
/**
 * Validate review submission
 */
const validateReviewSubmission = (data) => validateBody(schema_js_1.ReviewSchema, data);
exports.validateReviewSubmission = validateReviewSubmission;
//# sourceMappingURL=validators.js.map