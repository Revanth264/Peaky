/**
 * Standardized HTTP error helpers
 */
export declare class AppError extends Error {
    statusCode: number;
    code: string;
    details?: any | undefined;
    constructor(statusCode: number, code: string, message: string, details?: any | undefined);
}
export declare function badRequest(message: string, details?: any): AppError;
export declare function unauthorized(message?: string): AppError;
export declare function forbidden(message?: string): AppError;
export declare function notFound(message?: string): AppError;
export declare function conflict(message: string, details?: any): AppError;
export declare function unprocessableEntity(message: string, details?: any): AppError;
export declare function internalError(message?: string, details?: any): AppError;
export declare function errorHandler(error: unknown): {
    statusCode: number;
    body: any;
};
//# sourceMappingURL=errors.d.ts.map