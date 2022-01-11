import { EyesColors, HairColors, Orphan } from './entities/orphan.entity';
import { address, datatype, date, name } from 'faker';

export default class OrphanFactory {
	public static buildOne(): Orphan {
		return {
			firstname: name.firstName(),
			lastname: name.lastName(),
			birthDate: date.past(8),
			height: datatype.number({ min: 90, max: 155 }),
			weight: datatype.number({ min: 20, max: 60 }),
			gender: ['m', 'f'][Math.round(Math.random())],
			hairs: HairColors[Math.floor(Math.random() * HairColors.length)],
			eyes: EyesColors[Math.floor(Math.random() * EyesColors.length)],
			country: address.country(),

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
}
