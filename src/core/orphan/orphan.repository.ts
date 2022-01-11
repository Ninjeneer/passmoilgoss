import { Gender, Orphan } from './entities/orphan.entity';

import { CreateOrphanDto } from './dto/create-orphan.dto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { UpdateOrphanDto } from './dto/update-orphan.dto';

export interface FindManyFilters {
	gender?: Gender;
	eyes?: string[];
	hairs?: string[];
	countries?: string[];
}

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

	public async findAll(filters?: FindManyFilters, sort?: string): Promise<Orphan[]> {
		const request: Prisma.OrphanFindManyArgs = {};
		if (filters) {
			request.where = { AND: [] };
			if (filters.gender) {
				(request.where.AND as Array<Prisma.OrphanWhereInput>).push({ gender: filters.gender });
			}
			if (filters.countries) {
				(request.where.AND as Array<Prisma.OrphanWhereInput>).push({ country: { in: filters.countries } });
			}
			if (filters.eyes) {
				(request.where.AND as Array<Prisma.OrphanWhereInput>).push({ eyes: { in: filters.eyes } });
			}
			if (filters.hairs) {
				(request.where.AND as Array<Prisma.OrphanWhereInput>).push({ hairs: { in: filters.hairs } });
			}
			this.removeUselessFilters(request.where);
		}
		if (sort) {
			const order = sort.charAt(0) === '-' ? 'desc' : 'asc';
			request.orderBy = {
				[sort.startsWith('-') ? sort.substring(1) : sort]: order
			};
		}
		return (await this.prisma.orphan.findMany(request)).map((o) => Orphan.from(o));
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

	private removeUselessFilters(where): void {
		if (where.AND && where.AND.length === 0) {
			delete where.AND;
		}
	}
}
