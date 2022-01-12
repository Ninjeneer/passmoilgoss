import { ApiProperty } from '@nestjs/swagger';
import { User as PrismaUser } from '@prisma/client';

export enum UserRole {
	PARENT = 'parent',
	STAFF = 'staff'
}

export default class User {
	@ApiProperty()
	id: string;

	@ApiProperty()
	email: string;

	@ApiProperty()
	firstname: string;

	@ApiProperty()
	lastname: string;

	@ApiProperty({ enum: UserRole })
	role: UserRole;

	@ApiProperty()
	approved: boolean;

	constructor() {}

	public static from(prismaUser: PrismaUser, options?: { withPassword: boolean }) {
		if (!prismaUser) {
			return null;
		}
		const user = new User();
		Object.assign(user, { ...prismaUser });
		// if (options) {
		// 	if (!options.withPassword) {
		// 		delete user.password;
		// 	}
		// } else {
		// 	delete user.password;
		// }
		return user;
	}
}
