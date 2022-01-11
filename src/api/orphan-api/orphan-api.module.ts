import { Module } from '@nestjs/common';
import { OrphanController } from './orphan.controller';

@Module({
	controllers: [OrphanController]
})
export class OrphanApiModule {}
