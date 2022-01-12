import { Module } from '@nestjs/common';
import { OrphanApiModule } from './api/orphan-api/orphan-api.module';
import { OrphanModule } from './core/orphan/orphan.module';
import { UserApiModule } from './api/user-api/user-api.module';
import { UserModule } from './core/user/user.module';
@Module({
	imports: [UserModule, UserApiModule, OrphanModule, OrphanApiModule]
})
export class AppModule {}
