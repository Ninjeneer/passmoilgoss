import { Module } from '@nestjs/common';
import { OrphanService } from './orphan.service';

@Module({
	providers: [OrphanService]
})
export class OrphanModule {}
