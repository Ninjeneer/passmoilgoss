import { Injectable, NotFoundException } from '@nestjs/common';
import OrphanRepository, { FindManyFilters } from './orphan.repository';

import { CreateOrphanDto } from './dto/create-orphan.dto';
import { UpdateOrphanDto } from './dto/update-orphan.dto';

@Injectable()
export class OrphanService {
	constructor(private readonly orphanRepository: OrphanRepository) {}

	async create(createOrphanDto: CreateOrphanDto) {
		return await this.orphanRepository.create(createOrphanDto);
	}

	async findAll(filters?: FindManyFilters, sort?: string) {
		return await this.orphanRepository.findAll(filters, sort);
	}

	async findOne(id: string) {
		return await this.orphanRepository.findOne(id);
	}

	async update(id: string, updateOrphanDto: UpdateOrphanDto) {
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
}
