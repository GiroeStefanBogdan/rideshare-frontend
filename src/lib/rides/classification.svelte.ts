import type { BookedRide, HostedRide } from '$lib/types/ride';

/**
 * Classification phases shared by the My Rides pages. A ride stays Upcoming
 * until its scheduled end (booking drop-off, hosted final stop) has passed;
 * only then does it move to Past for the remainder of the one-month window.
 */
export type RidePhase = 'upcoming' | 'past' | 'cancelled';

interface PhaseView {
	status: BookedRide['status'];
	startTime: string | null;
	endTime: string | null;
}

function parseTime(value: string | null | undefined): number | null {
	if (!value) return null;
	const parsed = Date.parse(value);
	return Number.isFinite(parsed) ? parsed : null;
}

export function scheduledEnd(ride: PhaseView): number | null {
	return parseTime(ride.endTime);
}

export function isOngoing(ride: PhaseView, now: number = Date.now()): boolean {
	if (ride.status === 'CANCELLED') return false;
	const start = parseTime(ride.startTime);
	const end = parseTime(ride.endTime);
	return start !== null && end !== null && start <= now && now < end;
}

/** Cancelled cards from both server buckets, newest scheduled end first. */
export function bySchedule<T extends PhaseView & { rideId: number; bookingId?: number }>(
	entries: T[]
): T[] {
	return [...entries].sort((a, b) => {
		const endA = parseTime(a.endTime);
		const endB = parseTime(b.endTime);
		if (endA === null && endB !== null) return 1;
		if (endB === null && endA !== null) return -1;
		return (endB ?? 0) - (endA ?? 0) || (a.bookingId ?? a.rideId) - (b.bookingId ?? b.rideId);
	});
}

export type BookedRideView = BookedRide & PhaseView;
export type HostedRideView = HostedRide & PhaseView;
