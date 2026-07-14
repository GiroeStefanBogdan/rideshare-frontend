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
	municipalityName: string;
	departsAt: string | null; // ISO 8601
}

export interface RideStopDetails extends RideStopBasic {
	stopOrder: number;
	availableSeats: number | null;
	pricePerSeat: number | null;
}

export interface BookedRide {
	bookingId: number;
	rideId: number;
	status: 'ACTIVE' | 'INACTIVE';
	driver: RideDriver;
	seats: number;
	totalPrice: number;
	fromStop: RideStopBasic;
	toStop: RideStopBasic;
}

export interface HostedRide {
	rideId: number;
	status: 'ACTIVE' | 'INACTIVE';
	seatsTotal: number;
	rideStops: RideStopDetails[];
}

export interface RideDetails {
	rideId: number;
	driver: RideDriver;
	seatsTotal: number;
	rideStops: RideStopDetails[];
}

export interface MyRidesResponse {
	upcomingBookings: BookedRide[];
	pastBookings: BookedRide[];
	upcomingHostedRides: HostedRide[];
	pastHostedRides: HostedRide[];
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
