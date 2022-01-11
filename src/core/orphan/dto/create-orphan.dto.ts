import { ApiProperty } from '@nestjs/swagger';

export class CreateOrphanDto {
	@ApiProperty()
	firstname: string;

	@ApiProperty()
	lastname: string;

	@ApiProperty()
	birthDate: string;

	@ApiProperty()
	country: string;

	@ApiProperty()
	gender: string;
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

	@ApiProperty()
	hygiene: number;
}
