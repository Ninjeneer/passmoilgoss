import { Gender } from '../entities/orphan.entity';

export class CreateOrphanDto {
	firstname: string;
	lastname: string;
	birthDate: Date;
	country: string;
	gender: Gender;
	score: number;

	// Stats
	eyes: string;
	hairs: string;
	weight: number;
	height: number;

	beauty: number;
	intelligence: number;
	sociability: number;
	calm: number;
	hygiene: number;
}
