import { EyesColors, Gender, HairColors, Orphan } from './entities/orphan.entity';
import { address, datatype, date, name } from 'faker';

import { CreateOrphanDto } from './dto/create-orphan.dto';
import axios from 'axios';

export default class OrphanFactory {
	public static async buildOne(): Promise<Orphan> {
		const gender = [Gender.M, Gender.F][Math.round(Math.random())];
		const imgRequest = await axios.get(
			`https://fakeface.rest/face/json?gender=${gender === Gender.M ? 'male' : 'female'}&minimum_age=0&maximum_age=15`
		);

		return {
			firstname: name.firstName(gender === Gender.M ? 0 : 1),
			lastname: name.lastName(),
			birthDate: date.past(imgRequest.data.age),
			height: datatype.number({ min: 90, max: 155 }),
			weight: datatype.number({ min: 20, max: 60 }),
			gender,
			hairs: HairColors[Math.floor(Math.random() * HairColors.length)],
			eyes: EyesColors[Math.floor(Math.random() * EyesColors.length)],
			country: address.country(),
			picture: imgRequest.data.image_url,

			beauty: datatype.number({ min: 0, max: 20 }),
			intelligence: datatype.number({ min: 0, max: 20 }),
			sociability: datatype.number({ min: 0, max: 20 }),
			calm: datatype.number({ min: 0, max: 20 }),
			hygiene: datatype.number({ min: 0, max: 20 })
		} as Orphan;
	}

	public static buildMany(n: number): Orphan[] {
		const res = [];
		for (let i = 0; i < n; i++) {
			res.push(OrphanFactory.buildOne());
		}
		return res;
	}

	public static async buildCreateOrphanDto(): Promise<CreateOrphanDto> {
		const orphan = await OrphanFactory.buildOne();
		return { ...orphan, birthDate: orphan.birthDate.toISOString() };
	}

	public static async buildManyCreateOrphanDto(n: number): Promise<CreateOrphanDto[]> {
		const res = [];
		for (let i = 0; i < n; i++) {
			res.push(await OrphanFactory.buildCreateOrphanDto());
		}
		return res;
	}
}
