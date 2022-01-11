import { CreateOrphanDto } from './dto/create-orphan.dto';
import { Injectable } from '@nestjs/common';
import { Orphan } from './entities/orphan.entity';
import { PrismaService } from '../../prisma.service';
import { UpdateOrphanDto } from './dto/update-orphan.dto';

@Injectable()
export default class OrphanRepository {
	constructor(private prisma: PrismaService) {}

	public async create(dto: CreateOrphanDto): Promise<Orphan> {
		return Orphan.from(
			await this.prisma.orphan.create({
				data: dto
			})
		);
	}

	public async findAll(): Promise<Orphan[]> {
		return (await this.prisma.orphan.findMany()).map((o) => Orphan.from(o));
	}

	public async findOne(id): Promise<Orphan> {
		return Orphan.from(await this.prisma.orphan.findUnique({ where: { id } }));
	}

	public async update(id: string, dto: UpdateOrphanDto): Promise<Orphan> {
		return Orphan.from(await this.prisma.orphan.update({ where: { id }, data: dto }));
	}

	public async remove(id: string): Promise<void> {
		await this.prisma.orphan.delete({ where: { id } });
	}
}
