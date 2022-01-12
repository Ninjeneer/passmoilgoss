import CreateUserDTO from './dto/create-user.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import UpdateUserDTO from './dto/update-user.dto';
import User from './entities/user.entity';

@Injectable()
export default class UserRepository {
	constructor(private prisma: PrismaService) {}

	public async create(dto: CreateUserDTO): Promise<User> {
		return User.from(
			await this.prisma.user.create({
				data: dto
			})
		);
	}

	public async findAll(): Promise<User[]> {
		return (await this.prisma.user.findMany()).map((u) => User.from(u));
	}

	public async findOne(id: string): Promise<User> {
		return User.from(await this.prisma.user.findUnique({ where: { id } }));
	}

	public async findByEmail(email: string, withPassword = false): Promise<User> {
		const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
		return User.from(user, { withPassword });
	}

	public async remove(id: string): Promise<void> {
		await this.prisma.user.delete({ where: { id } });
	}

	public async update(id: string, dto: UpdateUserDTO): Promise<User> {
		return await User.from(await this.prisma.user.update({ where: { id }, data: dto }));
	}
}
