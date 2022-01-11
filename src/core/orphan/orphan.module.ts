import { Module } from '@nestjs/common';
import OrphanRepository from './orphan.repository';
import { OrphanService } from './orphan.service';
import { PrismaService } from '../../prisma.service';

@Module({
	providers: [OrphanService, OrphanRepository, PrismaService],
	exports: [OrphanService]
})
export class OrphanModule {}
