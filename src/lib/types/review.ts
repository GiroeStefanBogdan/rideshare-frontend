export type ReviewAuthorRole = 'DRIVER' | 'PASSENGER';

export type ReviewStatus = 'PENDING' | 'PUBLISHED' | 'HIDDEN';

/** Combined reputation. `average` is null, never zero, when nothing has been published. */
export interface RatingSummary {
	average: number | null;
	count: number;
}

/**
 * A review always exposes its published content. `pendingScore`/`pendingDetails` carry an
 * unpublished amendment visible only to its author, and `canSubmit` says whether the current
 * window still allows writing to it.
 */
export interface Review {
	id: number;
	authorId: number | null;
	authorName: string;
	targetUserId: number | null;
	score: number | null;
	details: string | null;
	role: ReviewAuthorRole | null;
	publishedAt: string | null;
	edited: boolean;
	pending: boolean;
	published: boolean;
	pendingScore: number | null;
	pendingDetails: string | null;
	windowEndsAt: string | null;
	canSubmit: boolean;
	status: ReviewStatus;
}

/** A counterpart the acting user shared a ride with, derived server-side from bookings. */
export interface ReviewEligibility {
	targetUserId: number;
	targetName: string;
	role: ReviewAuthorRole;
	rideId: number;
	dropoffAt: string;
	windowEndsAt: string | null;
	existingReviewId: number | null;
	canSubmit: boolean;
}

export interface MyReviews {
	summary: RatingSummary;
	received: Review[];
	authored: Review[];
	toWrite: ReviewEligibility[];
}

export interface UserReviews {
	summary: RatingSummary;
	reviews: Review[];
}

export interface ReviewInput {
	targetUserId: number;
	score: number;
	details?: string | null;
}
