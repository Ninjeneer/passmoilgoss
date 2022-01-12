import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	NotFoundException,
	Param,
	Patch,
	Post,
	Req,
	UseInterceptors
} from '@nestjs/common';
import { Request } from 'express';
// import { TokenGuard } from '../../core/guards/token.guard';
import { UserService } from '../../core/user/user.service';
import {
	ApiBody,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags
} from '@nestjs/swagger';
import CreateUserDTO from '../../core/user/dto/create-user.dto';
import UpdateUserDTO from '../../core/user/dto/update-user.dto';
import User from '../../core/user/entities/user.entity';

@Controller('users')
@ApiTags('Users')
//@UseGuards(RoleGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Post()
	//@Roles(UserRole.ADMIN)
	@ApiBody({ type: CreateUserDTO })
	@ApiOperation({ summary: 'Create a user' })
	@ApiCreatedResponse({ description: 'User created successfully', type: User })
	@ApiConflictResponse({ description: 'User e-mail already exists' })
	async create(@Body() createUserDto: CreateUserDTO) {
		const user = await this.userService.create(createUserDto);
		return user;
	}

	@Get()
	//@Roles(UserRole.ADMIN)
	@ApiOperation({ summary: 'Retrieve all users' })
	@ApiOkResponse({ description: 'Successfully retrieved user list', type: [User] })
	async findAll() {
		return await this.userService.findAll();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Retrieve a user' })
	@ApiOkResponse({ description: 'Successfully retrieved user', type: User })
	@ApiNotFoundResponse({ description: 'User does not exists' })
	async findOne(@Param('id') id: string) {
		const user = await this.userService.findOne(id);
		if (!user) {
			throw new NotFoundException();
		}
		return user;
	}

	@Patch(':id')
	//@UseGuards(SelfGuard)
	@ApiBody({ type: UpdateUserDTO })
	@ApiOperation({ summary: 'Update a user' })
	@ApiOkResponse({ description: 'Successfully updated user', type: User })
	@ApiConflictResponse({ description: 'User e-mail already exists' })
	async update(@Req() request: Request, @Param('id') id: string, @Body() updateUserDto: UpdateUserDTO) {
		return await this.userService.update(id, updateUserDto);
	}

	@Delete(':id')
	//@UseGuards(SelfGuard)
	@ApiOperation({ summary: 'Delete a user' })
	@ApiOkResponse({ description: 'Successfully deleted user', type: User })
	@ApiNotFoundResponse({ description: 'User does not exists' })
	async remove(@Param('id') id: string) {
		return await this.userService.remove(id);
	}
}
