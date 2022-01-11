import { AuthApiModule } from './api/auth-api/auth-api.module';
import { AuthModule } from './core/auth/auth.module';
import { Module } from '@nestjs/common';
import { OrphanApiModule } from './api/orphan-api/orphan-api.module';
import { OrphanModule } from './core/orphan/orphan.module';
import { SecurityModule } from './core/security/security.module';
import { SecurityService } from './core/security/security.service';
import { UserApiModule } from './api/user-api/user-api.module';
import { UserModule } from './core/user/user.module';
@Module({
	imports: [UserModule, AuthModule, SecurityModule, UserApiModule, AuthApiModule, OrphanModule, OrphanApiModule],
	controllers: [],
	providers: [SecurityService]
})
export class AppModule {}
