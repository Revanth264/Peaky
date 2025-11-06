/**
 * Submit review (verified purchase only)
 */
export declare function submitReview(uid: string, data: {
    productId: string;
    rating: number;
    comment: string;
}): Promise<{
    reviewId: string;
}>;
//# sourceMappingURL=submitReview.d.ts.map