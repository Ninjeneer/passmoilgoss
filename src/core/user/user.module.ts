import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import UserRepository from './user.repository';
import { UserService } from './user.service';

@Module({
	providers: [UserService, UserRepository, PrismaService],
	exports: [UserService]
})
export class UserModule {}
