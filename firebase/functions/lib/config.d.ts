/**
 * Configuration management for Firebase Functions
 * Reads from Firebase Functions Config (functions.config())
 */
interface RazorpayConfig {
    key_id: string;
    key_secret: string;
    webhook_secret: string;
}
interface EmailConfig {
    sendgrid_key?: string;
}
interface TypesenseConfig {
    api_key?: string;
    host?: string;
    port?: string;
    protocol?: string;
}
export declare function getCONFIG(): {
    razorpay: RazorpayConfig;
    email: EmailConfig;
    typesense: TypesenseConfig;
};
export declare const CONFIG: {
    razorpay: RazorpayConfig;
    email: EmailConfig;
    typesense: TypesenseConfig;
};
export declare function isEmailConfigured(): boolean;
export declare function isTypesenseConfigured(): boolean;
export {};
//# sourceMappingURL=config.d.ts.map