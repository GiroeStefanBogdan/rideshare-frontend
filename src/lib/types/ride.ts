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

export type ReserveRideResponse = number | null;

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

export interface PublishRideStopRequest {
	id: number;
	type: 'ADMIN_UNIT' | 'STREET';
	stopOrder: number;
	cumulativePricePerSeat: number;
	departsAt: string;
}

export interface PublishRideRequest {
	rideStops: PublishRideStopRequest[];
	seatsTotal: number;
	carId: number | null;
}

export type PublishRideResponse = number | null;

export interface RideVehicle {
	id: number;
	brand: string;
	model: string;
	color: string;
	year: number;
}

export interface RideStopDetails {
	id: number;
	stopOrder: number;
	locationName: string;
	municipalityName: string;
	departsAt: string;
	availableSeats: number;
	cumulativePricePerSeat: number;
}

export interface RideDetails {
	rideId: number;
	driver: RideDriver;
	seatsTotal: number;
	vehicle: RideVehicle | null;
	rideStops: RideStopDetails[];
}
