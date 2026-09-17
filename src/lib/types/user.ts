import type { Review } from './review';

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

export interface UserProfile extends UserResponseDto {
	bio?: string;
	canSmoke?: boolean;
	petFriendly?: boolean;
	cars?: UserCar[];
	reviews?: Review[];
	rating?: number | null;
	reviewsCount?: number;
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
	reviews?: Review[];
	rating?: number | null;
	reviewsCount?: number;
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
