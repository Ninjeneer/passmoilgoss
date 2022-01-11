import { CreateOrphanDto } from './dto/create-orphan.dto';
import { Injectable } from '@nestjs/common';
import { UpdateOrphanDto } from './dto/update-orphan.dto';

@Injectable()
export class OrphanService {
	create(createOrphanDto: CreateOrphanDto) {
		return 'This action adds a new orphan';
	}

	findAll() {
		return `This action returns all orphan`;
	}

	findOne(id: number) {
		return `This action returns a #${id} orphan`;
	}

	update(id: number, updateOrphanDto: UpdateOrphanDto) {
		return `This action updates a #${id} orphan`;
	}

	remove(id: number) {
		return `This action removes a #${id} orphan`;
	}
}
