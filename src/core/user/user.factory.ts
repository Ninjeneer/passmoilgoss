import User, { UserRole } from './entities/user.entity';
import { internet, name } from 'faker';

export default class UserFactory {
	public static buildOne(): User {
		return {
			email: internet.email().toLowerCase(),
			firstname: name.firstName(),
			lastname: name.lastName(),
			role: UserRole.PARENT,
			approved: false
		} as User;
	}

	public static buildMany(n: number): User[] {
		const res = [];
		for (let i = 0; i < n; i++) {
			res.push(UserFactory.buildOne());
		}
		return res;
	}
}
