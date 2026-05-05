export interface RideDriver {
	id: number;
	name: string;
	avatarUrl: string | null;
	rating: number;
	reviewsCount: number;
	smokingAllowed: boolean;
	petFriendly: boolean;
}

export interface RideStopBasic {
	id: number;
	locationName: string;
	departsAt: string; // ISO 8601
}

export interface RideSearchResult {
	rideId: number;
	driver: RideDriver;
	seatsAvailable: number;
	totalPrice: number;
	startStop: RideStopBasic;
	endStop: RideStopBasic;
	distanceToStartKm: number;
	distanceToEndKm: number;
}

export interface ReserveRideRequest {
	fromStopId: number;
	toStopId: number;
	seats: number;
}

export interface ReserveRideResponse {
	id: number; // bookingId
}

export interface RideSearchParams {
	fromId: number;
	fromType: 'ADMIN_UNIT' | 'STREET';
	toId: number;
	toType: 'ADMIN_UNIT' | 'STREET';
	date: string; // ISO Date YYYY-MM-DD
	seats: number;
	maxDistanceStart?: number; // km
	maxDistanceEnd?: number; // km
	maxPrice?: number;
	timeWindow?: 'BEFORE_8' | '8_12' | '12_18' | 'AFTER_18' | null;
	smokingAllowed?: boolean;
	petFriendly?: boolean;
}
