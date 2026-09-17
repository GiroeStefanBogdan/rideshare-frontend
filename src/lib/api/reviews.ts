import { request } from './client';
import type {
	MyReviews,
	Review,
	ReviewEligibility,
	ReviewInput,
	UserReviews
} from '$lib/types/review';

export async function getMyReviews(): Promise<MyReviews> {
	return request<MyReviews>('/reviews/me');
}

export async function getMyReviewEligibility(): Promise<ReviewEligibility[]> {
	return request<ReviewEligibility[]>('/reviews/me/eligibility');
}

export async function submitReview(input: ReviewInput): Promise<Review> {
	return request<Review>('/reviews', {
		method: 'POST',
		body: JSON.stringify(input)
	});
}

export async function getUserReviews(userId: number): Promise<UserReviews> {
	return request<UserReviews>(`/users/${userId}/reviews`);
}

export async function adminHideReview(reviewId: number, reason?: string): Promise<Review> {
	return request<Review>(`/admin/reviews/${reviewId}/hide`, {
		method: 'PATCH',
		body: JSON.stringify({ reason })
	});
}

export async function adminRestoreReview(reviewId: number): Promise<Review> {
	return request<Review>(`/admin/reviews/${reviewId}/restore`, { method: 'PATCH' });
}
