export interface UserResponseDto {
	id: number;
	name: string;
	email: string;
	birthday: string; // ISO date string
	gender: 'MALE' | 'FEMALE';
	phoneNumber: string;
	role: 'ROLE_USER' | 'ROLE_ADMIN';
	provider: 'LOCAL' | 'GOOGLE';
}

export interface UserInfo {
	bio: string;
	canSmoke: boolean;
	petFriendly: boolean;
}

export interface UserCar {
	id: number;
	brand: string;
	model: string;
	color: string;
	year: number;
	licensePlate: string;
	numberOfSeats: number;
}

export interface UserReview {
	id: number;
	reviewerId: number;
	targetUserId: number;
	score: number;
	details: string;
	date: string; // ISO datetime string
}

// Returned by GET /users/{id} — own profile includes all fields; other users may have a subset
export interface UserProfile extends UserResponseDto {
	bio?: string;
	canSmoke?: boolean;
	petFriendly?: boolean;
	cars?: UserCar[];
	reviews?: UserReview[];
}

export interface UserPublicProfile {
	id: number;
	name: string;
	birthday: string;
	gender: 'MALE' | 'FEMALE';
	bio?: string;
	canSmoke?: boolean;
	petFriendly?: boolean;
	cars?: UserCar[];
	reviews?: UserReview[];
}

export interface ChangePasswordRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	token: string;
	user: UserResponseDto;
}

export interface UpdateUserRequest {
	name?: string;
	email?: string;
	phoneNumber?: string;
	birthday?: string;
	gender?: 'MALE' | 'FEMALE';
}
