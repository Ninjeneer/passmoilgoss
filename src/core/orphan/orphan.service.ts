import { Injectable, NotFoundException } from '@nestjs/common';
import OrphanRepository, { FindManyFilters } from './orphan.repository';

import { CreateOrphanDto } from './dto/create-orphan.dto';
import { Orphan } from './entities/orphan.entity';
import { UpdateOrphanDto } from './dto/update-orphan.dto';

@Injectable()
export class OrphanService {
	constructor(private readonly orphanRepository: OrphanRepository) {}

	async create(createOrphanDto: CreateOrphanDto): Promise<Orphan> {
		return await this.orphanRepository.create(createOrphanDto);
	}

	async findAll(filters?: FindManyFilters, sort?: string): Promise<Orphan[]> {
		return await this.orphanRepository.findAll(filters, sort);
	}

	async findOne(id: string): Promise<Orphan> {
		return await this.orphanRepository.findOne(id);
	}

	async update(id: string, updateOrphanDto: UpdateOrphanDto): Promise<Orphan> {
		const orphan = await this.orphanRepository.findOne(id);
		if (!orphan) {
			throw new NotFoundException();
		}
		return await this.orphanRepository.update(id, updateOrphanDto);
	}

	async remove(id: string): Promise<void> {
		const orphan = await this.orphanRepository.findOne(id);
		if (!orphan) {
			throw new NotFoundException();
		}
		await this.orphanRepository.remove(id);
	}

	async vote(id: string, stat: string, value: number): Promise<Orphan> {
		const orphan = await this.orphanRepository.findOne(id);
		if (!orphan) {
			throw new NotFoundException();
		}
		const nextScore = orphan[stat] + value * 0.15;
		if (nextScore >= 0 && nextScore <= 20) {
			orphan[stat] = nextScore;
			await this.update(id, { ...orphan, birthDate: orphan.birthDate.toISOString() });
		}
		return orphan;
	}
}
