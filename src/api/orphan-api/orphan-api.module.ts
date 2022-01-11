import { Module } from '@nestjs/common';
import { OrphanController } from './orphan.controller';
import { OrphanModule } from '../../core/orphan/orphan.module';

@Module({
	controllers: [OrphanController],
	imports: [OrphanModule]
})
export class OrphanApiModule {}
