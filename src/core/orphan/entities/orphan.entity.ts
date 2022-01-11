import { ApiProperty } from '@nestjs/swagger';
import { Orphan as PrismaOrphan } from '@prisma/client';

export enum Gender {
	M = 'm',
	F = 'f'
}

export const HairColors = ['Blond', 'Brun', 'Châtain', 'Roux'];
export const EyesColors = ['Bleu', 'Marron', 'Vert'];

export class Orphan {
	@ApiProperty({ readOnly: true })
	id: string;

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

	@ApiProperty({ readOnly: true })
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

	@ApiProperty()
	hygiene: number;

	public static from(prismaOrphan: PrismaOrphan) {
		if (!prismaOrphan) {
			return null;
		}
		const orphan = new Orphan();
		Object.assign(orphan, { ...prismaOrphan });
		return orphan;
	}
}
