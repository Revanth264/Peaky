/**
 * Ensure unique handle for user profile
 */
interface EnsureHandleRequest {
    handle: string;
}
export declare function ensureHandle(uid: string, data: EnsureHandleRequest): Promise<{
    handle: string;
    handleLower: string;
}>;
export {};
//# sourceMappingURL=ensureHandle.d.ts.map