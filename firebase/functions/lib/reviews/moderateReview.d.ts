/**
 * Moderate review (admin only)
 */
interface ModerateReviewParams {
    reviewId: string;
    action: 'approve' | 'reject';
}
export declare function moderateReview(params: ModerateReviewParams): Promise<void>;
export {};
//# sourceMappingURL=moderateReview.d.ts.map