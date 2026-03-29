import { request } from './client';
import type { ChangePasswordRequest, UserCar, UserProfile, UserResponseDto } from '$lib/types/user';

export async function getUsers(): Promise<UserResponseDto[]> {
	return request<UserResponseDto[]>('/users');
}

export async function getUserById(id: number): Promise<UserProfile> {
	return request<UserProfile>(`/users/${id}`);
}

export async function changePassword(email: string, newPassword: string): Promise<void> {
	return request<void>('/users/me/password', {
		method: 'PATCH',
		body: JSON.stringify({ email, password: newPassword } satisfies ChangePasswordRequest)
	});
}

export async function updateUserRole(id: number, role: string): Promise<UserResponseDto> {
	return request<UserResponseDto>(`/admin/users/${id}/role`, {
		method: 'PATCH',
		body: JSON.stringify(role)
	});
}

export async function adminDeleteUser(id: number): Promise<void> {
	return request<void>(`/admin/users/${id}`, { method: 'DELETE' });
}

export async function deleteMyAccount(id: number): Promise<void> {
	return request<void>(`/users/${id}`, { method: 'DELETE' });
}

export async function getMe(): Promise<UserProfile> {
	return request<UserProfile>('/users/me');
}

export async function getUserCars(userId: number): Promise<UserCar[]> {
	return request<UserCar[]>(`/users/${userId}/cars`);
}

export async function createUserCar(userId: number, car: Omit<UserCar, 'id'>): Promise<UserCar> {
	return request<UserCar>(`/users/${userId}/cars`, {
		method: 'POST',
		body: JSON.stringify(car)
	});
}

export async function updateUserCar(
	userId: number,
	carId: number,
	car: Partial<Omit<UserCar, 'id'>>
): Promise<UserCar> {
	return request<UserCar>(`/users/${userId}/cars/${carId}`, {
		method: 'PATCH',
		body: JSON.stringify(car)
	});
}

export async function deleteUserCar(userId: number, carId: number): Promise<void> {
	return request<void>(`/users/${userId}/cars/${carId}`, { method: 'DELETE' });
}
