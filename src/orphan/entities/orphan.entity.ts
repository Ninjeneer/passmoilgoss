import { ApiProperty } from '@nestjs/swagger';

export enum Gender {
	M = 'm',
	F = 'f'
}

export class Orphan {
	@ApiProperty()
	firstname: string;

	@ApiProperty()
	lastname: string;

	@ApiProperty()
	birthDate: Date;

	@ApiProperty()
	country: string;

	@ApiProperty({ enum: Gender })
	gender: Gender;

	@ApiProperty()
	score: number;

	// Stats
	@ApiProperty()
	eyes: string;

	@ApiProperty()
	hairs: string;

	@ApiProperty()
	weight: number;

	@ApiProperty()
	height: number;

	@ApiProperty()
	beauty: number;

	@ApiProperty()
	intelligence: number;

	@ApiProperty()
	sociability: number;

	@ApiProperty()
	calm: number;
}
