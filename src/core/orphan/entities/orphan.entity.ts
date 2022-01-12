import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Orphan as PrismaOrphan } from '@prisma/client';

export enum Gender {
	M = 'Garçon',
	F = 'Fille'
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
	@Expose()
	get score(): number {
		return (this.sociability + this.calm + this.beauty + this.hygiene + this.intelligence) / 5;
	}

	@ApiProperty()
	@Expose()
	get age(): number {
		const diff_ms = Date.now() - this.birthDate.getTime();
		const age_dt = new Date(diff_ms);

		return Math.abs(age_dt.getUTCFullYear() - 1970);
	}

	@ApiProperty()
	picture: string;

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
