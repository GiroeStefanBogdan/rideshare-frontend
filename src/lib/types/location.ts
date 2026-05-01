export interface LocationResult {
	id: number;
	type: 'ADMIN_UNIT' | 'STREET';
	name: string;
	fullName: string;
	latitude: number;
	longitude: number;
	population: number | null;
}
