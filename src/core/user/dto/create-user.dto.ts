import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export default class CreateUserDTO {
	@ApiProperty()
	@IsEmail()
	email: string;

	@ApiProperty()
	firstname: string;

	@ApiProperty()
	lastname: string;

	@ApiProperty({ enum: UserRole })
	role?: UserRole;

	@ApiProperty()
	approved: boolean;
}
