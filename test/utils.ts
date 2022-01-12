import User, { UserRole } from '../src/core/user/entities/user.entity';

import HttpClient from './HttpClient';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import UserFactory from '../src/core/user/user.factory';
import { UserService } from '../src/core/user/user.service';

export default class TestUtils {
	public static async createBasicAndAdminUsers(userService: UserService): Promise<{ basic: User; admin: User }> {
		const basic = UserFactory.buildOne();
		const admin = UserFactory.buildOne();
		admin.role = UserRole.STAFF;

		const createdBasic = await userService.create(basic);
		const createdAdmin = await userService.create(admin);

		return { basic: createdBasic, admin: createdAdmin };
	}
}

export async function getHttpClient(app: NestFastifyApplication): Promise<HttpClient> {
	const httpClient = new HttpClient(app);
	return httpClient;
}
