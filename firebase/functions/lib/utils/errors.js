"use strict";
/**
 * Standardized HTTP error helpers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.badRequest = badRequest;
exports.unauthorized = unauthorized;
exports.forbidden = forbidden;
exports.notFound = notFound;
exports.conflict = conflict;
exports.unprocessableEntity = unprocessableEntity;
exports.internalError = internalError;
exports.errorHandler = errorHandler;
class AppError extends Error {
    constructor(statusCode, code, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
function badRequest(message, details) {
    return new AppError(400, 'BAD_REQUEST', message, details);
}
function unauthorized(message = 'Unauthorized') {
    return new AppError(401, 'UNAUTHORIZED', message);
}
function forbidden(message = 'Forbidden') {
    return new AppError(403, 'FORBIDDEN', message);
}
function notFound(message = 'Resource not found') {
    return new AppError(404, 'NOT_FOUND', message);
}
function conflict(message, details) {
    return new AppError(409, 'CONFLICT', message, details);
}
function unprocessableEntity(message, details) {
    return new AppError(422, 'UNPROCESSABLE_ENTITY', message, details);
}
function internalError(message = 'Internal server error', details) {
    return new AppError(500, 'INTERNAL_ERROR', message, details);
}
function errorHandler(error) {
    if (error instanceof AppError) {
        return {
            statusCode: error.statusCode,
            body: {
                error: {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                },
            },
        };
    }
    // Unknown error
    console.error('Unhandled error:', error);
    return {
        statusCode: 500,
        body: {
            error: {
                code: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred',
            },
        },
    };
}
//# sourceMappingURL=errors.js.map